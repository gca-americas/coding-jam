/* ============================================
   fridge chef ✿ main app controller
   ============================================ */

class FridgeChefApp {
  constructor() {
    this.ingredientManager = new IngredientManager();
    this.recipeRenderer = new RecipeRenderer();

    this.currentRecipe = null;
    this.activeMode = null;
    this.savedRecipes = JSON.parse(localStorage.getItem('fridgechef_saved') || '[]');
    this.recentRecipes = JSON.parse(localStorage.getItem('fridgechef_recent') || '[]');

    this.body = document.getElementById('body');
    this.views = {
      home: document.getElementById('view-home'),
      loading: document.getElementById('view-loading'),
      recipe: document.getElementById('view-recipe'),
    };

    this.generateBtn = document.getElementById('generate-btn');
    this.backBtn = document.getElementById('back-btn');
    this.regenerateBtn = document.getElementById('regenerate-btn');
    this.copyBtn = document.getElementById('copy-btn');
    this.saveBtn = document.getElementById('save-btn');
    this.shareBtn = document.getElementById('share-btn');
    this.shoppingCta = document.getElementById('shopping-cta');
    this.modeChips = document.querySelectorAll('.puppy-chip');
    this.loadingMessage = document.getElementById('loading-message');
    this.loadingProgressBar = document.getElementById('loading-progress-bar');

    this._bindEvents();
    this._renderRecent();
  }

  _bindEvents() {
    this.generateBtn.addEventListener('click', () => this._generate());
    this.backBtn.addEventListener('click', () => this._showView('home'));
    this.regenerateBtn.addEventListener('click', () => this._generate());
    this.copyBtn.addEventListener('click', () => this._copyRecipe());
    this.saveBtn.addEventListener('click', () => this._toggleSave());
    this.shareBtn.addEventListener('click', () => this._shareRecipe());
    this.shoppingCta.addEventListener('click', () => this._generateShoppingList());

    this.modeChips.forEach(chip => {
      chip.addEventListener('click', () => this._toggleMode(chip));
    });
  }

  // ── Mode swap (study ↔ rest) ───────────
  _setMode(mode) {
    this.body.classList.remove('study-mode', 'rest-mode');
    this.body.classList.add(`${mode}-mode`);
  }

  _showView(name) {
    Object.entries(this.views).forEach(([key, el]) => {
      el.classList.toggle('view--active', key === name);
    });

    // Loading view = rest mode (cozy break while cooking)
    // Home / recipe = study mode (active focus)
    if (name === 'loading') {
      this._setMode('rest');
    } else {
      this._setMode('study');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  _toggleMode(chip) {
    const mode = chip.dataset.mode;
    if (this.activeMode === mode) {
      this.activeMode = null;
      chip.classList.remove('puppy-chip--active');
    } else {
      this.modeChips.forEach(c => c.classList.remove('puppy-chip--active'));
      this.activeMode = mode;
      chip.classList.add('puppy-chip--active');
    }
  }

  async _generate() {
    const ingredients = this.ingredientManager.getIngredients();
    if (ingredients.length === 0) return;

    this._showView('loading');
    this._animateLoading(ingredients);

    try {
      const recipe = await this._callAPI(ingredients);
      this.currentRecipe = recipe;
      this._addToRecent(recipe);
      this.recipeRenderer.render(recipe);
      this._updateSaveButton();
      this._clearLoadingIntervals();
      this._showView('recipe');
      this._loadImageInBackground(recipe);
    } catch (error) {
      console.error('generation failed:', error);
      const demoRecipe = this._getDemoRecipe(ingredients);
      this.currentRecipe = demoRecipe;
      this._addToRecent(demoRecipe);
      this.recipeRenderer.render(demoRecipe);
      this._updateSaveButton();
      this._clearLoadingIntervals();
      this._showView('recipe');
    }
  }

  async _callAPI(ingredients) {
    const payload = { ingredients, mode: this.activeMode };
    const response = await fetch('/api/generate-recipe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`api error: ${response.status}`);
    return await response.json();
  }

  async _loadImageInBackground(recipe) {
    if (!recipe.photo_description) return;
    const requestedTitle = recipe.title;
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo_description: recipe.photo_description }),
      });
      if (!response.ok) return;
      const data = await response.json();
      if (!data.image_base64) return;
      if (!this.currentRecipe || this.currentRecipe.title !== requestedTitle) return;
      this.currentRecipe.image_base64 = data.image_base64;
      this.recipeRenderer.swapImage(data.image_base64, recipe.title);
    } catch (e) {
      console.warn('image load failed:', e);
    }
  }

  // ── Loading animation (gentle copy) ────
  _animateLoading(ingredients) {
    const messages = [
      `getting the ${ingredients.slice(0, 2).join(' & ')} out...`,
      'thinking about flavors ✿',
      'adding a little pinch of magic',
      'taste-testing in our heads',
      'plating it up just so',
      'snapping a cute photo',
      'almost ready ◌',
    ];

    let messageIndex = 0;
    let progress = 0;

    const messageInterval = setInterval(() => {
      if (messageIndex < messages.length) {
        this.loadingMessage.style.opacity = '0';
        setTimeout(() => {
          this.loadingMessage.textContent = messages[messageIndex];
          this.loadingMessage.style.opacity = '1';
          messageIndex++;
        }, 200);
      }
    }, 1300);

    const progressInterval = setInterval(() => {
      progress = Math.min(progress + Math.random() * 12, 92);
      this.loadingProgressBar.style.width = `${progress}%`;
    }, 420);

    this._loadingIntervals = { messageInterval, progressInterval };

    setTimeout(() => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
      this.loadingProgressBar.style.width = '100%';
    }, 15000);
  }

  _clearLoadingIntervals() {
    if (this._loadingIntervals) {
      clearInterval(this._loadingIntervals.messageInterval);
      clearInterval(this._loadingIntervals.progressInterval);
      this.loadingProgressBar.style.width = '100%';
    }
  }

  // ── Demo recipe (offline fallback) ─────
  _getDemoRecipe(userIngredients) {
    const lower = userIngredients.map(i => i.toLowerCase());
    const title = this._generateTitle(lower);
    const allIngredients = this._buildIngredientList(lower);

    const modeSteps = {
      grandma: [
        `start by prepping all your ingredients — grandma always said mise en place is the secret to a calm kitchen.`,
        `heat a generous glug of olive oil in your favorite heavy-bottomed pan over medium heat. let it shimmer.`,
        `add your aromatics (${lower.includes('garlic') ? 'garlic' : 'onion'}) and cook until fragrant, about 2 minutes. stir with love.`,
        `add your main protein or vegetables and cook until golden on all sides, about 5-6 minutes. don't rush this step.`,
        `season generously — a good pinch of salt, fresh cracked pepper, and whatever herbs speak to you.`,
        `if you have rice or pasta, serve it over a warm bed of it. grandma always made sure plates were warm.`,
        `plate it up family-style. the best recipes are the ones shared with people you love.`
      ],
      default: [
        `prep everything: wash, chop, and measure before the heat goes on.`,
        `warm a large skillet over medium-high with a drizzle of oil.`,
        `${lower.some(i => ['chicken', 'beef', 'pork', 'salmon', 'shrimp', 'tofu'].some(p => i.includes(p))) ? 'sear your protein until golden, about 3-4 minutes per side. set aside.' : 'add your hardiest vegetables first and cook 3-4 minutes until they soften.'}`,
        `add aromatics${lower.includes('garlic') ? ' (garlic ✿)' : ''} and cook 1 minute until fragrant.`,
        `bring everything together, add sauce or seasoning, and toss to coat.`,
        `${lower.some(i => i.includes('rice') || i.includes('pasta') || i.includes('noodle')) ? 'serve over your ' + lower.find(i => i.includes('rice') || i.includes('pasta') || i.includes('noodle')) + ', spooning extra sauce on top.' : 'serve right away while it\'s warm, with whatever side feels right.'}`,
        `garnish with fresh herbs or a squeeze of lemon if you have it. enjoy ◌`
      ]
    };

    return {
      title,
      tagline: this._generateTagline(lower),
      prep_time_min: 10,
      cook_time_min: 25,
      servings: 2,
      difficulty: this.activeMode === 'fancy' ? 'medium' : 'easy',
      ingredients: allIngredients,
      steps: this.activeMode === 'grandma' ? modeSteps.grandma : modeSteps.default,
      grandma_story: this.activeMode === 'grandma'
        ? `"when i was your age, we never had fancy recipes. we just looked at what we had and made it work. that's real cooking — not following rules, but following your heart. and taste as you go, always taste as you go."`
        : null,
      image_base64: null,
      photo_description: `a beautifully plated ${title} on a rustic ceramic plate, warm lighting, steam rising`
    };
  }

  _generateTitle(ingredients) {
    const protein = ingredients.find(i =>
      ['chicken', 'beef', 'pork', 'salmon', 'shrimp', 'tofu', 'egg', 'fish', 'steak', 'turkey'].some(p => i.includes(p))
    );
    const flavor = ingredients.find(i =>
      ['lemon', 'garlic', 'ginger', 'soy sauce', 'miso', 'lime', 'honey', 'sriracha'].some(f => i.includes(f))
    );
    const base = ingredients.find(i =>
      ['rice', 'pasta', 'noodle', 'bread', 'quinoa'].some(b => i.includes(b))
    );

    const cap = s => s.split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');

    if (this.activeMode === 'grandma') {
      if (protein && base) return `Grandma's ${cap(protein)} & ${cap(base)} Casserole`;
      if (protein) return `Grandma's Homestyle ${cap(protein)}`;
      return `Grandma's Kitchen Sink Comfort Bowl`;
    }

    if (protein && flavor && base) return `${cap(flavor)}-Glazed ${cap(protein)} with ${cap(base)}`;
    if (protein && flavor) return `${cap(flavor)} ${cap(protein)} Skillet`;
    if (protein && base) return `${cap(protein)} ${cap(base)} Bowl`;
    if (protein) return `Pan-Seared ${cap(protein)} with Herb Sauce`;
    if (ingredients.length >= 2) return `${cap(ingredients[0])} & ${cap(ingredients[1])} Fusion`;
    return `Chef's Surprise Skillet`;
  }

  _generateTagline(ingredients) {
    const taglines = [
      `made with ${ingredients.length} things you actually had`,
      `because ${ingredients[0]} + ${ingredients[ingredients.length - 1]} is a vibe`,
      `your fridge came through today ✿`,
      `random ingredients, intentional comfort`,
      `who knew ${ingredients[0]} could do all that`,
    ];
    return taglines[Math.floor(Math.random() * taglines.length)];
  }

  _buildIngredientList(userIngredients) {
    const list = userIngredients.map(ing => ({
      name: ing,
      amount: this._guessAmount(ing),
      unit: this._guessUnit(ing),
      user_has: true,
    }));

    const extras = [
      { name: 'olive oil', amount: '2', unit: 'tbsp' },
      { name: 'salt & pepper', amount: '', unit: 'to taste' },
      { name: 'fresh herbs', amount: '1', unit: 'handful' },
    ];

    const neededExtras = extras
      .filter(e => !userIngredients.some(ui => ui.includes(e.name.split(' ')[0])))
      .slice(0, 2)
      .map(e => ({ ...e, user_has: false }));

    return [...list, ...neededExtras];
  }

  _guessAmount(ingredient) {
    if (['chicken', 'beef', 'pork', 'steak'].some(p => ingredient.includes(p))) return '300';
    if (['rice', 'pasta', 'quinoa'].some(g => ingredient.includes(g))) return '1';
    if (['garlic'].some(a => ingredient.includes(a))) return '3';
    if (['lemon', 'lime', 'onion', 'avocado'].some(f => ingredient.includes(f))) return '1';
    if (['soy sauce', 'hot sauce', 'fish sauce'].some(s => ingredient.includes(s))) return '2';
    return '1';
  }

  _guessUnit(ingredient) {
    if (['chicken', 'beef', 'pork', 'steak', 'salmon'].some(p => ingredient.includes(p))) return 'g';
    if (['rice', 'pasta', 'quinoa', 'flour'].some(g => ingredient.includes(g))) return 'cup';
    if (['garlic'].some(a => ingredient.includes(a))) return 'cloves';
    if (['soy sauce', 'hot sauce', 'fish sauce', 'olive oil', 'vinegar', 'honey'].some(s => ingredient.includes(s))) return 'tbsp';
    return '';
  }

  // ── Persistence ────────────────────────
  _addToRecent(recipe) {
    const entry = {
      title: recipe.title,
      tagline: recipe.tagline,
      timestamp: Date.now(),
      ingredients_count: recipe.ingredients.filter(i => i.user_has).length,
    };
    this.recentRecipes.unshift(entry);
    this.recentRecipes = this.recentRecipes.slice(0, 10);
    localStorage.setItem('fridgechef_recent', JSON.stringify(this.recentRecipes));
    this._renderRecent();
  }

  _renderRecent() {
    const container = document.getElementById('recent-list');
    if (!this._emptyStateEl) {
      this._emptyStateEl = document.getElementById('empty-state');
    }
    const emptyState = this._emptyStateEl;

    container.innerHTML = '';

    if (this.recentRecipes.length === 0) {
      container.appendChild(emptyState);
      emptyState.style.display = 'block';
      return;
    }

    this.recentRecipes.slice(0, 5).forEach(recipe => {
      const item = document.createElement('div');
      item.className = 'recent-item';

      const timeAgo = this._timeAgo(recipe.timestamp);
      const emoji = this._getRecipeEmoji(recipe.title);
      item.innerHTML = `
        <span class="recent-item__badge" aria-hidden="true">${emoji}</span>
        <div class="recent-item__info">
          <div class="recent-item__name">${recipe.title}</div>
          <div class="recent-item__meta">${timeAgo} · ${recipe.ingredients_count} ingredient${recipe.ingredients_count === 1 ? '' : 's'}</div>
        </div>
      `;
      container.appendChild(item);
    });
  }

  _getRecipeEmoji(title) {
    const t = (title || '').toLowerCase();
    if (t.includes('chicken')) return '🍗';
    if (t.includes('pasta') || t.includes('spaghetti')) return '🍝';
    if (t.includes('salad')) return '🥗';
    if (t.includes('soup') || t.includes('stew')) return '🍲';
    if (t.includes('fish') || t.includes('salmon')) return '🐟';
    if (t.includes('rice')) return '🍚';
    if (t.includes('steak') || t.includes('beef')) return '🥩';
    if (t.includes('taco')) return '🌮';
    if (t.includes('pizza')) return '🍕';
    return '🍽️';
  }

  _timeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }

  _toggleSave() {
    if (!this.currentRecipe) return;
    const isSaved = this.savedRecipes.some(r => r.title === this.currentRecipe.title);
    if (isSaved) {
      this.savedRecipes = this.savedRecipes.filter(r => r.title !== this.currentRecipe.title);
    } else {
      this.savedRecipes.push(this.currentRecipe);
    }
    localStorage.setItem('fridgechef_saved', JSON.stringify(this.savedRecipes));
    this._updateSaveButton();
  }

  _updateSaveButton() {
    if (!this.currentRecipe) return;
    const isSaved = this.savedRecipes.some(r => r.title === this.currentRecipe.title);
    this.saveBtn.setAttribute('data-saved', isSaved ? 'true' : 'false');
  }

  async _copyRecipe() {
    if (!this.currentRecipe) return;
    const text = this.recipeRenderer.getRecipeAsText(this.currentRecipe);
    const label = this.copyBtn.querySelector('span');
    try {
      await navigator.clipboard.writeText(text);
      if (label) label.textContent = 'copied ✿';
      setTimeout(() => { if (label) label.textContent = 'copy'; }, 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  }

  async _shareRecipe() {
    if (!this.currentRecipe) return;
    const text = this.recipeRenderer.getRecipeAsText(this.currentRecipe);
    if (navigator.share) {
      try {
        await navigator.share({ title: this.currentRecipe.title, text });
      } catch { /* user cancelled */ }
    } else {
      this._copyRecipe();
    }
  }

  _generateShoppingList() {
    if (!this.currentRecipe) return;
    const needed = this.currentRecipe.ingredients
      .filter(i => !i.user_has)
      .map(i => `○ ${i.amount || ''} ${i.unit || ''} ${i.name}`.replace(/\s+/g, ' ').trim())
      .join('\n');

    const text = `tiny shopping list for ${this.currentRecipe.title}\n\n${needed}`;
    navigator.clipboard.writeText(text).then(() => {
      this.shoppingCta.querySelector('#shopping-cta-text').textContent = 'copied to clipboard ✿';
      setTimeout(() => {
        const count = this.currentRecipe.ingredients.filter(i => !i.user_has).length;
        this.shoppingCta.querySelector('#shopping-cta-text').textContent = `tap to copy a tiny shopping list (${count} item${count > 1 ? 's' : ''})`;
      }, 2000);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new FridgeChefApp();
});
