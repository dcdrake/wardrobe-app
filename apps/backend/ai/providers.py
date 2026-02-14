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

    def suggest_outfits_stream(self, wardrobe: list[dict], occasion: str):
        """Yield tokens as they stream from the model. Default falls back to non-streaming."""
        result = self.suggest_outfits(wardrobe, occasion)
        yield json.dumps({"suggestions": result})

    def _get_analysis_prompt(self) -> str:
        return """Analyze this clothing item. Respond in JSON:
{
  "item_type": "tshirt|shirt|polo|sweater|hoodie|tank_top|blouse|crop_top|jacket|blazer|coat|vest|cardigan|jeans|chinos|trousers|shorts|skirt|leggings|dress|jumpsuit|romper|suit|sneakers|boots|dress_shoes|loafers|sandals|heels|flats|belt|watch|tie|bow_tie|hat|scarf|sunglasses|necklace|bracelet|earrings|ring|bag|backpack|pocket_square|cufflinks|gloves|other",
  "colors": ["specific colors with shades"],
  "pattern": "solid|striped|plaid|checkered|floral|geometric|print|other",
  "material": "cotton|wool|linen|denim|leather|polyester|silk|etc",
  "formality": "casual|smart_casual|business_casual|formal"
}
Only respond with JSON."""

    @staticmethod
    def _build_wardrobe_labels(wardrobe: list[dict]) -> list[str]:
        """Build unique labels like 'dark green shirt' for each wardrobe item."""
        labels = []
        seen = {}
        for i in wardrobe:
            color = (i.get('colors') or [''])[0].lower()
            item_type = (i.get('item_type') or 'item').replace('_', ' ')
            label = f"{color} {item_type}".strip()
            # Deduplicate by appending formality
            if label in seen:
                seen[label] += 1
                label = f"{label} ({i.get('formality', 'casual')})"
            else:
                seen[label] = 1
            labels.append(label)
        return labels

    def _get_outfit_prompt(self, wardrobe: list[dict], occasion: str) -> str:
        labels = self._build_wardrobe_labels(wardrobe)
        items_list = '\n'.join(f'- "{label}"' for label in labels)
        return f"""You are a personal stylist with over 10 years of experience. Suggest 2-3 outfits for: "{occasion}"

CATEGORIES:
- Tops: tshirt, shirt, polo, sweater, hoodie, tank top, blouse, crop top
- Bottoms: jeans, chinos, trousers, shorts, skirt, leggings
- Shoes: sneakers, boots, dress shoes, loafers, sandals, heels, flats
- Outerwear: jacket, blazer, coat, vest, cardigan
- Full body (replaces top+bottom): dress, jumpsuit, romper, suit
- Accessories: belt, watch, tie, bow tie, hat, scarf, sunglasses, necklace, bracelet, earrings, ring, bag, backpack, pocket square, cufflinks, gloves

RULES:
- Every outfit MUST include at least one top, one bottom, and one pair of shoes (or a full body item plus shoes).
- Always include a belt when the outfit has pants (jeans, chinos, trousers).
- You MUST only use items from the list below. Do NOT invent items.

WARDROBE:
{items_list}

Respond in JSON. Each item string must be copied exactly from the wardrobe list above. Write the explanation in a natural, conversational tone as if advising a client:
{{"suggestions": [{{"items": ["dark green shirt", "brown chinos", "brown boots", "gray belt"], "explanation": "This outfit pairs a crisp shirt with tailored chinos and leather boots for a polished but relaxed look. The belt ties it all together."}}]}}
Only respond with JSON."""

    def _parse_json(self, text: str) -> dict:
        text = text.strip()
        # Strip <think>...</think> blocks from reasoning models
        import re
        text = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL).strip()
        if '```json' in text:
            text = text.split('```json')[1].split('```')[0]
        elif '```' in text:
            text = text.split('```')[1].split('```')[0]
        return json.loads(text.strip())


class PlaceholderProvider(AIProvider):
    def analyze_clothing(self, image_path: str) -> dict:
        return {'item_type': 'other', 'colors': ['unknown'], 'pattern': 'solid', 'material': '', 'formality': 'casual'}

    def suggest_outfits(self, wardrobe: list[dict], occasion: str) -> list[dict]:
        labels = self._build_wardrobe_labels(wardrobe)[:3]
        return [{'items': labels, 'explanation': f'Placeholder for "{occasion}"'}]


class OllamaProvider(AIProvider):
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL
        self.model = settings.OLLAMA_MODEL
        self.text_model = settings.OLLAMA_TEXT_MODEL

    def analyze_clothing(self, image_path: str) -> dict:
        import httpx
        image_b64 = base64.b64encode(Path(image_path).read_bytes()).decode()
        response = httpx.post(f"{self.base_url}/api/generate", json={
            "model": self.model,
            "prompt": "/no_think " + self._get_analysis_prompt(),
            "images": [image_b64], "stream": False,
        }, timeout=180.0)
        return self._parse_json(response.json().get('response', '{}'))

    def suggest_outfits(self, wardrobe: list[dict], occasion: str) -> list[dict]:
        import httpx
        response = httpx.post(f"{self.base_url}/api/generate", json={
            "model": self.text_model,
            "prompt": "/no_think " + self._get_outfit_prompt(wardrobe, occasion),
            "stream": False,
        }, timeout=180.0)
        return self._parse_json(response.json().get('response', '{}')).get('suggestions', [])

    def suggest_outfits_stream(self, wardrobe: list[dict], occasion: str):
        import httpx
        with httpx.stream("POST", f"{self.base_url}/api/generate", json={
            "model": self.text_model,
            "prompt": "/no_think " + self._get_outfit_prompt(wardrobe, occasion),
            "stream": True,
        }, timeout=180.0) as response:
            for line in response.iter_lines():
                if not line:
                    continue
                chunk = json.loads(line)
                token = chunk.get("response", "")
                if token:
                    yield token
                if chunk.get("done"):
                    break


def get_ai_provider() -> AIProvider:
    provider = getattr(settings, 'AI_PROVIDER', 'placeholder')
    if provider == 'ollama':
        return OllamaProvider()
    return PlaceholderProvider()
