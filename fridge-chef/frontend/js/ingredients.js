/* ============================================
   fridge chef ✿ ingredient parser & tag manager
   ============================================ */

const INGREDIENT_CATEGORIES = {
  protein: {
    color: 'protein',
    items: ['chicken', 'beef', 'pork', 'salmon', 'tuna', 'shrimp', 'tofu', 'egg', 'eggs', 'turkey', 'lamb', 'bacon', 'sausage', 'ham', 'fish', 'steak', 'meatball', 'crab', 'lobster', 'duck', 'veal', 'tempeh', 'seitan', 'cod', 'tilapia', 'anchovies', 'sardines', 'chorizo', 'prosciutto', 'pancetta', 'mince', 'ground beef', 'ground turkey', 'chicken thighs', 'chicken breast', 'chicken wings', 'drumsticks']
  },
  vegetable: {
    color: 'vegetable',
    items: ['broccoli', 'spinach', 'kale', 'carrot', 'carrots', 'onion', 'onions', 'garlic', 'tomato', 'tomatoes', 'pepper', 'peppers', 'bell pepper', 'potato', 'potatoes', 'sweet potato', 'mushroom', 'mushrooms', 'zucchini', 'cucumber', 'lettuce', 'celery', 'corn', 'peas', 'beans', 'green beans', 'asparagus', 'cauliflower', 'cabbage', 'eggplant', 'artichoke', 'beet', 'beets', 'radish', 'turnip', 'leek', 'scallion', 'scallions', 'green onion', 'bok choy', 'arugula', 'jalapeno', 'ginger']
  },
  grain: {
    color: 'grain',
    items: ['rice', 'pasta', 'bread', 'noodles', 'quinoa', 'oats', 'flour', 'tortilla', 'tortillas', 'couscous', 'barley', 'bulgur', 'farro', 'cornmeal', 'polenta', 'pita', 'ramen', 'udon', 'soba', 'orzo', 'lasagna', 'spaghetti', 'penne', 'macaroni', 'crackers', 'cereal', 'bagel', 'baguette', 'sourdough', 'flatbread']
  },
  dairy: {
    color: 'dairy',
    items: ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'sour cream', 'cream cheese', 'mozzarella', 'parmesan', 'cheddar', 'feta', 'ricotta', 'brie', 'gouda', 'swiss', 'goat cheese', 'cottage cheese', 'heavy cream', 'half and half', 'whipping cream', 'condensed milk', 'evaporated milk', 'ghee']
  },
  condiment: {
    color: 'condiment',
    items: ['soy sauce', 'hot sauce', 'ketchup', 'mustard', 'mayo', 'mayonnaise', 'vinegar', 'olive oil', 'sesame oil', 'fish sauce', 'oyster sauce', 'sriracha', 'teriyaki', 'bbq sauce', 'salsa', 'pesto', 'hummus', 'tahini', 'miso', 'miso paste', 'worcestershire', 'hoisin', 'sambal', 'gochujang', 'curry paste', 'tomato paste', 'tomato sauce', 'marinara', 'coconut milk', 'stock', 'broth', 'chicken broth', 'beef broth', 'vegetable broth', 'wine', 'beer', 'honey', 'maple syrup', 'sugar', 'brown sugar', 'salt', 'pepper', 'cumin', 'paprika', 'oregano', 'basil', 'thyme', 'rosemary', 'cinnamon', 'turmeric', 'chili flakes', 'bay leaf', 'nutmeg', 'vanilla']
  },
  fruit: {
    color: 'fruit',
    items: ['apple', 'apples', 'banana', 'bananas', 'lemon', 'lemons', 'lime', 'limes', 'orange', 'oranges', 'avocado', 'strawberry', 'strawberries', 'blueberry', 'blueberries', 'raspberry', 'raspberries', 'grape', 'grapes', 'mango', 'pineapple', 'peach', 'pear', 'cherry', 'cherries', 'watermelon', 'coconut', 'fig', 'pomegranate', 'kiwi', 'plum', 'apricot', 'cranberry', 'cranberries', 'raisin', 'raisins', 'dates']
  }
};

class IngredientManager {
  constructor() {
    this.ingredients = [];
    this.tagsArea = document.getElementById('tags-area');
    this.textarea = document.getElementById('ingredient-input');
    this.generateBtn = document.getElementById('generate-btn');
    this.onChangeCallbacks = [];

    this._bindEvents();
  }

  _bindEvents() {
    this.textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this._parseAndAdd();
      }
    });

    this.textarea.addEventListener('input', () => {
      const val = this.textarea.value;
      if (val.endsWith(',') || val.endsWith('\n')) {
        this._parseAndAdd();
      }
      this._updateButtonState();
    });

    this.textarea.addEventListener('blur', () => {
      if (this.textarea.value.trim()) {
        this._parseAndAdd();
      }
    });
  }

  _parseAndAdd() {
    const raw = this.textarea.value;
    const items = raw
      .split(/[,\n]|(?:\band\b)/gi)
      .map(s => s.trim().toLowerCase())
      .filter(s => s.length > 1 && !this.ingredients.includes(s));

    items.forEach(item => {
      const cleaned = item
        .replace(/^(some|a few|a bit of|a little|half a|half|leftover|leftover |i have|i've got|there's|we have|maybe)\s+/i, '')
        .trim();
      if (cleaned && !this.ingredients.includes(cleaned)) {
        this.ingredients.push(cleaned);
        this._renderTag(cleaned);
      }
    });

    this.textarea.value = '';
    this._updateButtonState();
    this._notifyChange();
  }

  _categorize(ingredient) {
    const lower = ingredient.toLowerCase();
    for (const [, data] of Object.entries(INGREDIENT_CATEGORIES)) {
      if (data.items.some(item => lower.includes(item) || item.includes(lower))) {
        return data.color;
      }
    }
    return 'other';
  }

  _renderTag(ingredient) {
    const category = this._categorize(ingredient);
    const tag = document.createElement('span');
    tag.className = `tag tag--${category}`;
    tag.setAttribute('data-ingredient', ingredient);

    tag.innerHTML = `
      <span class="tag__dot" aria-hidden="true"></span>
      <span class="tag__label">${ingredient}</span>
      <button class="tag__remove" aria-label="remove ${ingredient}" title="remove">×</button>
    `;

    tag.querySelector('.tag__remove').addEventListener('click', () => {
      this._removeIngredient(ingredient);
      tag.style.transform = 'scale(0) rotate(20deg)';
      tag.style.opacity = '0';
      setTimeout(() => tag.remove(), 220);
    });

    this.tagsArea.appendChild(tag);
  }

  _removeIngredient(ingredient) {
    this.ingredients = this.ingredients.filter(i => i !== ingredient);
    this._updateButtonState();
    this._notifyChange();
  }

  _updateButtonState() {
    const hasIngredients = this.ingredients.length > 0 || this.textarea.value.trim().length > 0;
    this.generateBtn.disabled = !hasIngredients;
  }

  getIngredients() {
    if (this.textarea.value.trim()) {
      this._parseAndAdd();
    }
    return [...this.ingredients];
  }

  clear() {
    this.ingredients = [];
    this.tagsArea.innerHTML = '';
    this.textarea.value = '';
    this._updateButtonState();
  }

  onChange(callback) {
    this.onChangeCallbacks.push(callback);
  }

  _notifyChange() {
    this.onChangeCallbacks.forEach(cb => cb(this.ingredients));
  }

  getEmojis() {
    const emojiMap = {
      protein: ['🍗', '🥩', '🍖', '🐟', '🥚', '🦐'],
      vegetable: ['🥦', '🥕', '🧅', '🍅', '🥬', '🌽', '🧄', '🍄'],
      grain: ['🍚', '🍞', '🍝', '🌾'],
      dairy: ['🧀', '🥛', '🧈'],
      condiment: ['🫙', '🍯', '🧂'],
      fruit: ['🍋', '🍎', '🥑', '🍌', '🫐']
    };

    const emojis = [];
    this.ingredients.forEach(ing => {
      const cat = this._categorize(ing);
      const catEmojis = emojiMap[cat] || ['🥘'];
      emojis.push(catEmojis[Math.floor(Math.random() * catEmojis.length)]);
    });

    return emojis.slice(0, 3);
  }
}
