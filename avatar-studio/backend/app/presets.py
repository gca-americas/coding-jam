"""Art style preset definitions — prompt engineering for Gemini style transfer."""

# ─── 6 Art Styles × 2 Subjects = 12 Prompt Variants ──────────────────────────

STYLES = {
    "lego": {
        "name": "LEGO Minifig",
        "emoji": "🧱",
        "tagline": "Plastic fantastic",
        "color": "#FFD23F",
        "prompts": {
            "human": (
                "Transform this photo into a LEGO minifigure portrait. "
                "Capture the person's key facial features, hair shape, and expression "
                "as a plastic LEGO character. Yellow skin tone typical of classic LEGO, "
                "simple printed face detail, cylindrical head, C-shaped hands. "
                "Show the torso with a printed design that matches their clothing style. "
                "Place on a clean LEGO baseplate with soft studio lighting. "
                "Toy photography style, shallow depth of field, tilt-shift effect."
            ),
            "pet": (
                "Transform this pet photo into a LEGO brick-built animal figure. "
                "Capture the animal's breed, coloring, and expression as a LEGO creature. "
                "Smooth plastic surfaces, bright saturated colors, stud details visible. "
                "The animal should be recognizable but clearly made of LEGO bricks. "
                "Toy photography, shallow depth of field, clean LEGO baseplate background."
            ),
        },
    },
    "pixel-hero": {
        "name": "Pixel Hero",
        "emoji": "👾",
        "tagline": "16-bit legend",
        "color": "#39FF14",
        "prompts": {
            "human": (
                "Transform this photo into a 16-bit pixel art RPG character portrait. "
                "Preserve the person's key recognizable features and expression. "
                "Visible crisp pixels, limited vibrant 32-color palette, "
                "clean pixel placement, slight dithering for shading. "
                "Style of classic SNES/GBA RPG character select screens. "
                "128×128 pixel resolution scaled up with nearest-neighbor interpolation. "
                "No blur, no anti-aliasing. Pure retro pixel art."
            ),
            "pet": (
                "Transform this pet photo into a 16-bit pixel art RPG companion creature. "
                "Preserve the animal's breed, coloring, and expression. "
                "Adorable pixel art style, limited vibrant palette, clean pixel work. "
                "The pet looks like a beloved companion from a classic JRPG. "
                "Scaled up with nearest-neighbor, crisp pixels, no blur."
            ),
        },
    },
    "manga-bw": {
        "name": "日本漫画 B&W Manga",
        "emoji": "🖤",
        "tagline": "Black ink protagonist",
        "color": "#1A1A1A",
        "prompts": {
            "human": (
                "Transform this photo into a dramatic black-and-white Japanese manga panel "
                "illustration. Preserve the person's facial features and expression. "
                "Bold ink lines, high contrast, dramatic speed lines or tone patterns "
                "in the background. Screentone shading, expressive manga eyes, "
                "dynamic composition. Style of Takehiko Inoue or Naoki Urasawa. "
                "Pure black and white, absolutely no color. Professional manga quality."
            ),
            "pet": (
                "Transform this pet photo into a dramatic black-and-white Japanese manga "
                "illustration. Bold ink brushstrokes, high contrast, the animal drawn "
                "with intense detail and fierce personality. Screentone shading, "
                "dynamic pose, speed lines in background. The pet looks like a legendary "
                "creature from a seinen manga. Pure black and white, absolutely no color."
            ),
        },
    },
    "watercolor": {
        "name": "Watercolor Dream",
        "emoji": "🎨",
        "tagline": "Painted by light",
        "color": "#7EB8DA",
        "prompts": {
            "human": (
                "Transform this photo into a delicate watercolor portrait painting. "
                "Preserve the person's features and expression. "
                "Soft wet-on-wet watercolor technique, visible paper texture, "
                "colors bleeding naturally at edges, luminous transparent washes. "
                "Gentle palette of soft blues, warm pinks, and golden light. "
                "Fine detail in the face, looser expressive brushwork around the edges. "
                "Museum-quality fine art watercolor illustration."
            ),
            "pet": (
                "Transform this pet photo into a gentle watercolor painting. "
                "Preserve the animal's breed, coloring, and expression. "
                "Soft transparent washes, colors bleeding naturally, visible paper texture, "
                "luminous light shining through. Tender detail on the animal, "
                "loose expressive brushwork at the edges. "
                "Beautiful fine-art watercolor illustration."
            ),
        },
    },
    "claymation": {
        "name": "Claymation",
        "emoji": "🫶",
        "tagline": "Stop-motion star",
        "color": "#E07A5F",
        "prompts": {
            "human": (
                "Transform this photo into a claymation stop-motion animated character. "
                "Preserve the person's key facial features and expression. "
                "Smooth clay and plasticine texture, subtle fingerprint impressions "
                "visible on the surface, slightly exaggerated proportions, "
                "warm studio lighting with soft shadows. "
                "Style of Aardman Animations (Wallace & Gromit, Shaun the Sheep). "
                "Shot on a miniature handmade set. Shallow depth of field."
            ),
            "pet": (
                "Transform this pet photo into a claymation stop-motion character. "
                "Preserve the animal's breed and expression. "
                "Smooth plasticine texture with subtle fingerprints, warm studio lighting, "
                "handmade miniature set background. Adorable and expressive, "
                "like an Aardman Animations character. Shallow depth of field, warm colors."
            ),
        },
    },
    "cyberpunk": {
        "name": "Cyberpunk Neon",
        "emoji": "⚡",
        "tagline": "Neon-lit rebel",
        "color": "#FF00E5",
        "prompts": {
            "human": (
                "Transform this photo into a cyberpunk neon-lit character portrait. "
                "Preserve the person's facial features and expression. "
                "Dramatic neon lighting in hot magenta and electric cyan, "
                "rain-slicked reflections, holographic UI elements floating nearby, "
                "augmented reality overlays. Futuristic clothing with LED accents. "
                "Dark urban background with glowing neon signs. "
                "Hyper-stylized, cinematic cyberpunk aesthetic."
            ),
            "pet": (
                "Transform this pet photo into a cyberpunk neon-lit creature. "
                "Preserve the animal's breed and coloring. "
                "The pet has subtle cybernetic enhancements, glowing neon accents, "
                "holographic high-tech collar or visor. Dramatic magenta and cyan lighting, "
                "rain-slicked futuristic surfaces, dark neon city background. "
                "Cinematic cyberpunk aesthetic."
            ),
        },
    },
}

# ─── Lore Generation ─────────────────────────────────────────────────────────

LORE_PROMPT = """You are a creative character designer.
The user just created a {style_name}-style avatar of their {subject_type}.

Generate a fun, creative character profile. Return ONLY valid JSON with this exact structure:
{{
  "name": "A creative character name (2-3 words max)",
  "title": "An epic title or role (e.g., 'Guardian of the Midnight Realm')",
  "backstory": "A fun 2-sentence backstory that matches the {style_name} aesthetic",
  "stats": {{
    "charisma": <number 50-100>,
    "power": <number 50-100>,
    "wisdom": <number 50-100>,
    "cuteness": <number 50-100>
  }}
}}

Be creative, fun, and match the tone to the art style.
For pets, make it extra adorable and slightly anthropomorphic.
Return ONLY the JSON, no markdown, no explanation."""

# Ordered list for the frontend
STYLE_LIST = [
    {
        "key": key,
        "name": s["name"],
        "emoji": s["emoji"],
        "tagline": s["tagline"],
        "color": s["color"],
    }
    for key, s in STYLES.items()
]
