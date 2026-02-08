from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

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
