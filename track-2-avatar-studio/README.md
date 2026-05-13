# 🎭 Avatar Studio

Avatar Studio is an AI Art Style Transfer web application that transforms user-uploaded photos (faces or pets) into stunning avatars across various art styles like LEGO, Pixel Art, Manga, Watercolor, Claymation, and Cyberpunk.

## Setup and Running

The application consists of a FastAPI backend that also serves the vanilla HTML/CSS/JS frontend. It uses `uv` for dependency management.

### Prerequisites
- Python 3.11+
- `uv` installed

### Steps to Run

1. **Navigate to the Backend Directory**
   Open your terminal and change into the backend folder:
   ```bash
   cd backend
   ```

2. **Verify Configuration**
   Ensure the `.env` file exists in the `backend` directory. It should contain the required Google Cloud and Vertex AI settings (which are already set up in your workspace):
   ```env
   GOOGLE_CLOUD_PROJECT=neon-emitter-458622-e3
   GOOGLE_CLOUD_LOCATION=global
   GOOGLE_GENAI_USE_VERTEXAI=true
   ```

3. **Start the Application**
   Run the FastAPI server using `uv`:
   ```bash
   uv run uvicorn app.main:app --reload
   ```
   *(This will automatically install dependencies from `uv.lock` if they aren't already set up and start the server)*
   
   > **Note:** If port `8000` is already in use, you can specify a different port using the `--port` flag (e.g., `uv run uvicorn app.main:app --reload --port 8080`).

4. **Access the App**
   Open your web browser and navigate to:
   **[http://localhost:8000](http://localhost:8000)**

   The frontend UI is served directly by the backend from the root URL.
