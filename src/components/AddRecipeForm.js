import React, { useState } from 'react';

function AddRecipeForm({ onSubmit }) {
  const [recipe, setRecipe] = useState({
    title: '',
    description: '',
    category: 'Custom',
    image: null,
    steps: [''],
    ingredients: ['']
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRecipe(prev => ({
          ...prev,
          image: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addStep = () => {
    setRecipe(prev => ({
      ...prev,
      steps: [...prev.steps, '']
    }));
  };

  const addIngredient = () => {
    setRecipe(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, '']
    }));
  };

  const updateStep = (index, value) => {
    setRecipe(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => i === index ? value : step)
    }));
  };

  const updateIngredient = (index, value) => {
    setRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => i === index ? value : ing)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...recipe,
      id: Date.now(), // temporary ID for custom recipes
      steps: recipe.steps.filter(step => step.trim() !== ''),
      ingredients: recipe.ingredients.filter(ing => ing.trim() !== '')
    });
    // Reset form
    setRecipe({
      title: '',
      description: '',
      category: 'Custom',
      image: null,
      steps: [''],
      ingredients: ['']
    });
  };

  return (
    <form onSubmit={handleSubmit} className="add-recipe-form">
      <h2>Add Your Recipe</h2>
      
      <div className="form-group">
        <label>Title</label>
        <input
          type="text"
          value={recipe.title}
          onChange={(e) => setRecipe(prev => ({ ...prev, title: e.target.value }))}
          required
        />
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          value={recipe.description}
          onChange={(e) => setRecipe(prev => ({ ...prev, description: e.target.value }))}
          required
        />
      </div>

      <div className="form-group">
        <label>Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
        {recipe.image && (
          <img 
            src={recipe.image} 
            alt="Recipe preview" 
            style={{ width: '200px', marginTop: '10px' }}
          />
        )}
      </div>

      <div className="form-group">
        <label>Ingredients</label>
        {recipe.ingredients.map((ingredient, index) => (
          <div key={index} className="list-item">
            <input
              type="text"
              value={ingredient}
              onChange={(e) => updateIngredient(index, e.target.value)}
              placeholder={`Ingredient ${index + 1}`}
            />
          </div>
        ))}
        <button type="button" onClick={addIngredient} className="add-button">
          Add Ingredient
        </button>
      </div>

      <div className="form-group">
        <label>Steps</label>
        {recipe.steps.map((step, index) => (
          <div key={index} className="list-item">
            <textarea
              value={step}
              onChange={(e) => updateStep(index, e.target.value)}
              placeholder={`Step ${index + 1}`}
            />
          </div>
        ))}
        <button type="button" onClick={addStep} className="add-button">
          Add Step
        </button>
      </div>

      <button type="submit" className="submit-button">
        Add Recipe
      </button>
    </form>
  );
}

export default AddRecipeForm; 