/* ============================================
   fridge chef ✿ recipe renderer
   ============================================ */

const SVG_CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="5 12 10 17 19 7"/></svg>';
const SVG_PLUS  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';

class RecipeRenderer {
  constructor() {
    this.recipeCard = document.getElementById('recipe-card');
    this.imageContainer = document.getElementById('recipe-image-container');
    this.imagePlaceholder = document.getElementById('recipe-image-placeholder');
    this.imageEl = document.getElementById('recipe-image');
    this.titleEl = document.getElementById('recipe-title');
    this.taglineEl = document.getElementById('recipe-tagline');
    this.timeEl = document.getElementById('recipe-time');
    this.servingsEl = document.getElementById('recipe-servings');
    this.difficultyEl = document.getElementById('recipe-difficulty');
    this.grandmaStoryEl = document.getElementById('grandma-story');
    this.ingredientListEl = document.getElementById('ingredient-list');
    this.stepsListEl = document.getElementById('steps-list');
    this.shoppingCta = document.getElementById('shopping-cta');
    this.shoppingCtaText = document.getElementById('shopping-cta-text');
  }

  render(recipe) {
    this.titleEl.textContent = recipe.title || 'untitled little recipe';
    this.taglineEl.textContent = recipe.tagline || '';

    const totalTime = (recipe.prep_time_min || 0) + (recipe.cook_time_min || 0);
    this.timeEl.textContent = `${totalTime} min`;
    this.servingsEl.textContent = `${recipe.servings || 2} servings`;
    this.difficultyEl.textContent = (recipe.difficulty || 'easy').toLowerCase();

    if (recipe.image_base64) {
      this.imageEl.src = `data:image/png;base64,${recipe.image_base64}`;
      this.imageEl.alt = recipe.title;
      this.imageEl.style.display = 'block';
      this.imagePlaceholder.style.display = 'none';
    } else {
      this.imageEl.style.display = 'none';
      this.imagePlaceholder.style.display = 'flex';
    }

    if (recipe.grandma_story) {
      this.grandmaStoryEl.textContent = recipe.grandma_story;
      this.grandmaStoryEl.classList.add('grandma-note--visible');
    } else {
      this.grandmaStoryEl.classList.remove('grandma-note--visible');
    }

    this.ingredientListEl.innerHTML = '';
    let needCount = 0;
    recipe.ingredients.forEach((ing, i) => {
      const li = document.createElement('li');
      const hasIt = ing.user_has;
      li.className = `ingredient-item ingredient-item--${hasIt ? 'have' : 'need'}`;
      li.style.animationDelay = `${0.4 + i * 0.05}s`;

      if (!hasIt) needCount++;

      const amountText = [ing.amount, ing.unit].filter(Boolean).join(' ').trim();
      const fullText = amountText ? `${amountText} ${ing.name}` : ing.name;

      li.innerHTML = `
        <span class="ingredient-item__check" aria-hidden="true">${hasIt ? SVG_CHECK : SVG_PLUS}</span>
        <span class="ingredient-item__text">${fullText}</span>
        <span class="ingredient-item__badge">${hasIt ? 'have' : 'need'}</span>
      `;
      this.ingredientListEl.appendChild(li);
    });

    if (needCount > 0) {
      this.shoppingCtaText.textContent = `tap to copy a tiny shopping list (${needCount} item${needCount > 1 ? 's' : ''})`;
      this.shoppingCta.classList.add('shopping-cta--visible');
    } else {
      this.shoppingCta.classList.remove('shopping-cta--visible');
    }

    this.stepsListEl.innerHTML = '';
    recipe.steps.forEach((step, i) => {
      const li = document.createElement('li');
      li.className = 'step-item';
      li.style.animationDelay = `${0.5 + i * 0.07}s`;
      li.innerHTML = `
        <span class="step-item__number">${i + 1}</span>
        <span class="step-item__text">${step}</span>
      `;
      this.stepsListEl.appendChild(li);
    });
  }

  swapImage(imageBase64, title) {
    if (!imageBase64) return;
    this.imageEl.src = `data:image/png;base64,${imageBase64}`;
    this.imageEl.alt = title || '';
    this.imageEl.style.display = 'block';
    this.imagePlaceholder.style.display = 'none';
  }

  getRecipeAsText(recipe) {
    let text = `${recipe.title}\n`;
    text += `${recipe.tagline}\n\n`;
    text += `${(recipe.prep_time_min || 0) + (recipe.cook_time_min || 0)} min · ${recipe.servings} servings · ${recipe.difficulty}\n\n`;
    text += `ingredients:\n`;
    recipe.ingredients.forEach(ing => {
      const prefix = ing.user_has ? '✓' : '○';
      text += `${prefix} ${ing.amount || ''} ${ing.unit || ''} ${ing.name}\n`;
    });
    text += `\nsteps:\n`;
    recipe.steps.forEach((step, i) => {
      text += `${i + 1}. ${step}\n`;
    });
    text += `\n— made with fridge chef ✿`;
    return text;
  }
}
