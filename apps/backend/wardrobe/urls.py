from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClothingItemViewSet, OutfitSuggestionViewSet

router = DefaultRouter()
router.register(r'wardrobe', ClothingItemViewSet, basename='wardrobe')
router.register(r'outfits', OutfitSuggestionViewSet, basename='outfits')

urlpatterns = [
    path('', include(router.urls)),
]
