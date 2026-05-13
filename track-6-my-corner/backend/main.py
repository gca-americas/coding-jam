"""My Corner — AI-Powered Personal Landing Page Generator"""

import os
import json
from dotenv import load_dotenv

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from google import genai

load_dotenv()

app = FastAPI(title="My Corner")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Models ---

class GenerateProfileRequest(BaseModel):
    blurb: str  # Free-form text about the user


SYSTEM_PROMPT = """You are a warm, perceptive personal brand writer. Given a free-form blurb someone writes about themselves, extract and generate a structured personal website profile.

Your job:
1. Extract their name (if mentioned). If not mentioned, use "Your Name" as placeholder.
2. Write a 1-2 line bio that captures their essence — warm, confident, not corporate. Like how a close friend would introduce them at a dinner party.
3. Identify 3 things they're proud of or that define them. For each, pick a perfect emoji, give it a short title (2-4 words), and write a one-sentence description.
4. Suggest 3-5 social/contact links based on what they mention (use placeholder URLs). Include emoji for each.
5. Generate 2-3 short blog/log posts (1-2 sentences each) that feel like things this person would actually write. Give each a date (use recent dates in 2026), a title, and a mood emoji.

Rules:
- Be warm and genuine, never generic or corporate
- Mirror their energy — if they're playful, be playful. If they're thoughtful, be thoughtful.
- Don't make up facts they didn't mention — but you can infer reasonable things
- Bio should feel like a tagline, not a resume summary
- Proud-of items should feel personal, not like LinkedIn bullet points
- Blog posts should sound like authentic micro-journal entries

Respond with valid JSON only, in this exact format:
{
  "name": "Their Name",
  "bio": "A warm 1-2 line bio.\\nSecond line if needed.",
  "proudOf": [
    { "emoji": "🎨", "title": "Short Title", "description": "One sentence about this." },
    { "emoji": "🌱", "title": "Short Title", "description": "One sentence about this." },
    { "emoji": "💡", "title": "Short Title", "description": "One sentence about this." }
  ],
  "links": [
    { "emoji": "🐦", "label": "Twitter", "url": "https://twitter.com/" },
    { "emoji": "💼", "label": "LinkedIn", "url": "https://linkedin.com/in/" },
    { "emoji": "📧", "label": "Email Me", "url": "mailto:hello@example.com" }
  ],
  "posts": [
    {
      "date": "2026-05-07",
      "title": "Post Title",
      "body": "The post content, 1-2 sentences.",
      "mood": "✨"
    }
  ]
}"""


@app.post("/api/generate")
async def generate_profile(request: GenerateProfileRequest):
    """Take a free-form blurb and generate a structured profile via Gemini."""

    if len(request.blurb.strip()) < 20:
        raise HTTPException(
            status_code=400,
            detail="Tell us a bit more about yourself — at least a couple of sentences!"
        )

    if len(request.blurb) > 3000:
        raise HTTPException(
            status_code=400,
            detail="That's a lot! Try keeping it under 3000 characters."
        )

    user_prompt = f"""Here's what this person wrote about themselves:

\"\"\"{request.blurb}\"\"\"

Generate a warm, authentic personal website profile from this. Return valid JSON only."""

    try:
        client = genai.Client()
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                {"role": "user", "parts": [{"text": SYSTEM_PROMPT + "\n\n" + user_prompt}]}
            ],
        )

        response_text = response.text.strip()
        # Remove markdown code fences if present
        if response_text.startswith("```"):
            response_text = response_text.split("\n", 1)[1]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            response_text = response_text.strip()

        profile_data = json.loads(response_text)

    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse AI response: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")

    return {"profile": profile_data}


# Mount frontend static files (must be last)
frontend_path = os.path.join(os.path.dirname(__file__), "..", "frontend")
if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")
