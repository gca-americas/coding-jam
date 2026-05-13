# 🫙 MoodJar

**Drop a thought, receive warmth.** A gentle AI-powered comfort app where you write anything — the weather, someone you thought of, something that just happened — and receive a beautiful, shareable card with 3 comforting sentences and a relevant emoji.

---

## What Is This?

MoodJar is a single-screen web app that creates a gentle ritual: write a thought → drop it in your jar → receive warmth back. It uses **Google Gemini AI** to generate specific, warm responses matched to whatever you wrote.

The result is displayed on a stunning glassmorphism card designed to be **screenshotted and shared**.

---

## Project Structure

```
track-5-moodjar/
├── README.md                     # This file
├── frontend/
│   ├── index.html                # Single-page UI (input → loading → card)
│   ├── style.css                 # Design system (warm pastels, glassmorphism)
│   └── app.js                    # State machine, API calls, animations
└── backend/
    ├── main.py                   # FastAPI server + Gemini AI integration
    ├── prompts.py                # AI system prompt configuration
    ├── pyproject.toml            # Python project config (for uv)
    ├── requirements.txt          # Python dependencies (for pip)
    └── .env                      # API key configuration (you create this)
```

## Tech Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Backend  | Python, FastAPI, Uvicorn                |
| AI       | Google Gemini 3 Flash via Vertex AI (`google-genai`) |
| Frontend | Vanilla HTML/CSS/JS                     |
| Fonts    | Lora + Inter (Google Fonts)             |
| Design   | Warm pastel palette, glassmorphism, CSS bokeh & sunlight effects |

---

## Prerequisites

Before you start, make sure you have:

- **Python 3.11+** installed ([python.org](https://python.org))
- **uv** package manager (recommended) — install with:
  ```bash
  curl -LsSf https://astral.sh/uv/install.sh | sh
  ```
  Or use **pip** if you prefer.
- A **Google Cloud project** with the [Vertex AI API](https://console.cloud.google.com/apis/library/aiplatform.googleapis.com) enabled
- **gcloud CLI** installed and authenticated — [install guide](https://cloud.google.com/sdk/docs/install)

---

## Setup & Running

### Step 1: Navigate to the project

```bash
cd track-5-moodjar
```

### Step 2: Authenticate with Google Cloud

Run this once to set up Application Default Credentials:

```bash
gcloud auth application-default login
```

This opens a browser for you to sign in with your Google account. The credentials are cached locally.

### Step 3: Configure your `.env` file

Open `backend/.env` in your editor and set your Google Cloud project ID and region:

```env
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
```

> [!IMPORTANT]
> The `.env` file should never be committed to version control. Make sure it's in your `.gitignore`.

**Where to find your project ID:**
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Your project ID is shown in the project selector at the top
3. Or run: `gcloud config get-value project`

### Step 4: Install dependencies

Using **uv** (recommended):
```bash
cd backend
uv sync
```

Or using **pip**:
```bash
cd backend
pip install -r requirements.txt
```

### Step 5: Start the server

Using **uv**:
```bash
cd backend
uv run uvicorn main:app --reload
```

Or using **pip**:
```bash
cd backend
uvicorn main:app --reload
```

The server starts at **http://127.0.0.1:8000**.

### Step 6: Open the app

Open your browser and go to:

**👉 http://localhost:8000**

That's it! The backend serves the frontend automatically — no separate frontend server needed.

---

## How It Works

```
┌──────────────────┐     POST /api/generate     ┌──────────────────┐
│     Frontend     │  ────────────────────────►  │  FastAPI Backend  │
│                  │     { thought: "..." }      │                  │
│  Input State     │                             │  Gemini 3 Flash  │
│  Loading State   │  ◄────────────────────────  │  generates JSON  │
│  Result Card     │  { emoji, sentences[] }     │  comfort response│
└──────────────────┘                             └──────────────────┘
```

1. **Write** — Type any thought in the textarea
2. **Drop** — Click "Drop into my jar"
3. **Receive** — A glassmorphism card appears with an emoji and 3 comforting sentences
4. **Repeat** — Click "Place something else" to start fresh

---

## Sample Inputs

Not sure what to type? Try any of these:

| Input | What to expect |
|-------|---------------|
| "It's raining and the sound on the roof is really nice" | Warm acknowledgment of the small moment |
| "I thought about my best friend from college today" | Tender response about connection |
| "I made really good pasta tonight and no one was around to try it" | Lighthearted, slightly bittersweet warmth |
| "The sunset was incredible and I just stood there for a while" | Celebratory, nature-loving |
| "I'm tired but the good kind of tired" | Matching the gentle exhaustion energy |

---

## Troubleshooting

### "The sunlight's being shy. Try again?"
This usually means one of:
- Your API key is invalid or expired — check `backend/.env`
- You've hit the Gemini API rate limit — wait a moment and retry
- Network issue — check your internet connection

### Server won't start
- Make sure you're in the `backend/` directory
- Check that Python 3.11+ is installed: `python3 --version`
- If using uv, make sure it's installed: `uv --version`

### Fonts look wrong
- Make sure you have internet access (Google Fonts loads via CDN)
- Try a hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)

---

## AI Model & Configuration

### Which Gemini model is used?

This app uses **Gemini 3 Flash** (`gemini-3-flash-preview`) — Google's latest fast multimodal model. It's configured in `backend/main.py`:

```python
MODEL = "gemini-3-flash-preview"
```

Gemini 2.5 Flash is ideal for this project because:
- ⚡ **Fast** — typical response time is 2–4 seconds
- 🎯 **Structured output** — supports `response_mime_type="application/json"` for reliable JSON responses
- 🧠 **Smart enough** — produces warm, nuanced, context-aware text

### SDK

The backend uses the **`google-genai` Python SDK** (v2.2.0) — this is Google's unified SDK for Gemini. It's the newer SDK (not the older `google-generativeai` package). It supports both API key and Vertex AI authentication through the same `genai.Client()` interface.

```
pip package: google-genai>=1.14.0
import: from google import genai
```

### Generation Parameters

The AI call uses these settings:

| Parameter | Value | Why |
|-----------|-------|-----|
| `model` | `gemini-3-flash-preview` | Latest Flash model, fast, great at structured output |
| `temperature` | `0.8` | Slightly creative — produces warm, varied responses instead of robotic/repetitive ones |
| `response_mime_type` | `application/json` | Forces Gemini to return valid JSON directly, avoiding unreliable text parsing |

---

### Authentication: Vertex AI (Default)

The app defaults to **Vertex AI** using Application Default Credentials. This is the recommended approach.

**What you need:**
1. A Google Cloud project with the **Vertex AI API** enabled
2. `gcloud auth application-default login` (run once)
3. `GOOGLE_CLOUD_PROJECT` and `GOOGLE_CLOUD_LOCATION` set in `backend/.env`

**Your `.env` file:**

```env
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
```

> [!TIP]
> Common locations: `us-central1`, `europe-west1`, `asia-northeast1`. See [all available regions](https://cloud.google.com/vertex-ai/generative-ai/docs/learn/locations).

---

### Alternative: API Key (Fallback)

If you don't have a GCP project set up, you can use a Google AI Studio API key instead. When `GEMINI_API_KEY` is present in `.env`, the app automatically uses API key mode instead of Vertex AI.

**Step 1: Get an API key**

1. Go to **[aistudio.google.com/apikey](https://aistudio.google.com/apikey)**
2. Sign in and click **"Create API Key"**
3. Copy the key

**Step 2: Set it in `.env`**

```env
GEMINI_API_KEY=AIzaSy...your_key_here
```

> [!NOTE]
> When `GEMINI_API_KEY` is set, the app ignores `GOOGLE_CLOUD_PROJECT` / `GOOGLE_CLOUD_LOCATION` and uses the API key directly. Remove `GEMINI_API_KEY` from `.env` to switch back to Vertex AI.

---

### How the code picks between Vertex AI and API Key

In `backend/main.py`, the logic is simple — if an API key is present, use it; otherwise default to Vertex AI:

```python
api_key = os.getenv("GEMINI_API_KEY")

if api_key:
    # API key mode — for quick local dev without GCP setup
    client = genai.Client(api_key=api_key)
else:
    # Vertex AI mode (default) — uses ADC + project/location from .env
    client = genai.Client(
        vertexai=True,
        project=os.getenv("GOOGLE_CLOUD_PROJECT"),
        location=os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1"),
    )
```

**Priority**: `GEMINI_API_KEY` (if set) → Vertex AI (default).

---

### Changing the Model

To use a different Gemini model, edit the `MODEL` constant in `backend/main.py`:

```python
# Current (recommended — matches inner-canvas)
MODEL = "gemini-3-flash-preview"

# Alternatives:
MODEL = "gemini-2.5-flash"         # Stable, well-tested
MODEL = "gemini-2.5-pro"           # Slower but more capable
```

> [!WARNING]
> Preview models (like `gemini-3-flash-preview`) may change behavior between versions. Stick with `gemini-2.5-flash` for stability.

---

### Environment Variable Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GOOGLE_CLOUD_PROJECT` | Yes (Vertex AI mode) | — | Your Google Cloud project ID |
| `GOOGLE_CLOUD_LOCATION` | Yes (Vertex AI mode) | `us-central1` | GCP region (e.g., `us-central1`, `europe-west1`) |
| `GEMINI_API_KEY` | No | — | If set, switches to API key mode (overrides Vertex AI) |

---

## License

Built with ☀️ for the coding jam.

