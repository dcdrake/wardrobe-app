from io import BytesIO
from PIL import Image
from django.core.files.base import ContentFile
from django.conf import settings


def compress_image(image_file, max_dimension=None):
    if max_dimension is None:
        max_dimension = getattr(settings, 'MAX_IMAGE_DIMENSION', 800)
    
    img = Image.open(image_file)
    
    if img.mode in ('RGBA', 'P'):
        img = img.convert('RGB')
    
    if max(img.size) > max_dimension:
        ratio = max_dimension / max(img.size)
        new_size = tuple(int(dim * ratio) for dim in img.size)
        img = img.resize(new_size, Image.Resampling.LANCZOS)
    
    output = BytesIO()
    img.save(output, format='WEBP', quality=85)
    output.seek(0)
    
    original_name = image_file.name.rsplit('.', 1)[0]
    return ContentFile(output.read(), name=f"{original_name}.webp")
