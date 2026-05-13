# Inner Canvas (Mood Reflection App)

Inner Canvas is an AI-powered mood journaling application that transforms your text entries into mood-matched generative art and gentle reflection questions, providing a cinematic "ceremony" reveal experience.

## Prerequisites

- Python 3.10+
- `uv` package manager installed
- A Gemini API Key with Image Generation capabilities (`gemini-2.5-flash` and `gemini-2.0-flash-preview-image-generation` are used)

## Setup & Running the App

### 1. Backend Setup

The backend handles API requests, AI text/image generation, and prompt orchestration.

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd /Users/annie/Documents/Demo/coding-jam/inner-canvas/backend
   ```
2. Create a `.env` file from the `.env.example` (or create a new one) and add your Gemini API Key:
   ```env
   GEMINI_API_KEY="your_api_key_here"
   ```
   *(Note: You can optionally set `GOOGLE_GENAI_USE_VERTEXAI="true"` and configure Google Cloud project settings if you are using Vertex AI).*
3. Start the FastAPI backend using `uv`. This will automatically install the necessary dependencies (`FastAPI`, `google-genai`, etc.) and start the server on port **8000**, which the frontend expects:
   ```bash
   uv run uvicorn main:app --reload
   ```

### 2. Frontend Setup

The frontend is built with vanilla HTML, JavaScript, and CSS and just needs a simple static file server.

1. Open a new terminal window and navigate to the `frontend` directory:
   ```bash
   cd /Users/annie/Documents/Demo/coding-jam/inner-canvas/frontend
   ```
2. Start a local static HTTP server (you can use Python's built-in server):
   ```bash
   python3 -m http.server 8080
   ```
3. Open your browser and navigate to `http://localhost:8080` to experience the app!

## Usage
Simply type out your thoughts or feelings in the text area and submit. The app will analyze the mood of your entry, generate abstract artwork representing those emotions, and provide a thoughtful reflection question.
