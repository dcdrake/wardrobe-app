"""AI providers for clothing analysis and outfit suggestions."""

import base64
import json
from abc import ABC, abstractmethod
from pathlib import Path
from django.conf import settings


class AIProvider(ABC):
    @abstractmethod
    def analyze_clothing(self, image_path: str) -> dict:
        pass
    
    @abstractmethod
    def suggest_outfits(self, wardrobe: list[dict], occasion: str) -> list[dict]:
        pass
    
    def _get_analysis_prompt(self) -> str:
        return """Analyze this clothing item. Respond in JSON:
{
  "item_type": "tshirt|shirt|polo|sweater|hoodie|jacket|blazer|coat|jeans|chinos|trousers|shorts|sneakers|boots|dress_shoes|loafers|sandals|belt|watch|tie|hat|scarf|other",
  "colors": ["specific colors with shades"],
  "pattern": "solid|striped|plaid|checkered|floral|geometric|print|other",
  "material": "cotton|wool|linen|denim|leather|polyester|silk|etc",
  "formality": "casual|smart_casual|business_casual|formal"
}
Only respond with JSON."""

    def _get_outfit_prompt(self, wardrobe: list[dict], occasion: str) -> str:
        items = json.dumps([{'id': i['id'], 'type': i['item_type'], 'colors': i['colors'], 'formality': i['formality']} for i in wardrobe], indent=2)
        return f"""Suggest 2-3 outfits for: "{occasion}"

WARDROBE:
{items}

Respond in JSON:
{{"suggestions": [{{"item_ids": ["id1", "id2"], "explanation": "Why this works"}}]}}
Only respond with JSON."""

    def _parse_json(self, text: str) -> dict:
        text = text.strip()
        if '```json' in text:
            text = text.split('```json')[1].split('```')[0]
        elif '```' in text:
            text = text.split('```')[1].split('```')[0]
        return json.loads(text.strip())


class PlaceholderProvider(AIProvider):
    def analyze_clothing(self, image_path: str) -> dict:
        return {'item_type': 'other', 'colors': ['unknown'], 'pattern': 'solid', 'material': '', 'formality': 'casual'}
    
    def suggest_outfits(self, wardrobe: list[dict], occasion: str) -> list[dict]:
        return [{'item_ids': [i['id'] for i in wardrobe[:3]], 'explanation': f'Placeholder for "{occasion}"'}]


class OllamaProvider(AIProvider):
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL
        self.model = settings.OLLAMA_MODEL
    
    def analyze_clothing(self, image_path: str) -> dict:
        import httpx
        image_b64 = base64.b64encode(Path(image_path).read_bytes()).decode()
        response = httpx.post(f"{self.base_url}/api/generate", json={
            "model": self.model, "prompt": self._get_analysis_prompt(),
            "images": [image_b64], "stream": False
        }, timeout=60.0)
        return self._parse_json(response.json().get('response', '{}'))
    
    def suggest_outfits(self, wardrobe: list[dict], occasion: str) -> list[dict]:
        import httpx
        response = httpx.post(f"{self.base_url}/api/generate", json={
            "model": self.model.replace('-vision', ''),
            "prompt": self._get_outfit_prompt(wardrobe, occasion), "stream": False
        }, timeout=60.0)
        return self._parse_json(response.json().get('response', '{}')).get('suggestions', [])


def get_ai_provider() -> AIProvider:
    provider = getattr(settings, 'AI_PROVIDER', 'placeholder')
    if provider == 'ollama':
        return OllamaProvider()
    return PlaceholderProvider()
