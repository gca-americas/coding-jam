"""Gemini AI service for FridgeChef — recipe generation and food photo synthesis."""

import asyncio
import json
import logging
import re
import time

from .config import settings
from .prompts import build_recipe_prompt, build_image_prompt

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


def _extract_json(text: str) -> dict:
    """Extract and parse JSON from a Gemini response that may be wrapped in markdown fences."""
    # Try direct parse first
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Strip markdown code fences
    match = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
    if match:
        try:
            return json.loads(match.group(1).strip())
        except json.JSONDecodeError:
            pass

    raise ValueError(f"Could not parse JSON from Gemini response:\n{text[:500]}")


async def generate_recipe(ingredients: list[str], mode: str | None) -> dict:
    """Generate a structured recipe using Gemini text generation.

    Args:
        ingredients: List of ingredient names the user has.
        mode: Optional cooking mode — 'quick', 'grandma', 'budget', 'healthy', 'fancy'.

    Returns:
        Parsed recipe dict matching the frontend's expected schema.
    """
    from google.genai import types

    client = _get_client()
    prompt = build_recipe_prompt(ingredients, mode)

    t0 = time.perf_counter()

    response = await asyncio.to_thread(
        client.models.generate_content,
        model="gemini-2.5-flash",
        contents=[prompt],
        config=types.GenerateContentConfig(
            temperature=1.0,
            max_output_tokens=4096,
            response_mime_type="application/json",
        ),
    )

    elapsed = time.perf_counter() - t0
    logger.info("Recipe generated in %.1fs", elapsed)

    recipe = _extract_json(response.text)
    return recipe


async def generate_food_image(photo_description: str) -> bytes | None:
    """Generate a food photo using Gemini image generation.

    Args:
        photo_description: A description of the plated dish.

    Returns:
        PNG image bytes, or None if generation fails.
    """
    from google.genai import types

    client = _get_client()
    prompt = build_image_prompt(photo_description)

    t0 = time.perf_counter()

    try:
        response = await asyncio.to_thread(
            client.models.generate_content,
            model="gemini-3.1-flash-image-preview",
            contents=[prompt],
            config=types.GenerateContentConfig(
                temperature=1,
                max_output_tokens=8192,
                response_modalities=["IMAGE"],
                safety_settings=[
                    types.SafetySetting(category="HARM_CATEGORY_HATE_SPEECH", threshold="OFF"),
                    types.SafetySetting(category="HARM_CATEGORY_DANGEROUS_CONTENT", threshold="OFF"),
                    types.SafetySetting(category="HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold="OFF"),
                    types.SafetySetting(category="HARM_CATEGORY_HARASSMENT", threshold="OFF"),
                ],
                image_config=types.ImageConfig(
                    aspect_ratio="16:9",
                    output_mime_type="image/png",
                ),
            ),
        )

        for candidate in response.candidates:
            for part in candidate.content.parts:
                if part.inline_data is not None:
                    elapsed = time.perf_counter() - t0
                    size_kb = len(part.inline_data.data) / 1024
                    logger.info("Food image generated: size=%.0fKB time=%.1fs", size_kb, elapsed)
                    return part.inline_data.data

    except Exception:
        logger.exception("Food image generation failed — returning None")

    return None
