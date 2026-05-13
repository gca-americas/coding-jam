"""BulletProof — AI Resume Tailoring API."""

import json
import os
import re

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai

from prompts import TAILOR_PROMPT

app = FastAPI(title="BulletProof API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
MODEL = "gemini-2.5-flash"


class TailorRequest(BaseModel):
    resume: str
    job_posting: str


class TailoredBullet(BaseModel):
    original: str
    tailored: str
    keywords_matched: list[str]


class TailorResponse(BaseModel):
    keywords_found: list[str]
    keywords_missing: list[str]
    tailored_bullets: list[TailoredBullet]
    match_score: int


@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.post("/api/tailor", response_model=TailorResponse)
async def tailor_resume(request: TailorRequest):
    """Tailor resume bullets to match a job posting using Gemini AI."""
    if not request.resume.strip():
        raise HTTPException(status_code=400, detail="Resume text is required")
    if not request.job_posting.strip():
        raise HTTPException(status_code=400, detail="Job posting text is required")

    prompt = TAILOR_PROMPT.format(
        resume_text=request.resume,
        job_text=request.job_posting,
    )

    try:
        response = client.models.generate_content(
            model=MODEL,
            contents=prompt,
            config={
                "temperature": 0.7,
                "response_mime_type": "application/json",
            },
        )

        raw = response.text.strip()

        # Parse the JSON response
        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            # Try to extract JSON from markdown code blocks
            json_match = re.search(r"```(?:json)?\s*([\s\S]*?)```", raw)
            if json_match:
                data = json.loads(json_match.group(1).strip())
            else:
                raise HTTPException(
                    status_code=500, detail="Failed to parse AI response"
                )

        return TailorResponse(
            keywords_found=data.get("keywords_found", []),
            keywords_missing=data.get("keywords_missing", []),
            tailored_bullets=[
                TailoredBullet(
                    original=b.get("original", ""),
                    tailored=b.get("tailored", ""),
                    keywords_matched=b.get("keywords_matched", []),
                )
                for b in data.get("tailored_bullets", [])
            ],
            match_score=data.get("match_score", 0),
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI processing error: {str(e)}")
