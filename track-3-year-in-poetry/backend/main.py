"""My Year in Moments — Backend API"""

import os
import json
import calendar
from datetime import datetime
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from google import genai

app = FastAPI(title="My Year in Moments")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Models ---

class Moment(BaseModel):
    date: str  # YYYY-MM-DD
    description: str
    person: Optional[str] = None

class GenerateRequest(BaseModel):
    moments: list[Moment]
    year: int = 2026

class CalendarMoment(BaseModel):
    date: str
    day_of_week: str
    original_description: str
    note: str
    emoji: str
    color_accent: str

class CalendarResponse(BaseModel):
    year: int
    moments: list[CalendarMoment]
    closing_note: str
    title: str

# --- Accent color palette ---
ACCENT_COLORS = [
    "#E87B7B",  # coral
    "#5DC4C4",  # teal
    "#F4A876",  # peach
    "#C25D8A",  # magenta
    "#7FD4D4",  # cyan
    "#E6789B",  # hot pink
]

DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

SYSTEM_PROMPT = """You are a warm, emotionally intelligent writer. Given a list of meaningful dates and their descriptions, generate a short note (1-2 sentences max) for each date that would appear on a personal calendar.

Rules:
- Be warm, not cheesy. Think "best friend who's also a poet."
- Reference the specific person/event by name when provided.
- Vary the tone: some notes should be celebratory, some reflective, some gently humorous, some tender.
- Use second person ("you") to speak directly to the person.
- Never be generic. Each note should feel like it was written for THIS person.
- Keep it short. Max 2 sentences. Often 1 is better.
- For birthdays: don't just say "happy birthday." Add warmth.
- For milestones: acknowledge the journey, not just the event.
- Also generate one closing reflection (2-3 sentences) for the end of the calendar year.
- Pick a single emoji that perfectly captures each moment.

Examples of good notes:
- "Grandma's birthday — call her. She's been loving you since before you could remember."
- "One year since you and Sam. Look how far you've come."
- "Luna came home today. You didn't know it yet, but she was about to become your whole heart."
- "The day you said yes to San Francisco. Brave choice. Best choice."

Respond with valid JSON only, in this exact format:
{
  "notes": [
    {
      "date": "YYYY-MM-DD",
      "note": "the warm note",
      "emoji": "single emoji"
    }
  ],
  "closing": "A closing reflection for the end of the year (2-3 sentences)."
}"""


@app.post("/api/generate")
async def generate_calendar(request: GenerateRequest):
    """Generate AI-powered calendar notes for meaningful dates."""

    if len(request.moments) < 3:
        raise HTTPException(status_code=400, detail="Please add at least 3 moments.")
    if len(request.moments) > 20:
        raise HTTPException(status_code=400, detail="Maximum 20 moments allowed.")

    # Build the user prompt
    dates_text = []
    for m in request.moments:
        entry = f"- {m.date}: \"{m.description}\""
        if m.person:
            entry += f" (person/pet: {m.person})"
        dates_text.append(entry)

    user_prompt = f"Here are the meaningful dates for {request.year}:\n\n" + "\n".join(dates_text)
    user_prompt += f"\n\nGenerate warm, personal notes for each date and a closing reflection for the year. Return valid JSON only."

    # Call Gemini
    try:
        client = genai.Client()
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                {"role": "user", "parts": [{"text": SYSTEM_PROMPT + "\n\n" + user_prompt}]}
            ],
        )

        # Parse the AI response
        response_text = response.text.strip()
        # Remove markdown code fences if present
        if response_text.startswith("```"):
            response_text = response_text.split("\n", 1)[1]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            response_text = response_text.strip()

        ai_data = json.loads(response_text)

    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse AI response: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")

    # Build structured response
    calendar_moments = []
    for i, note_data in enumerate(ai_data.get("notes", [])):
        date_str = note_data["date"]
        try:
            dt = datetime.strptime(date_str, "%Y-%m-%d")
            day_name = DAY_NAMES[dt.weekday()]
        except ValueError:
            day_name = "Unknown"

        # Find original description
        original_desc = ""
        for m in request.moments:
            if m.date == date_str:
                original_desc = m.description
                break

        calendar_moments.append(CalendarMoment(
            date=date_str,
            day_of_week=day_name,
            original_description=original_desc,
            note=note_data.get("note", ""),
            emoji=note_data.get("emoji", "✦"),
            color_accent=ACCENT_COLORS[i % len(ACCENT_COLORS)],
        ))

    # Sort by date
    calendar_moments.sort(key=lambda m: m.date)

    return {
        "calendar": CalendarResponse(
            year=request.year,
            moments=calendar_moments,
            closing_note=ai_data.get("closing", "Every day is ordinary until you decide it matters."),
            title="My Year in Moments",
        )
    }


# Mount frontend static files (must be last)
frontend_path = os.path.join(os.path.dirname(__file__), "..", "frontend")
if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")
