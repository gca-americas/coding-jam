"""MoodJar — AI-powered reflection & mood journal."""

import json
import os
from datetime import datetime, timezone

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from google import genai
from google.genai import types
from pydantic import BaseModel

from prompts import SYSTEM_PROMPT, VALID_MOODS, DEFAULT_MOOD

load_dotenv()

app = FastAPI(title="MoodJar")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Gemini client setup ---
# Creates a fresh client per request to avoid pyOpenSSL SSL context reuse errors.

MODEL = "gemini-3-flash-preview"

def _create_client():
    """Create a fresh Gemini client for each request."""
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        return genai.Client(api_key=api_key)
    return genai.Client(
        vertexai=True,
        project=os.getenv("GOOGLE_CLOUD_PROJECT"),
        location=os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1"),
    )


# --- Models ---

class ThoughtRequest(BaseModel):
    thought: str


class MoodRequest(BaseModel):
    mood: str


# --- Routes ---

@app.post("/api/generate")
async def generate(request: ThoughtRequest):
    """Take a freeform thought and return a comfort response via Gemini."""

    if len(request.thought.strip()) < 5:
        raise HTTPException(
            status_code=400,
            detail="Write a little more — even a few words is enough.",
        )

    thought_text = request.thought[:1000]  # Truncate for safety

    user_prompt = f"""Someone placed this thought on their windowsill:

\"\"\"{thought_text}\"\"\"

Respond with gentle warmth. Return valid JSON only."""

    try:
        response = _create_client().models.generate_content(
            model=MODEL,
            contents=[
                {
                    "role": "user",
                    "parts": [{"text": SYSTEM_PROMPT + "\n\n" + user_prompt}],
                }
            ],
            config=types.GenerateContentConfig(
                temperature=0.8,
                response_mime_type="application/json",
            ),
        )

        response_text = response.text.strip()

        # Remove markdown code fences if present
        if response_text.startswith("```"):
            response_text = response_text.split("\n", 1)[1]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            response_text = response_text.strip()

        data = json.loads(response_text)

        # Validate core fields
        if "emoji" not in data or "sentences" not in data:
            raise ValueError("Missing required fields in AI response")
        if not isinstance(data["sentences"], list) or len(data["sentences"]) != 3:
            raise ValueError("Expected exactly 3 sentences")

        # Validate/fallback for v2 fields
        if data.get("mood") not in VALID_MOODS:
            data["mood"] = DEFAULT_MOOD
        if not data.get("slipLabel") or not isinstance(data.get("slipLabel"), str):
            # Fallback: first few words of thought
            words = thought_text.split()[:4]
            data["slipLabel"] = " ".join(words)

    except json.JSONDecodeError as e:
        print(f"JSON parse error: {e}")
        raise HTTPException(
            status_code=500,
            detail="The sunlight's being shy. Try again?",
        )
    except ValueError as e:
        print(f"Validation error: {e}")
        raise HTTPException(
            status_code=500,
            detail="The sunlight's being shy. Try again?",
        )
    except Exception as e:
        print(f"Generation error: {e}")
        raise HTTPException(
            status_code=500,
            detail="The sunlight's being shy. Try again?",
        )

    return data


@app.post("/api/mood")
async def log_mood(request: MoodRequest):
    """Log a standalone mood check-in (no AI call)."""

    if request.mood not in VALID_MOODS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid mood. Choose one of: {', '.join(sorted(VALID_MOODS))}",
        )

    return {
        "mood": request.mood,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/api/health")
async def health():
    """Health check endpoint."""
    return {"status": "sunny"}


# Mount frontend static files (must be last)
frontend_path = os.path.join(os.path.dirname(__file__), "..", "frontend")
if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")
