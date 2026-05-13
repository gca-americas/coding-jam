"""Gemini image generation service for Glow Up hair try-on."""

import asyncio
import logging
import time

from .config import settings

logger = logging.getLogger(__name__)

# Reuse a single genai client (lazy-initialised)
_client = None


def _get_client():
    """Return a cached genai.Client singleton."""
    global _client
    if _client is None:
        import google.genai as genai

        _client = genai.Client(
            vertexai=settings.GOOGLE_GENAI_USE_VERTEXAI,
            project=settings.GOOGLE_CLOUD_PROJECT,
            location=settings.GOOGLE_CLOUD_LOCATION,
        )
    return _client


async def generate_hairstyle(selfie_bytes: bytes, prompt: str) -> bytes:
    """Generate a hairstyle-edited image using Gemini.

    Args:
        selfie_bytes: JPEG/PNG bytes of the uploaded selfie.
        prompt: The hairstyle editing prompt.

    Returns:
        PNG image bytes of the transformed photo.
    """
    from google.genai import types

    client = _get_client()

    image_part = types.Part.from_bytes(
        data=selfie_bytes,
        mime_type="image/png",
    )

    t0 = time.perf_counter()

    response = await asyncio.to_thread(
        client.models.generate_content,
        model="gemini-3.1-flash-image-preview",
        contents=[
            types.Content(
                role="user",
                parts=[
                    image_part,
                    types.Part.from_text(text=prompt),
                ],
            )
        ],
        config=types.GenerateContentConfig(
            temperature=1,
            top_p=0.95,
            max_output_tokens=8192,
            response_modalities=["IMAGE"],
            safety_settings=[
                types.SafetySetting(category="HARM_CATEGORY_HATE_SPEECH", threshold="OFF"),
                types.SafetySetting(category="HARM_CATEGORY_DANGEROUS_CONTENT", threshold="OFF"),
                types.SafetySetting(category="HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold="OFF"),
                types.SafetySetting(category="HARM_CATEGORY_HARASSMENT", threshold="OFF"),
            ],
            image_config=types.ImageConfig(
                aspect_ratio="1:1",
                output_mime_type="image/png",
            ),
        ),
    )

    elapsed = time.perf_counter() - t0

    for candidate in response.candidates:
        for part in candidate.content.parts:
            if part.inline_data is not None:
                size_kb = len(part.inline_data.data) / 1024
                logger.info(
                    "Hairstyle generated: size=%.0fKB time=%.1fs",
                    size_kb, elapsed,
                )
                return part.inline_data.data

    raise ValueError("Gemini returned no image in response")


async def generate_stylist_note(style_name: str) -> str:
    """Generate a sassy stylist note using Gemini text generation."""
    from google.genai import types
    from .presets import STYLIST_NOTE_PROMPT

    client = _get_client()

    prompt = STYLIST_NOTE_PROMPT.format(style_name=style_name)

    response = await asyncio.to_thread(
        client.models.generate_content,
        model="gemini-3.1-flash-image-preview",
        contents=[prompt],
        config=types.GenerateContentConfig(
            temperature=1.2,
            max_output_tokens=256,
        ),
    )

    return response.text.strip()
