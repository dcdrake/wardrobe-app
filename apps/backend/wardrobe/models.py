import uuid
from django.db import models
from django.conf import settings


class ClothingItem(models.Model):
    class Category(models.TextChoices):
        TOP = 'top', 'Top'
        BOTTOM = 'bottom', 'Bottom'
        SHOES = 'shoes', 'Shoes'
        OUTERWEAR = 'outerwear', 'Outerwear'
        FULL_BODY = 'full_body', 'Full Body'
        ACCESSORY = 'accessory', 'Accessory'

    ITEM_TYPE_TO_CATEGORY = {
        # Tops
        'tshirt': 'top', 'shirt': 'top', 'polo': 'top', 'sweater': 'top',
        'hoodie': 'top', 'tank_top': 'top', 'blouse': 'top', 'crop_top': 'top',
        # Outerwear
        'jacket': 'outerwear', 'blazer': 'outerwear', 'coat': 'outerwear',
        'vest': 'outerwear', 'cardigan': 'outerwear',
        # Bottoms
        'jeans': 'bottom', 'chinos': 'bottom', 'trousers': 'bottom',
        'shorts': 'bottom', 'skirt': 'bottom', 'leggings': 'bottom',
        # Full body
        'dress': 'full_body', 'jumpsuit': 'full_body', 'romper': 'full_body',
        'suit': 'full_body',
        # Shoes
        'sneakers': 'shoes', 'boots': 'shoes', 'dress_shoes': 'shoes',
        'loafers': 'shoes', 'sandals': 'shoes', 'heels': 'shoes', 'flats': 'shoes',
        # Accessories
        'belt': 'accessory', 'watch': 'accessory', 'tie': 'accessory',
        'bow_tie': 'accessory', 'hat': 'accessory', 'scarf': 'accessory',
        'sunglasses': 'accessory', 'necklace': 'accessory', 'bracelet': 'accessory',
        'earrings': 'accessory', 'ring': 'accessory', 'bag': 'accessory',
        'backpack': 'accessory', 'pocket_square': 'accessory',
        'cufflinks': 'accessory', 'gloves': 'accessory',
    }

    class ItemType(models.TextChoices):
        # Tops
        TSHIRT = 'tshirt', 'T-Shirt'
        SHIRT = 'shirt', 'Dress Shirt'
        POLO = 'polo', 'Polo Shirt'
        SWEATER = 'sweater', 'Sweater'
        HOODIE = 'hoodie', 'Hoodie'
        TANK_TOP = 'tank_top', 'Tank Top'
        BLOUSE = 'blouse', 'Blouse'
        CROP_TOP = 'crop_top', 'Crop Top'
        # Outerwear
        JACKET = 'jacket', 'Jacket'
        BLAZER = 'blazer', 'Blazer'
        COAT = 'coat', 'Coat'
        VEST = 'vest', 'Vest'
        CARDIGAN = 'cardigan', 'Cardigan'
        # Bottoms
        JEANS = 'jeans', 'Jeans'
        CHINOS = 'chinos', 'Chinos'
        TROUSERS = 'trousers', 'Dress Trousers'
        SHORTS = 'shorts', 'Shorts'
        SKIRT = 'skirt', 'Skirt'
        LEGGINGS = 'leggings', 'Leggings'
        # Full body
        DRESS = 'dress', 'Dress'
        JUMPSUIT = 'jumpsuit', 'Jumpsuit'
        ROMPER = 'romper', 'Romper'
        SUIT = 'suit', 'Suit'
        # Footwear
        SNEAKERS = 'sneakers', 'Sneakers'
        BOOTS = 'boots', 'Boots'
        DRESS_SHOES = 'dress_shoes', 'Dress Shoes'
        LOAFERS = 'loafers', 'Loafers'
        SANDALS = 'sandals', 'Sandals'
        HEELS = 'heels', 'Heels'
        FLATS = 'flats', 'Flats'
        # Accessories
        BELT = 'belt', 'Belt'
        WATCH = 'watch', 'Watch'
        TIE = 'tie', 'Tie'
        BOW_TIE = 'bow_tie', 'Bow Tie'
        HAT = 'hat', 'Hat'
        SCARF = 'scarf', 'Scarf'
        SUNGLASSES = 'sunglasses', 'Sunglasses'
        NECKLACE = 'necklace', 'Necklace'
        BRACELET = 'bracelet', 'Bracelet'
        EARRINGS = 'earrings', 'Earrings'
        RING = 'ring', 'Ring'
        BAG = 'bag', 'Bag'
        BACKPACK = 'backpack', 'Backpack'
        POCKET_SQUARE = 'pocket_square', 'Pocket Square'
        CUFFLINKS = 'cufflinks', 'Cufflinks'
        GLOVES = 'gloves', 'Gloves'
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
    item_type = models.CharField(max_length=30, choices=ItemType.choices, blank=True)
    category = models.CharField(max_length=20, choices=Category.choices, blank=True)
    description = models.CharField(max_length=200, blank=True)
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
        db_table = 'wardrobe_clothing_item'
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
        db_table = 'wardrobe_outfit_suggestion'
        ordering = ['-created_at']
