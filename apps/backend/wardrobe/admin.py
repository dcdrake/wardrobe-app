from django.contrib import admin
from .models import ClothingItem, OutfitSuggestion


@admin.register(ClothingItem)
class ClothingItemAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'item_type', 'pattern', 'formality', 'created_at']
    list_filter = ['item_type', 'pattern', 'formality']
    search_fields = ['user__email', 'brand']


@admin.register(OutfitSuggestion)
class OutfitSuggestionAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'occasion', 'created_at']
    list_filter = ['created_at']
