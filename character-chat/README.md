# Character Chat

An anime-inspired web application that lets you create an AI-powered character and have a conversation with them, powered by Google's Gemini Flash.

## Prerequisites
- Python 3.9+
- [uv](https://docs.astral.sh/uv/getting-started/installation/) (Python package manager)
- A Google Gemini API Key

## Setup & Running the Application

1. **Configure your API Key**
   Make sure you have an `.env` file in the `backend/` directory with your Gemini API key:
   ```env
   GOOGLE_API_KEY=your_api_key_here
   ```

2. **Start the server**
   From the `backend/` directory, run:
   ```bash
   cd /Users/annie/Documents/Demo/coding-jam/character-chat/backend
   uv run uvicorn main:app --reload
   ```
   `uv` will automatically create the virtual environment and install all dependencies on the first run.

3. **Open the app**
   Open your browser and navigate to: [http://localhost:8000](http://localhost:8000)

## Features
- **Character Creation:** Give your character a name, personality, and a rule for what they would *never* say.
- **AI Chat:** Engage in a conversation powered by Gemini 2.5 Flash.
- **Anime Aesthetic:** Sakura petal particles, beautiful glassmorphic UI, and cozy anime backgrounds.
