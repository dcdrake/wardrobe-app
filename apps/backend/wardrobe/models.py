import uuid
from django.db import models
from django.conf import settings


class ClothingItem(models.Model):
    class ItemType(models.TextChoices):
        TSHIRT = 'tshirt', 'T-Shirt'
        SHIRT = 'shirt', 'Dress Shirt'
        POLO = 'polo', 'Polo Shirt'
        SWEATER = 'sweater', 'Sweater'
        HOODIE = 'hoodie', 'Hoodie'
        JACKET = 'jacket', 'Jacket'
        BLAZER = 'blazer', 'Blazer'
        COAT = 'coat', 'Coat'
        JEANS = 'jeans', 'Jeans'
        CHINOS = 'chinos', 'Chinos'
        TROUSERS = 'trousers', 'Dress Trousers'
        SHORTS = 'shorts', 'Shorts'
        SNEAKERS = 'sneakers', 'Sneakers'
        BOOTS = 'boots', 'Boots'
        DRESS_SHOES = 'dress_shoes', 'Dress Shoes'
        LOAFERS = 'loafers', 'Loafers'
        SANDALS = 'sandals', 'Sandals'
        BELT = 'belt', 'Belt'
        WATCH = 'watch', 'Watch'
        TIE = 'tie', 'Tie'
        HAT = 'hat', 'Hat'
        SCARF = 'scarf', 'Scarf'
        OTHER = 'other', 'Other'
    
    class Pattern(models.TextChoices):
        SOLID = 'solid', 'Solid'
        STRIPED = 'striped', 'Striped'
        PLAID = 'plaid', 'Plaid'
        CHECKERED = 'checkered', 'Checkered'
        FLORAL = 'floral', 'Floral'
        GEOMETRIC = 'geometric', 'Geometric'
        PRINT = 'print', 'Print'
        OTHER = 'other', 'Other'
    
    class Formality(models.TextChoices):
        CASUAL = 'casual', 'Casual'
        SMART_CASUAL = 'smart_casual', 'Smart Casual'
        BUSINESS_CASUAL = 'business_casual', 'Business Casual'
        FORMAL = 'formal', 'Formal'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='clothing_items')
    image = models.ImageField(upload_to='clothing/%Y/%m/')
    item_type = models.CharField(max_length=20, choices=ItemType.choices, blank=True)
    colors = models.JSONField(default=list)
    pattern = models.CharField(max_length=20, choices=Pattern.choices, default=Pattern.SOLID)
    material = models.CharField(max_length=50, blank=True)
    formality = models.CharField(max_length=20, choices=Formality.choices, default=Formality.CASUAL)
    brand = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    ai_analysis = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_item_type_display()} - {', '.join(self.colors[:2])}"


class OutfitSuggestion(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='outfit_suggestions')
    occasion = models.TextField()
    suggestions = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
