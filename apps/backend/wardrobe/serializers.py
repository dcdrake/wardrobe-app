from rest_framework import serializers
from .models import ClothingItem, OutfitSuggestion


class ClothingItemSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    item_type_display = serializers.CharField(source='get_item_type_display', read_only=True)
    pattern_display = serializers.CharField(source='get_pattern_display', read_only=True)
    formality_display = serializers.CharField(source='get_formality_display', read_only=True)
    
    class Meta:
        model = ClothingItem
        fields = [
            'id', 'image', 'image_url', 'item_type', 'item_type_display',
            'colors', 'pattern', 'pattern_display', 'material',
            'formality', 'formality_display', 'brand', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None


class ClothingItemCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClothingItem
        fields = ['image', 'item_type', 'colors', 'pattern', 'material', 'formality', 'brand', 'notes']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class ClothingItemUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClothingItem
        fields = ['item_type', 'colors', 'pattern', 'material', 'formality', 'brand', 'notes']


class OutfitRequestSerializer(serializers.Serializer):
    occasion = serializers.CharField(max_length=500)
