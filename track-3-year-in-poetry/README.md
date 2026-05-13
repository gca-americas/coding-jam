# Year in Poetry (My Year in Moments)

A beautiful, scroll-driven web experience that turns your meaningful dates into a quietly emotional, AI-curated calendar. "Your whole year, laid out like a poem."

## Setup Instructions

### 1. Backend Configuration
Navigate to the backend directory and install dependencies with `uv`:
```bash
cd backend

# Install dependencies
uv sync
```

### 2. Environment Variables
Create a `.env` file in the `backend/` directory and add your Gemini API key:
```env
GEMINI_API_KEY=your_api_key_here
```

### 3. Running the App
Once your environment is set up and your API key is added, you can start the FastAPI backend. (The backend will automatically serve the frontend files!)

Run the following command from the `backend/` directory:
```bash
uv run uvicorn main:app --reload --port 8090
```

### 4. Open the App
Open your browser and navigate to:
[http://localhost:8090](http://localhost:8090)

---
*Note: Make sure your terminal remains open and running while you're using the application.*
