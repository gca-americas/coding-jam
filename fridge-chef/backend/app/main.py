"""FastAPI application — FridgeChef AI Recipe Generator."""

import base64
import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from .gemini_service import generate_recipe, generate_food_image

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="🧊 FridgeChef API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request / Response Models ────────────────────

class RecipeRequest(BaseModel):
    ingredients: list[str]
    mode: str | None = None


class ImageRequest(BaseModel):
    photo_description: str


# ── Routes ───────────────────────────────────────

@app.get("/api/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok", "service": "FridgeChef"}


@app.post("/api/generate-recipe")
async def api_generate_recipe(req: RecipeRequest):
    """Generate the recipe text only — fast path so the UI can render immediately.

    Image generation is a separate call (/api/generate-image) so the user
    sees the recipe as soon as the text is ready (~6s) instead of waiting
    for the image (~15s extra).
    """
    if not req.ingredients:
        raise HTTPException(status_code=400, detail="No ingredients provided")

    logger.info(
        "Recipe request: ingredients=%s mode=%s",
        req.ingredients, req.mode,
    )

    try:
        recipe = await generate_recipe(req.ingredients, req.mode)
        recipe["image_base64"] = None
        return JSONResponse(recipe)

    except Exception as e:
        logger.exception("Recipe generation failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/generate-image")
async def api_generate_image(req: ImageRequest):
    """Generate the food photo for a recipe.

    Called separately from /api/generate-recipe so recipe text can render
    immediately while the image loads in the background.
    """
    if not req.photo_description:
        raise HTTPException(status_code=400, detail="No photo description")

    image_bytes = await generate_food_image(req.photo_description)
    if not image_bytes:
        return JSONResponse({"image_base64": None})

    image_b64 = base64.b64encode(image_bytes).decode("utf-8")
    return JSONResponse({"image_base64": image_b64})


# ── Serve Frontend ───────────────────────────────

import os

frontend_path = os.path.join(os.path.dirname(__file__), "..", "..", "frontend")
if os.path.isdir(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")
