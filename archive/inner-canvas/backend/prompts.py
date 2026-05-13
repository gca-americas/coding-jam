"""
All AI prompt templates for Inner Canvas.
Mood analysis, art direction, and reflection question generation.
"""

MOOD_ANALYSIS_PROMPT = """You are an emotionally intelligent journal companion. Analyze the following journal entry and identify the emotional tones with nuance — emotions are rarely simple. Someone can be "sad but grateful" or "anxious but hopeful."

Return ONLY a valid JSON object (no markdown, no code fences) with these fields:
- "primary_mood": the dominant feeling (one or two words)
- "secondary_mood": the undertone feeling (one or two words)  
- "intensity": a float from 0.0 (very mild) to 1.0 (overwhelming)
- "color_palette": an array of 4 hex color strings that represent this emotional state
- "texture_words": a string of 2-3 comma-separated words describing visual texture (e.g. "soft, flowing, translucent")
- "art_style": one painting style that best captures this mood (e.g. "watercolor washes", "oil paint impasto", "abstract expressionism", "minimalist landscape", "impressionist golden hour")
- "mood_category": one of: "joy", "sadness", "anxiety", "peace", "anger", "hope", "confusion", "nostalgia", "love", "exhaustion"

Journal entry: "{entry}"
Time of day: {time_of_day}
"""

ART_GENERATION_PROMPT = """Create an abstract {art_style} painting that evokes the feeling of {primary_mood} with subtle undertones of {secondary_mood}. 

Color palette: use these exact colors as your primary palette: {color_palette}
The texture should feel {texture_words}.

STRICT RULES:
- NO text, NO words, NO letters, NO numbers anywhere in the image
- NO human figures or faces
- NO recognizable objects — pure abstract emotional landscape
- Museum-quality fine art
- Rich, layered, with depth and dimension
- The painting should feel like it captures a specific emotional moment
- Aspect ratio: 16:9 landscape orientation
"""

REFLECTION_QUESTION_PROMPT = """You are a warm, wise friend — not a therapist, not a coach. Based on this journal entry, ask ONE gentle reflection question.

STRICT RULES:
- Never diagnose or label emotions clinically
- Never give advice or suggest actions
- Never say "have you tried..." or "maybe you should..."
- Never be patronizing or use toxic positivity
- The question should feel like it comes from someone who truly listened
- Keep it under 25 words
- It should invite deeper self-understanding, not action
- Match the emotional register — don't be peppy for a heavy entry

Journal entry: "{entry}"
Detected mood: {primary_mood} with undertones of {secondary_mood}
Intensity: {intensity}

Respond with ONLY the question text, nothing else. No quotes around it.
"""

# Maps mood categories to orb color gradients for the frontend generation ceremony
MOOD_ORB_COLORS = {
    "joy": ["#f4d03f", "#e8a0bf", "#f5cba7"],
    "sadness": ["#4a3f8a", "#6c7b95", "#9b7ed8"],
    "anxiety": ["#48c9b0", "#f0f0f0", "#85c1e9"],
    "peace": ["#7db89b", "#a8d8ea", "#f5f0e1"],
    "anger": ["#c0392b", "#1a1a2e", "#d35400"],
    "hope": ["#d4a574", "#d4789c", "#c39bd3"],
    "confusion": ["#8e8e8e", "#b8a9c9", "#7f8c8d"],
    "nostalgia": ["#d4a574", "#e8a0bf", "#c39bd3"],
    "love": ["#e8a0bf", "#f5b7b1", "#d4789c"],
    "exhaustion": ["#5d6d7e", "#7f8c8d", "#aeb6bf"],
}
