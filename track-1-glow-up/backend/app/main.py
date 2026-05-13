"""FastAPI application — Glow Up Virtual Hair Try-On."""

import base64
import logging

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from .presets import PRESETS
from .gemini_service import generate_hairstyle, generate_stylist_note

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="✨ Glow Up API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/presets")
async def get_presets():
    """Return available presets grouped by gender vibe."""
    result = {}
    for gender, styles in PRESETS.items():
        result[gender] = [
            {"key": key, "name": s["name"], "emoji": s["emoji"]}
            for key, s in styles.items()
        ]
    return result


@app.post("/api/glow-up")
async def glow_up(
    selfie: UploadFile = File(...),
    gender: str = Form(...),
    style: str = Form(...),
):
    """Generate a hairstyle transformation.

    Args:
        selfie: The uploaded selfie image.
        gender: 'femme' or 'masc'.
        style: Preset key like 'curtain-bangs'.

    Returns:
        JSON with base64-encoded result image and stylist note.
    """
    # Validate inputs
    if gender not in PRESETS:
        raise HTTPException(status_code=400, detail=f"Invalid gender: {gender}. Use 'femme' or 'masc'.")

    if style not in PRESETS[gender]:
        valid = list(PRESETS[gender].keys())
        raise HTTPException(status_code=400, detail=f"Invalid style: {style}. Valid: {valid}")

    preset = PRESETS[gender][style]
    selfie_bytes = await selfie.read()

    logger.info("Glow Up request: gender=%s style=%s size=%.0fKB", gender, style, len(selfie_bytes) / 1024)

    try:
        # Generate the transformed image
        result_bytes = await generate_hairstyle(selfie_bytes, preset["prompt"])

        # Generate sassy stylist note in parallel would be nice, but let's keep it simple
        stylist_note = await generate_stylist_note(preset["name"])

        result_b64 = base64.b64encode(result_bytes).decode("utf-8")

        return JSONResponse({
            "image": result_b64,
            "stylist_note": stylist_note,
            "style_name": preset["name"],
            "style_emoji": preset["emoji"],
        })

    except Exception as e:
        logger.exception("Glow Up generation failed")
        raise HTTPException(status_code=500, detail=str(e))


# Mount the frontend as static files (served at root)
import os
frontend_path = os.path.join(os.path.dirname(__file__), "..", "..", "frontend")
if os.path.isdir(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")
