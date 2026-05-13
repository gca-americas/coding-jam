# 🏠 My Corner

**AI-Powered Personal Landing Page Generator** — Tell us about yourself in your own words, and we'll turn it into a beautiful personal page you can share.

---

## What Is This?

My Corner is a web application that generates a complete, polished personal landing page from a free-form text blurb. You write a few sentences about yourself — your name, what you do, what you're proud of — and the app uses **Google Gemini AI** to create a structured personal website with:

- **Hero section** — Your name, bio, and initials avatar
- **Proud-of cards** — 3 things that define you, each with emoji and description
- **Social links** — Auto-suggested contact/social links
- **Log / micro-blog** — AI-generated journal-style posts that match your personality
- **Guestbook** — Visitors can leave messages (stored in localStorage)
- **Seasonal themes** — Spring 🌿, Summer ☀️, Autumn 🍂, Winter ❄️ color palettes
- **Dark mode** — Toggle between light and dark themes

## Project Structure

```
my-corner/
├── backend/
│   ├── main.py            # FastAPI server + Gemini AI integration
│   ├── requirements.txt   # Python dependencies
│   └── .env               # API key configuration
└── frontend/
    ├── index.html          # Three-screen UI (Setup → Loading → Page)
    ├── app.js              # Application logic, screen transitions, rendering
    └── style.css           # Warm editorial design system (Playfair Display + Inter)
```

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Backend  | Python, FastAPI, Uvicorn            |
| AI       | Google Gemini 2.5 Flash (`google-genai`) |
| Frontend | Vanilla HTML/CSS/JS                 |
| Fonts    | Playfair Display + Inter (Google Fonts) |
| Design   | Warm editorial style, CSS custom properties, seasonal themes |

---

## How to Start

### Prerequisites

- **Python 3.10+**
- **uv** (recommended) or **pip**
- A **Google Gemini API key** — get one at [aistudio.google.com](https://aistudio.google.com/)

### 1. Clone & Navigate

```bash
git clone https://github.com/gca-americas/coding-jam.git
cd coding-jam/track-6-my-corner
```

### 2. Set Up the Backend

```bash
cd backend

# Install dependencies
uv sync
```

### 3. Configure Environment Variables

Edit `backend/.env` and set your Gemini API key:

```env
GEMINI_API_KEY=your_api_key_here
```

### 4. Start the Backend Server

```bash
# From the backend/ directory
uv run uvicorn main:app --reload
```

The backend will start at **http://127.0.0.1:8000**.

> [!NOTE]
> The backend automatically serves the frontend as static files — once the backend is running, you can open **http://localhost:8000** in your browser and the full app is ready to use. No separate frontend server is needed!

### 5. (Alternative) Run Frontend Separately

If you prefer to run the frontend on its own static server for development:

```bash
# From the frontend/ directory
python3 -m http.server 8080
```

Then open **http://localhost:8080**. Note that in this mode, API calls to `/api/generate` will fail unless you proxy them to the backend or update `API_URL` in `app.js`.

---

## How It Works

```
┌──────────────┐     POST /api/generate     ┌──────────────────┐
│   Frontend   │  ───────────────────────►   │   FastAPI Backend │
│  (3 screens) │     { blurb: "..." }        │                  │
│              │                             │  Gemini 2.5 Flash│
│  Setup       │   ◄───────────────────────  │  generates JSON  │
│  Loading     │     { profile: {...} }      │  profile data    │
│  Page        │                             └──────────────────┘
└──────────────┘
```

1. **Setup Screen** — User writes about themselves in a textarea (min 20 chars, max 3000)
2. **Loading Screen** — Animated dots + rotating status messages while Gemini processes
3. **Generated Page** — The AI-structured profile renders with staggered entrance animations

---

## Sample Inputs

Not sure what to type? Copy-paste any of these into the text box to try it out:

### 🎨 The Creative Professional
```
I'm Maya, a freelance illustrator based in Portland. I specialize in editorial illustration and children's books — think whimsical watercolors with a modern twist. I'm really proud of my recent collaboration with The New Yorker and the picture book I published last fall called "The Starfish Who Learned to Fly." When I'm not drawing, I'm probably hiking with my dog Pepper, trying a new ramen spot, or teaching weekend watercolor workshops at the community center. You can find me on Instagram @mayapaints or reach me at maya@mayadraws.com.
```

### 🧑‍💻 The Student & Maker
```
Hey! I'm Jordan, a CS major at Georgia Tech graduating in 2027. I'm super into building weird side projects — my latest is a Chrome extension that replaces every stock photo on the internet with pictures of capybaras (it has 2,000 users and I'm unreasonably proud of it). I also run a small Discord community for indie game devs. Outside of code, I play bass in a jazz combo and I'm trying to get better at cooking — my specialty is a surprisingly good shakshuka. I blog about dev stuff at jordan.dev and I'm always down to chat on Twitter @jordanbuilds.
```

### 🌱 The Career Switcher
```
My name is Priya and I just made the scariest decision of my life — I left my corporate finance job to become a yoga instructor and wellness coach. I spent 8 years at Goldman Sachs and honestly loved the intensity, but I realized I was helping everyone else build wealth while neglecting my own health. Now I teach morning vinyasa classes at a studio in Brooklyn, I'm getting certified in Ayurvedic nutrition, and I started a newsletter called "Balance Sheet" where I write about the intersection of financial wellness and physical wellness. I'm proud that I actually did the thing I was afraid to do. Find me on LinkedIn or email me at priya@balancesheet.co.
```

---

## Features at a Glance

- 🎨 **Seasonal color palettes** — Auto-detects current season, or manually switch
- 🌙 **Dark mode** — Persisted in localStorage
- ✏️ **Edit button** — Go back to setup and regenerate
- 📝 **Guestbook** — localStorage-based visitor messages
- 📱 **Fully responsive** — Optimized for mobile, tablet, and desktop
- ♿ **Accessible** — Respects `prefers-reduced-motion`, semantic HTML, ARIA labels
