"""Character Chat API — FastAPI backend with Gemini 2.5 Flash integration."""

import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from google import genai
from google.genai import types

from models import ChatRequest, ChatResponse, OpenerRequest
from prompts import build_system_prompt, build_opener_prompt

load_dotenv()

# --- Gemini client setup ---
api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
if not api_key or api_key in ("your-api-key-here", "your_api_key_here"):
    raise RuntimeError(
        "GEMINI_API_KEY is not set. Please add your key to backend/.env"
    )

client = genai.Client(api_key=api_key)
MODEL = "gemini-2.5-flash"

# --- FastAPI app ---
app = FastAPI(title="Character Chat", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Serve frontend static files ---
FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend"


@app.post("/api/opener", response_model=ChatResponse)
async def generate_opener(req: OpenerRequest):
    """Generate the character's opening message."""
    try:
        response = client.models.generate_content(
            model=MODEL,
            contents=build_opener_prompt(req.character),
            config=types.GenerateContentConfig(
                temperature=0.9,
                max_output_tokens=150,
            ),
        )
        reply = response.text.strip()
        if not reply:
            raise ValueError("Empty response from Gemini")
        return ChatResponse(reply=reply)
    except Exception as e:
        print(f"Opener error: {e}")
        raise HTTPException(
            status_code=500,
            detail="The character is gathering their thoughts... please try again.",
        )


@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    """Send a message and get an in-character response."""
    try:
        # Build the conversation history for Gemini
        system_prompt = build_system_prompt(req.character)

        # Convert messages to Gemini content format
        contents = []
        for msg in req.messages:
            role = "user" if msg.role == "user" else "model"
            contents.append(
                types.Content(
                    role=role,
                    parts=[types.Part(text=msg.content)],
                )
            )

        response = client.models.generate_content(
            model=MODEL,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                temperature=0.85,
                max_output_tokens=300,
            ),
        )
        reply = response.text.strip()
        if not reply:
            raise ValueError("Empty response from Gemini")
        return ChatResponse(reply=reply)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Chat error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"{req.character.name} got lost in thought... please try again.",
        )


# --- Serve frontend (must be last) ---
app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")
