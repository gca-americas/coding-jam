"""FastAPI application — Avatar Studio AI Art Style Transfer."""

import asyncio
import base64
import logging

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from .presets import STYLES, STYLE_LIST
from .gemini_service import transform_avatar, generate_lore

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="🎭 Avatar Studio API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/styles")
async def get_styles():
    """Return available art styles with metadata."""
    return {"styles": STYLE_LIST}


@app.post("/api/transform")
async def transform(
    photo: UploadFile = File(...),
    subject: str = Form(...),
    style: str = Form(...),
):
    """Transform a photo into a single stylized avatar.

    Args:
        photo: The uploaded face/pet photo.
        subject: 'human' or 'pet'.
        style: Style key like 'lego', 'manga-bw', etc.

    Returns:
        JSON with base64-encoded avatar image.
    """
    if subject not in ("human", "pet"):
        raise HTTPException(status_code=400, detail=f"Invalid subject: {subject}. Use 'human' or 'pet'.")

    if style not in STYLES:
        valid = list(STYLES.keys())
        raise HTTPException(status_code=400, detail=f"Invalid style: {style}. Valid: {valid}")

    preset = STYLES[style]
    prompt = preset["prompts"][subject]
    photo_bytes = await photo.read()

    logger.info("Transform request: subject=%s style=%s size=%.0fKB", subject, style, len(photo_bytes) / 1024)

    try:
        result_bytes = await transform_avatar(photo_bytes, prompt)
        result_b64 = base64.b64encode(result_bytes).decode("utf-8")

        return JSONResponse({
            "avatar": result_b64,
            "style_key": style,
            "style_name": preset["name"],
            "style_emoji": preset["emoji"],
        })

    except Exception as e:
        logger.exception("Transform failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/transform-all")
async def transform_all(
    photo: UploadFile = File(...),
    subject: str = Form(...),
):
    """Transform a photo into ALL 6 styles at once using parallel generation.

    Args:
        photo: The uploaded face/pet photo.
        subject: 'human' or 'pet'.

    Returns:
        JSON with array of base64-encoded avatar images.
    """
    if subject not in ("human", "pet"):
        raise HTTPException(status_code=400, detail=f"Invalid subject: {subject}. Use 'human' or 'pet'.")

    photo_bytes = await photo.read()
    logger.info("Transform-all request: subject=%s size=%.0fKB", subject, len(photo_bytes) / 1024)

    async def gen_one(key: str, preset: dict):
        prompt = preset["prompts"][subject]
        try:
            result_bytes = await transform_avatar(photo_bytes, prompt)
            return {
                "style_key": key,
                "style_name": preset["name"],
                "style_emoji": preset["emoji"],
                "avatar": base64.b64encode(result_bytes).decode("utf-8"),
                "error": None,
            }
        except Exception as e:
            logger.error("Transform-all failed for %s: %s", key, e)
            return {
                "style_key": key,
                "style_name": preset["name"],
                "style_emoji": preset["emoji"],
                "avatar": None,
                "error": str(e),
            }

    tasks = [gen_one(key, preset) for key, preset in STYLES.items()]
    results = await asyncio.gather(*tasks)

    return JSONResponse({"avatars": list(results)})


@app.post("/api/lore")
async def get_lore(
    style: str = Form(...),
    subject: str = Form(...),
):
    """Generate character lore for an avatar.

    Args:
        style: Style key.
        subject: 'human' or 'pet'.

    Returns:
        JSON with character name, title, backstory, stats.
    """
    if style not in STYLES:
        raise HTTPException(status_code=400, detail=f"Invalid style: {style}")

    style_name = STYLES[style]["name"]

    try:
        lore = await generate_lore(style_name, subject)
        return JSONResponse(lore)
    except Exception as e:
        logger.exception("Lore generation failed")
        raise HTTPException(status_code=500, detail=str(e))


# Mount the frontend as static files (served at root)
import os
frontend_path = os.path.join(os.path.dirname(__file__), "..", "..", "frontend")
if os.path.isdir(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")
