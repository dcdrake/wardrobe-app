import json

import httpx
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.parsers import JSONParser
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.core.files.uploadedfile import SimpleUploadedFile
from django.http import StreamingHttpResponse

from .models import ClothingItem, OutfitSuggestion
from .serializers import (
    ClothingItemSerializer, ClothingItemCreateSerializer,
    ClothingItemUpdateSerializer, OutfitRequestSerializer,
)
from .image_utils import compress_image
from ai.providers import get_ai_provider


class ClothingItemViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ClothingItem.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action == 'create':
            return ClothingItemCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return ClothingItemUpdateSerializer
        return ClothingItemSerializer

    def perform_create(self, serializer):
        image = self.request.FILES.get('image')
        if image:
            serializer.validated_data['image'] = compress_image(image)

        item = serializer.save()

        if not serializer.validated_data.get('item_type') or not serializer.validated_data.get('colors'):
            self._run_ai_analysis(item)

    def _run_ai_analysis(self, item):
        try:
            provider = get_ai_provider()
            analysis = provider.analyze_clothing(item.image.path)

            if not item.item_type:
                item.item_type = analysis.get('item_type', ClothingItem.ItemType.OTHER)
            if not item.colors:
                item.colors = analysis.get('colors', [])
            if item.pattern == ClothingItem.Pattern.SOLID:
                item.pattern = analysis.get('pattern', ClothingItem.Pattern.SOLID)
            if not item.material:
                item.material = analysis.get('material', '')
            if item.formality == ClothingItem.Formality.CASUAL:
                item.formality = analysis.get('formality', ClothingItem.Formality.CASUAL)

            item.ai_analysis = analysis
            item.save()
        except Exception as e:
            print(f"AI analysis failed: {e}")

    @action(detail=False, methods=['post'], url_path='batch-upload')
    def batch_upload(self, request):
        images = request.FILES.getlist('images')
        if not images:
            return Response({'error': 'No images provided'}, status=status.HTTP_400_BAD_REQUEST)
        if len(images) > 20:
            return Response({'error': 'Maximum 20 images allowed'}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        total = len(images)

        def event_stream():
            count = 0
            for index, image_file in enumerate(images):
                try:
                    compressed = compress_image(image_file)
                    item = ClothingItem.objects.create(user=user, image=compressed)
                    self._run_ai_analysis(item)
                    item.refresh_from_db()
                    serializer = ClothingItemSerializer(item, context={'request': request})
                    yield f"event: item\ndata: {json.dumps({'index': index, 'total': total, 'item': serializer.data})}\n\n"
                    count += 1
                except Exception as e:
                    yield f"event: error\ndata: {json.dumps({'index': index, 'message': str(e)})}\n\n"
            yield f"event: done\ndata: {json.dumps({'count': count})}\n\n"

        response = StreamingHttpResponse(event_stream(), content_type='text/event-stream')
        response['Cache-Control'] = 'no-cache'
        response['X-Accel-Buffering'] = 'no'
        return response

    def _download_google_photo(self, photo, access_token):
        file_id = photo['id']
        url = f"https://www.googleapis.com/drive/v3/files/{file_id}?alt=media"
        with httpx.Client(timeout=30) as client:
            resp = client.get(url, headers={"Authorization": f"Bearer {access_token}"})
            resp.raise_for_status()
        filename = photo.get('name', 'photo.jpg')
        ext = filename.rsplit('.', 1)[-1] if '.' in filename else 'jpg'
        content_type = resp.headers.get("content-type", f"image/{ext}")
        return SimpleUploadedFile(filename, resp.content, content_type=content_type)

    @action(detail=False, methods=['post'], url_path='google-photos-upload',
            parser_classes=[JSONParser])
    def google_photos_upload(self, request):
        access_token = request.data.get('access_token', '')
        photos = request.data.get('photos', [])

        if not access_token:
            return Response({'error': 'access_token is required'}, status=status.HTTP_400_BAD_REQUEST)
        if not photos or len(photos) > 20:
            return Response(
                {'error': 'Provide between 1 and 20 photos'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = request.user
        total = len(photos)

        def event_stream():
            count = 0
            for index, photo in enumerate(photos):
                try:
                    downloaded = self._download_google_photo(photo, access_token)
                    compressed = compress_image(downloaded)
                    item = ClothingItem.objects.create(user=user, image=compressed)
                    self._run_ai_analysis(item)
                    item.refresh_from_db()
                    serializer = ClothingItemSerializer(item, context={'request': request})
                    yield f"event: item\ndata: {json.dumps({'index': index, 'total': total, 'item': serializer.data})}\n\n"
                    count += 1
                except Exception as e:
                    yield f"event: error\ndata: {json.dumps({'index': index, 'message': str(e)})}\n\n"
            yield f"event: done\ndata: {json.dumps({'count': count})}\n\n"

        response = StreamingHttpResponse(event_stream(), content_type='text/event-stream')
        response['Cache-Control'] = 'no-cache'
        response['X-Accel-Buffering'] = 'no'
        return response

    @action(detail=True, methods=['post'])
    def analyze(self, request, pk=None):
        item = self.get_object()
        self._run_ai_analysis(item)
        return Response(ClothingItemSerializer(item, context={'request': request}).data)


class OutfitSuggestionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return OutfitSuggestion.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'])
    def suggest(self, request):
        serializer = OutfitRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        occasion = serializer.validated_data['occasion']
        wardrobe = ClothingItem.objects.filter(user=request.user)
        wardrobe_data = ClothingItemSerializer(wardrobe, many=True, context={'request': request}).data

        if not wardrobe_data:
            return Response({'error': 'No items in wardrobe'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            provider = get_ai_provider()
            suggestions = provider.suggest_outfits(wardrobe_data, occasion)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        outfit = OutfitSuggestion.objects.create(user=request.user, occasion=occasion, suggestions=suggestions)
        return Response({'id': outfit.id, 'occasion': occasion, 'suggestions': suggestions})

    @action(detail=False, methods=['post'], url_path='suggest-stream')
    def suggest_stream(self, request):
        serializer = OutfitRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        occasion = serializer.validated_data['occasion']
        wardrobe = ClothingItem.objects.filter(user=request.user)
        wardrobe_data = ClothingItemSerializer(wardrobe, many=True, context={'request': request}).data

        if not wardrobe_data:
            return Response({'error': 'No items in wardrobe'}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        provider = get_ai_provider()

        def event_stream():
            full_text = ""
            try:
                for token in provider.suggest_outfits_stream(wardrobe_data, occasion):
                    full_text += token
                    yield f"event: token\ndata: {json.dumps({'token': token})}\n\n"

                parsed = provider._parse_json(full_text)
                suggestions = parsed.get('suggestions', [])
                outfit = OutfitSuggestion.objects.create(
                    user=user, occasion=occasion, suggestions=suggestions
                )
                yield f"event: done\ndata: {json.dumps({'id': str(outfit.id), 'occasion': occasion, 'suggestions': suggestions})}\n\n"
            except Exception as e:
                yield f"event: error\ndata: {json.dumps({'error': str(e)})}\n\n"

        response = StreamingHttpResponse(event_stream(), content_type='text/event-stream')
        response['Cache-Control'] = 'no-cache'
        response['X-Accel-Buffering'] = 'no'
        return response
