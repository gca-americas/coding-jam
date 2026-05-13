# Glow Up ✨

A virtual hair try-on app that uses AI to visualize new hairstyles on your uploaded selfie.

## Setup Instructions

### Prerequisites
Make sure you have `uv` installed for Python dependency management.

### 1. Environment Configuration

The application uses Google GenAI (Vertex AI). You need a `.env` file in the `backend` directory.

Create or update `backend/.env` with your Google Cloud credentials:
```env
GOOGLE_CLOUD_PROJECT=your-gcp-project-id
GOOGLE_CLOUD_LOCATION=global
GOOGLE_GENAI_USE_VERTEXAI=true
```

### 2. Run the Application

The frontend is served directly by the FastAPI backend, so you only need to run one server.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Start the server using `uv`:
   ```bash
   uv run uvicorn app.main:app --reload
   ```

3. Open your browser and navigate to:
   [http://127.0.0.1:8000](http://127.0.0.1:8000)

## Project Structure

- `backend/`: FastAPI backend handling the Vertex AI image generation and serving the frontend.
- `frontend/`: Vanilla HTML/CSS/JS frontend (served by the backend).
