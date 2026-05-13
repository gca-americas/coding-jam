"""
Inner Canvas — Main FastAPI application.
AI-powered mood journal: write → mood art + reflection question.
"""

import base64
import json
import os
import re
from datetime import datetime

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types
from pydantic import BaseModel

from prompts import (
    ART_GENERATION_PROMPT,
    MOOD_ANALYSIS_PROMPT,
    MOOD_ORB_COLORS,
    REFLECTION_QUESTION_PROMPT,
)

load_dotenv()

app = FastAPI(title="Inner Canvas API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

use_vertex = os.getenv("GOOGLE_GENAI_USE_VERTEXAI", "").lower() == "true"

if use_vertex:
    client = genai.Client(
        vertexai=True,
        project=os.getenv("GOOGLE_CLOUD_PROJECT"),
        location=os.getenv("GOOGLE_CLOUD_LOCATION", "global"),
    )
else:
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

TEXT_MODEL = "gemini-3-flash-preview"
IMAGE_MODEL = "gemini-3.1-flash-image-preview"


class JournalEntry(BaseModel):
    entry: str
    time_of_day: str = "evening"


class PatternRequest(BaseModel):
    entries: list[dict]


def get_time_of_day() -> str:
    """Determine time of day from current hour."""
    hour = datetime.now().hour
    if 5 <= hour < 12:
        return "morning"
    elif 12 <= hour < 17:
        return "afternoon"
    elif 17 <= hour < 21:
        return "evening"
    else:
        return "late_night"


def analyze_mood(entry: str, time_of_day: str) -> dict:
    """Use Gemini to analyze the emotional tone of a journal entry."""
    prompt = MOOD_ANALYSIS_PROMPT.format(entry=entry, time_of_day=time_of_day)

    response = client.models.generate_content(
        model=TEXT_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.7,
            response_mime_type="application/json",
        ),
    )

    try:
        mood_data = json.loads(response.text)
    except json.JSONDecodeError:
        # Fallback if JSON parsing fails
        mood_data = {
            "primary_mood": "reflective",
            "secondary_mood": "gentle",
            "intensity": 0.5,
            "color_palette": ["#9b7ed8", "#d4789c", "#7db89b", "#d4a574"],
            "texture_words": "soft, flowing, layered",
            "art_style": "watercolor washes",
            "mood_category": "peace",
        }

    return mood_data


def generate_art(mood_data: dict) -> tuple[str, str]:
    """Generate mood artwork using Gemini image generation."""
    color_str = ", ".join(mood_data.get("color_palette", ["#9b7ed8", "#d4789c"]))

    art_prompt = ART_GENERATION_PROMPT.format(
        art_style=mood_data.get("art_style", "watercolor washes"),
        primary_mood=mood_data.get("primary_mood", "reflective"),
        secondary_mood=mood_data.get("secondary_mood", "gentle"),
        color_palette=color_str,
        texture_words=mood_data.get("texture_words", "soft, flowing"),
    )

    response = client.models.generate_content(
        model=IMAGE_MODEL,
        contents=art_prompt,
        config=types.GenerateContentConfig(
            response_modalities=["IMAGE", "TEXT"],
            temperature=1.0,
        ),
    )

    image_base64 = ""
    alt_text = f"Abstract painting evoking {mood_data.get('primary_mood', 'emotion')} with undertones of {mood_data.get('secondary_mood', 'depth')}"

    for part in response.candidates[0].content.parts:
        if part.inline_data is not None:
            image_base64 = base64.b64encode(part.inline_data.data).decode("utf-8")
        elif part.text is not None:
            alt_text = part.text

    return image_base64, alt_text


def generate_reflection(entry: str, mood_data: dict) -> str:
    """Generate a gentle reflection question based on the entry and mood."""
    prompt = REFLECTION_QUESTION_PROMPT.format(
        entry=entry,
        primary_mood=mood_data.get("primary_mood", "reflective"),
        secondary_mood=mood_data.get("secondary_mood", "gentle"),
        intensity=mood_data.get("intensity", 0.5),
    )

    response = client.models.generate_content(
        model=TEXT_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.8,
        ),
    )

    return response.text.strip().strip('"').strip("'")


@app.post("/api/generate")
async def generate(entry_data: JournalEntry):
    """Main generation endpoint: entry → mood + art + reflection."""
    if len(entry_data.entry.strip()) < 10:
        raise HTTPException(
            status_code=400,
            detail="Say a little more — even a few words help me understand.",
        )

    # Truncate very long entries for API efficiency
    entry_text = entry_data.entry[:3000]
    time_of_day = entry_data.time_of_day or get_time_of_day()

    try:
        # Step 1: Analyze mood
        mood_data = analyze_mood(entry_text, time_of_day)

        # Step 2: Generate art
        image_base64, alt_text = generate_art(mood_data)

        # Step 3: Generate reflection question
        reflection = generate_reflection(entry_text, mood_data)

        # Get orb colors for the generation ceremony
        mood_category = mood_data.get("mood_category", "peace")
        orb_colors = MOOD_ORB_COLORS.get(
            mood_category, MOOD_ORB_COLORS["peace"]
        )

        return {
            "mood": {
                "primary": mood_data.get("primary_mood", "reflective"),
                "secondary": mood_data.get("secondary_mood", "gentle"),
                "intensity": mood_data.get("intensity", 0.5),
                "category": mood_category,
                "color_palette": mood_data.get("color_palette", []),
                "art_style": mood_data.get("art_style", ""),
            },
            "artwork": {
                "image_base64": image_base64,
                "alt_text": alt_text,
            },
            "reflection": {
                "question": reflection,
            },
            "ceremony": {
                "orb_colors": orb_colors,
                "dominant_color": mood_data.get("color_palette", ["#9b7ed8"])[0],
            },
        }

    except Exception as e:
        print(f"Generation error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Something went quiet. Let's try again.",
        )


@app.post("/api/patterns")
async def detect_patterns(request: PatternRequest):
    """Analyze multiple entries to detect emotional patterns (Phase 2)."""
    if len(request.entries) < 3:
        raise HTTPException(
            status_code=400,
            detail="Need at least 3 entries to find patterns.",
        )

    entries_summary = "\n".join(
        [
            f"- {e.get('date', 'unknown')}: {e.get('text', '')[:200]} (mood: {e.get('mood', {}).get('primary', 'unknown')})"
            for e in request.entries[-14:]  # Last 14 entries max
        ]
    )

    prompt = f"""You are a warm, observational companion — not a therapist. Look at these journal entries and notice emotional patterns. Be gentle and insightful.

Entries:
{entries_summary}

Return ONLY a valid JSON object with:
- "patterns": array of objects, each with "observation" (warm, human sentence) and "type" ("trend", "cycle", or "shift")
- "dominant_mood": the prevailing emotional tone across entries
- "mood_trajectory": "ascending", "descending", "stable", or "fluctuating"
- "encouragement": one warm sentence acknowledging what you see

Keep observations warm, never clinical. Maximum 3 patterns."""

    response = client.models.generate_content(
        model=TEXT_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.7,
            response_mime_type="application/json",
        ),
    )

    try:
        return json.loads(response.text)
    except json.JSONDecodeError:
        return {
            "patterns": [],
            "dominant_mood": "varied",
            "mood_trajectory": "fluctuating",
            "encouragement": "You've been showing up for yourself, and that matters.",
        }


@app.get("/api/health")
async def health():
    return {"status": "breathing"}
