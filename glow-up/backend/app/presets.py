"""Hairstyle preset definitions — prompt engineering for Gemini image editing."""

PRESETS = {
    "femme": {
        "curtain-bangs": {
            "name": "Curtain Bangs",
            "emoji": "🌊",
            "prompt": (
                "Edit this photo to give the person soft, face-framing curtain bangs. "
                "Keep the same face, expression, skin tone, background, and clothing. "
                "Only change the hairstyle. Make it look natural and photorealistic."
            ),
        },
        "chic-pixie": {
            "name": "Chic Pixie",
            "emoji": "✂️",
            "prompt": (
                "Edit this photo to give the person a short, modern pixie cut hairstyle. "
                "Keep the same face, expression, skin tone, background, and clothing. "
                "Only change the hairstyle. Make it look natural and photorealistic."
            ),
        },
        "soft-waves": {
            "name": "Soft Waves",
            "emoji": "🌀",
            "prompt": (
                "Edit this photo to give the person loose, flowing beachy waves at medium length. "
                "Keep the same face, expression, skin tone, background, and clothing. "
                "Only change the hairstyle. Make it look natural and photorealistic."
            ),
        },
        "sleek-bob": {
            "name": "Sleek Bob",
            "emoji": "🎀",
            "prompt": (
                "Edit this photo to give the person a chin-length sleek bob haircut. "
                "Keep the same face, expression, skin tone, background, and clothing. "
                "Only change the hairstyle. Make it look natural and photorealistic."
            ),
        },
    },
    "masc": {
        "textured-crop": {
            "name": "Textured Crop",
            "emoji": "🌿",
            "prompt": (
                "Edit this photo to give the person a short textured crop hairstyle with volume "
                "and texture on top, shorter on the sides. Keep the same face, expression, skin tone, "
                "background, and clothing. Only change the hairstyle. Make it look natural and photorealistic."
            ),
        },
        "buzz-fade": {
            "name": "Buzz Fade",
            "emoji": "💈",
            "prompt": (
                "Edit this photo to give the person a clean buzz cut with a sharp skin fade on the sides. "
                "Keep the same face, expression, skin tone, background, and clothing. "
                "Only change the hairstyle. Make it look natural and photorealistic."
            ),
        },
        "slick-back": {
            "name": "Slick Back",
            "emoji": "🖤",
            "prompt": (
                "Edit this photo to give the person a medium-length slicked back hairstyle with a polished, "
                "product-styled finish. Keep the same face, expression, skin tone, background, and clothing. "
                "Only change the hairstyle. Make it look natural and photorealistic."
            ),
        },
        "curtain-flow": {
            "name": "Curtain Flow",
            "emoji": "🌊",
            "prompt": (
                "Edit this photo to give the person a longer curtain-style flow hairstyle, parted in the middle "
                "with a relaxed, messy-chic look. Keep the same face, expression, skin tone, background, "
                "and clothing. Only change the hairstyle. Make it look natural and photorealistic."
            ),
        },
    },
}


STYLIST_NOTE_PROMPT = """You are a fabulous, sassy hair stylist. The user just tried on a virtual "{style_name}" hairstyle.
Write a short, fun, hype-up stylist note (2-3 sentences max). Be encouraging, witty, and use a confident, trendy voice.
Include one relevant emoji. Keep it under 200 characters. Do NOT use hashtags."""
