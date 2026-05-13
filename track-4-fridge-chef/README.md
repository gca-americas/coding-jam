# FridgeChef 🧊

FridgeChef is an interactive web application that turns your random fridge ingredients into delicious AI-generated recipes — complete with food photography.

## Architecture

```
fridge-chef/
├── backend/           ← FastAPI + Gemini AI
│   ├── app/
│   │   ├── main.py           # FastAPI routes, serves frontend
│   │   ├── gemini_service.py # Gemini text + image generation
│   │   ├── prompts.py        # Prompt templates for recipe & photo
│   │   └── config.py         # Pydantic settings (.env loader)
│   ├── .env                  # Vertex AI credentials
│   └── pyproject.toml
└── frontend/          ← Static HTML/CSS/JS
    ├── index.html
    ├── css/
    └── js/
```

## How to Run

### 1. Navigate to the backend directory

```bash
cd /Users/annie/Documents/Demo/coding-jam/fridge-chef/backend
```

### 2. Install dependencies with `uv`

```bash
uv sync
```

### 3. Configure environment

Edit `.env` if needed (defaults are pre-configured for Vertex AI):

```env
GOOGLE_CLOUD_PROJECT=neon-emitter-458622-e3
GOOGLE_CLOUD_LOCATION=global
GOOGLE_GENAI_USE_VERTEXAI=true
```

### 4. Start the server

```bash
uv run uvicorn app.main:app --reload --port 8000
```

### 5. Open in browser

```
http://localhost:8000
```

The backend serves the frontend as static files, so everything runs from one URL.

## API

### `POST /api/generate-recipe`

**Request:**
```json
{
  "ingredients": ["chicken thighs", "lemon", "garlic", "rice"],
  "mode": "quick"
}
```

**Modes:** `quick` · `grandma` · `budget` · `healthy` · `fancy` (or `null`)

**Response:** Recipe JSON with `title`, `tagline`, `ingredients`, `steps`, `image_base64`, and more.

### `GET /api/health`

Returns `{"status": "ok"}`.

## Offline Fallback

If the backend is unreachable, the frontend automatically generates an intelligent demo recipe client-side — no errors, just a seamless fallback.
