"""Prompt templates for FridgeChef Gemini calls."""


MODE_FLAVORS = {
    "quick": "The recipe MUST be under 20 minutes total. Prioritise speed and simplicity.",
    "grandma": (
        "Write this like a warm, loving grandmother teaching her grandchild to cook. "
        "Include a short 2-3 sentence 'grandma_story' field — a nostalgic anecdote about this dish. "
        "The steps should be conversational and comforting."
    ),
    "budget": (
        "The recipe must be extremely budget-friendly. Avoid expensive ingredients. "
        "Suggest cheap substitutions. Keep it practical and economical."
    ),
    "healthy": (
        "The recipe must be healthy and nutritious. Emphasise whole foods, lean proteins, "
        "and vegetables. Include approximate calorie count in the tagline."
    ),
    "fancy": (
        "Make this a gourmet, restaurant-quality dish. Use sophisticated techniques and "
        "elegant plating descriptions. The difficulty should be Medium or Hard."
    ),
}


def build_recipe_prompt(ingredients: list[str], mode: str | None) -> str:
    """Build the text prompt for recipe generation."""

    ingredient_list = ", ".join(ingredients)
    mode_instruction = MODE_FLAVORS.get(mode or "", "")

    return f"""You are FridgeChef, a creative AI chef. A user has these ingredients in their fridge:

{ingredient_list}

Generate ONE delicious recipe that uses as many of these ingredients as possible.
{mode_instruction}

Respond with a JSON object using EXACTLY this schema (no markdown fences, no extra keys):

{{
  "title": "Creative recipe name",
  "tagline": "A fun one-liner about this dish",
  "prep_time_min": 10,
  "cook_time_min": 20,
  "servings": 2,
  "difficulty": "Easy",
  "ingredients": [
    {{
      "name": "ingredient name",
      "amount": "1",
      "unit": "cup",
      "user_has": true
    }}
  ],
  "steps": [
    "Step 1 description",
    "Step 2 description"
  ],
  "grandma_story": null,
  "photo_description": "A vivid description of the finished plated dish for image generation"
}}

Rules:
- "user_has" should be true for ingredients the user listed, false for extras you add.
- Include 1-3 extra pantry staples the user might need (oil, salt, etc.) with user_has=false.
- Steps should be clear, actionable, and 5-8 items long.
- "photo_description" should be a vivid, appetising description suitable for image generation.
- "grandma_story" should be null unless the mode is grandma.
- Return ONLY valid JSON. No additional text."""


def build_image_prompt(photo_description: str) -> str:
    """Build the prompt for food photo generation."""
    return (
        f"Generate a beautiful, appetising food photograph: {photo_description}. "
        "Professional food photography style, warm natural lighting, shallow depth of field, "
        "shot on a rustic wooden table with soft shadows. No text or watermarks."
    )
