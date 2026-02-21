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
  "category": "top|bottom|shoes|outerwear|full_body|accessory",
  "description": "2-6 word description: color, material, garment type (e.g. 'olive linen button-down', 'dark wash slim jeans')",
  "item_type": "tshirt|shirt|polo|sweater|hoodie|tank_top|blouse|crop_top|jacket|blazer|coat|vest|cardigan|jeans|chinos|trousers|shorts|skirt|leggings|dress|jumpsuit|romper|suit|sneakers|boots|dress_shoes|loafers|sandals|heels|flats|belt|watch|tie|bow_tie|hat|scarf|sunglasses|necklace|bracelet|earrings|ring|bag|backpack|pocket_square|cufflinks|gloves|other",
  "colors": ["specific colors with shades"],
  "pattern": "solid|striped|plaid|checkered|floral|geometric|print|other",
  "material": "cotton|wool|linen|denim|leather|polyester|silk|etc",
  "formality": "casual|smart_casual|business_casual|formal"
}
Only respond with JSON."""

    @staticmethod
    def _build_wardrobe_labels(wardrobe: list[dict]) -> list[str]:
        """Build unique labels for each wardrobe item, preferring description."""
        labels = []
        seen = {}
        for i in wardrobe:
            desc = (i.get('description') or '').strip()
            if desc:
                label = desc.lower()
            else:
                # Build a rich label from available metadata
                parts = []
                colors = i.get('colors') or []
                if colors:
                    parts.append(colors[0].lower())
                material = (i.get('material') or '').strip()
                if material:
                    parts.append(material.lower().replace('_', ' '))
                pattern = (i.get('pattern') or '').strip()
                if pattern and pattern != 'solid':
                    parts.append(pattern.lower().replace('_', ' '))
                item_type = (i.get('item_type') or 'item').replace('_', ' ')
                parts.append(item_type)
                formality = (i.get('formality') or '').strip()
                if formality and formality != 'casual':
                    parts.append(f"({formality.replace('_', ' ')})")
                label = ' '.join(parts)
            # Deduplicate by appending formality
            if label in seen:
                seen[label] += 1
                label = f"{label} ({i.get('formality', 'casual')})"
            else:
                seen[label] = 1
            labels.append(label)
        return labels

    def _get_outfit_prompt(self, wardrobe: list[dict], occasion: str) -> str:
        from wardrobe.models import ClothingItem

        labels = self._build_wardrobe_labels(wardrobe)
        # Group items by category for clearer context
        category_groups = {
            'TOPS': [], 'BOTTOMS': [], 'SHOES': [], 'OUTERWEAR': [],
            'FULL BODY': [], 'ACCESSORIES': [],
        }
        category_to_header = {
            'top': 'TOPS', 'bottom': 'BOTTOMS', 'shoes': 'SHOES',
            'outerwear': 'OUTERWEAR', 'full_body': 'FULL BODY',
            'accessory': 'ACCESSORIES',
        }
        for label, item in zip(labels, wardrobe):
            cat = item.get('category') or ClothingItem.ITEM_TYPE_TO_CATEGORY.get(item.get('item_type', ''), '')
            header = category_to_header.get(cat, 'ACCESSORIES')
            category_groups[header].append(label)

        wardrobe_section = ''
        for header, items in category_groups.items():
            if items:
                wardrobe_section += f'{header}:\n'
                wardrobe_section += '\n'.join(f'- "{label}"' for label in items)
                wardrobe_section += '\n\n'

        return f"""You are a personal stylist with over 10 years of experience. Suggest 2-3 outfits for: "{occasion}"

RULES:
- Every outfit MUST include at least one top, one bottom, and one pair of shoes (or a full body item plus shoes).
- Always include a belt when the outfit has pants (jeans, chinos, trousers).
- You MUST only use items from the wardrobe below. Do NOT invent items.

WARDROBE:
{wardrobe_section}
Respond in JSON. Each item string must be copied exactly from the wardrobe list above. Write the explanation in a natural, conversational tone as if advising a client. Briefly explain why each piece was chosen and why they work together stylistically for the occasion:
{{"suggestions": [{{"items": ["olive linen button-down", "dark wash slim jeans", "brown leather boots", "brown woven belt"], "explanation": "The olive linen button-down brings a rich, earthy tone that's perfect for a casual dinner. Dark wash slim jeans keep things relaxed but put-together, and the brown leather boots ground the outfit with a rugged edge. The brown woven belt ties the leather tones together. Overall, the earth tones create a cohesive, warm palette that feels effortlessly stylish."}}]}}
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
        return {
            'category': 'top', 'description': 'unknown clothing item',
            'item_type': 'other', 'colors': ['unknown'], 'pattern': 'solid',
            'material': '', 'formality': 'casual',
        }

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


class ClaudeProvider(AIProvider):
    """Uses Anthropic Messages API directly via httpx (avoids pydantic/Python 3.14 issues)."""

    API_URL = "https://api.anthropic.com/v1/messages"

    def __init__(self):
        self.api_key = settings.ANTHROPIC_API_KEY
        self.model = settings.CLAUDE_MODEL
        self.headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        }

    def _image_media_type(self, image_path: str) -> str:
        suffix = Path(image_path).suffix.lower().lstrip('.')
        return f"image/{'jpeg' if suffix in ('jpg', 'jpeg') else suffix}"

    def analyze_clothing(self, image_path: str) -> dict:
        import httpx
        image_b64 = base64.b64encode(Path(image_path).read_bytes()).decode()
        media_type = self._image_media_type(image_path)
        response = httpx.post(self.API_URL, headers=self.headers, json={
            "model": self.model,
            "max_tokens": 1024,
            "messages": [{
                "role": "user",
                "content": [
                    {"type": "image", "source": {"type": "base64", "media_type": media_type, "data": image_b64}},
                    {"type": "text", "text": self._get_analysis_prompt()},
                ],
            }],
        }, timeout=180.0)
        response.raise_for_status()
        return self._parse_json(response.json()["content"][0]["text"])

    def suggest_outfits(self, wardrobe: list[dict], occasion: str) -> list[dict]:
        import httpx
        response = httpx.post(self.API_URL, headers=self.headers, json={
            "model": self.model,
            "max_tokens": 2048,
            "messages": [{"role": "user", "content": self._get_outfit_prompt(wardrobe, occasion)}],
        }, timeout=180.0)
        response.raise_for_status()
        return self._parse_json(response.json()["content"][0]["text"]).get('suggestions', [])

    def suggest_outfits_stream(self, wardrobe: list[dict], occasion: str):
        import httpx
        with httpx.stream("POST", self.API_URL, headers=self.headers, json={
            "model": self.model,
            "max_tokens": 2048,
            "stream": True,
            "messages": [{"role": "user", "content": self._get_outfit_prompt(wardrobe, occasion)}],
        }, timeout=180.0) as response:
            response.raise_for_status()
            for line in response.iter_lines():
                if not line or not line.startswith("data: "):
                    continue
                data = line[6:]
                if data == "[DONE]":
                    break
                chunk = json.loads(data)
                if chunk.get("type") == "content_block_delta":
                    text = chunk.get("delta", {}).get("text", "")
                    if text:
                        yield text


class HuggingFaceProvider(AIProvider):
    def __init__(self):
        from huggingface_hub import InferenceClient
        self.client = InferenceClient(
            provider="auto",
            api_key=settings.HUGGINGFACE_API_KEY,
            timeout=180,
        )
        self.vision_model = settings.HUGGINGFACE_VISION_MODEL
        self.text_model = settings.HUGGINGFACE_TEXT_MODEL

    def analyze_clothing(self, image_path: str) -> dict:
        image_b64 = base64.b64encode(Path(image_path).read_bytes()).decode()
        suffix = Path(image_path).suffix.lower().lstrip('.')
        media_type = f"image/{'jpeg' if suffix in ('jpg', 'jpeg') else suffix}"
        response = self.client.chat_completion(
            model=self.vision_model,
            messages=[{
                "role": "user",
                "content": [
                    {"type": "image_url", "image_url": {"url": f"data:{media_type};base64,{image_b64}"}},
                    {"type": "text", "text": self._get_analysis_prompt()},
                ],
            }],
            max_tokens=1024,
        )
        return self._parse_json(response.choices[0].message.content)

    def suggest_outfits(self, wardrobe: list[dict], occasion: str) -> list[dict]:
        response = self.client.chat_completion(
            model=self.text_model,
            messages=[{"role": "user", "content": self._get_outfit_prompt(wardrobe, occasion)}],
            max_tokens=2048,
        )
        return self._parse_json(response.choices[0].message.content).get('suggestions', [])

    def suggest_outfits_stream(self, wardrobe: list[dict], occasion: str):
        stream = self.client.chat_completion(
            model=self.text_model,
            messages=[{"role": "user", "content": self._get_outfit_prompt(wardrobe, occasion)}],
            max_tokens=2048,
            stream=True,
        )
        for chunk in stream:
            if chunk.choices and chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content


def get_ai_provider() -> AIProvider:
    provider = getattr(settings, 'AI_PROVIDER', 'placeholder')
    if provider == 'ollama':
        return OllamaProvider()
    if provider == 'claude':
        return ClaudeProvider()
    if provider == 'huggingface':
        return HuggingFaceProvider()
    return PlaceholderProvider()
