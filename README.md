# Coding Jam — Google Build with AI

A collection of MVP demos built during a Google Build with AI coding jam. Each `track-N-*` folder is a self-contained mini-app powered by the Gemini API, with its own README and setup instructions.

## Tracks

| # | Project | What it does |
|---|---------|--------------|
| 1 | [track-1-glow-up](track-1-glow-up/) | Virtual hair try-on — upload a selfie, visualize new hairstyles with AI. |
| 2 | [track-2-avatar-studio](track-2-avatar-studio/) | Turn a photo into an avatar across art styles (LEGO, Pixel Art, Manga, Watercolor, Claymation, Cyberpunk). |
| 3 | [track-3-year-in-poetry](track-3-year-in-poetry/) | Scroll-driven calendar that turns meaningful dates into an AI-curated "year as a poem." |
| 4 | [track-4-fridge-chef](track-4-fridge-chef/) | Turn random fridge ingredients into AI-generated recipes with food photography. |
| 5 | [track-5-moodjar](track-5-moodjar/) | "Windowsill" — write a passing thought, get a shareable comfort card with 3 gentle sentences. |
| 6 | [track-6-my-corner](track-6-my-corner/) | AI-powered personal landing page generator from a plain-language self-description. |
| 7 | [track-7-bulletproof](track-7-bulletproof/) | Career Tailor — sharpen resume bullets to match a specific job posting. |
| 8 | [track-8-character-chat](track-8-character-chat/) | Anime-inspired chat with an AI character you create. |

Archived early prototypes live in [archive/](archive/).

## Common stack

Most tracks share the same shape:

- **Backend**: Python (FastAPI), dependencies managed with [`uv`](https://docs.astral.sh/uv/)
- **Frontend**: Vanilla HTML / CSS / JS (a couple of tracks serve the frontend directly from the FastAPI backend)
- **AI**: Google Gemini API (a few tracks also use Vertex AI / Imagen)

## Getting started

```bash
git clone https://github.com/gca-americas/coding-jam.git
cd coding-jam/track-<N>-<name>
```

Then follow the README inside that track. The general pattern is:

```bash
cd backend
uv sync                                    # install dependencies
cp .env.example .env                       # if present — add your GEMINI_API_KEY
uv run uvicorn main:app --reload           # entrypoint varies; check the track README
```

### Prerequisites

- Python 3.10+ (some tracks require 3.11+)
- `uv` — install with `curl -LsSf https://astral.sh/uv/install.sh | sh`
- A Google Gemini API key — [aistudio.google.com](https://aistudio.google.com/)
- For tracks that use Vertex AI / Imagen: a Google Cloud project with the relevant APIs enabled

## Repo layout

```
coding-jam/
├── track-1-glow-up/
├── track-2-avatar-studio/
├── track-3-year-in-poetry/
├── track-4-fridge-chef/
├── track-5-moodjar/
├── track-6-my-corner/
├── track-7-bulletproof/
├── track-8-character-chat/
└── archive/
    └── inner-canvas/
```
