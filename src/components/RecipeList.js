import React, { useState } from 'react';

function RecipeList({ recipes, likedRecipes, onLike, onUnlike }) {
  const [expandedRecipeId, setExpandedRecipeId] = useState(null); // Track which recipe's steps are visible

  const toggleSteps = recipeId => {
    setExpandedRecipeId(expandedRecipeId === recipeId ? null : recipeId);
  };

  const getDefaultImage = (title) => {
    return `https://placehold.co/400x300/f4c27a/4b2e2e?text=${encodeURIComponent(title)}`;
  };

  return (
    <div className="recipes">
      <h2>Recipes</h2>
      {recipes.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {recipes.map(recipe => (
            <li key={recipe.id} style={{ margin: '20px 0', display: 'flex', gap: '20px' }}>
              {/* Recipe Image */}
              <img
                src={recipe.image || getDefaultImage(recipe.title)}
                alt={recipe.title}
                style={{
                  width: '150px',
                  height: '150px',
                  borderRadius: '10px',
                  objectFit: 'cover',
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = getDefaultImage(recipe.title);
                }}
              />
              {/* Recipe Details */}
              <div>
                <h3>{recipe.title}</h3>
                <p>{recipe.description}</p>
                <small>Category: {recipe.category}</small>
                <br />
                {/* Like/Unlike Button */}
                <button
                  onClick={() =>
                    likedRecipes.some(r => r.id === recipe.id)
                      ? onUnlike(recipe)
                      : onLike(recipe)
                  }
                  style={{
                    marginTop: '10px',
                    padding: '5px 10px',
                    backgroundColor: likedRecipes.some(r => r.id === recipe.id) ? '#d74e09' : '#ffe8c9',
                    color: likedRecipes.some(r => r.id === recipe.id) ? '#fff' : '#4b2e2e',
                    border: '1px solid #d9a760',
                    borderRadius: '5px',
                  }}
                >
                  {likedRecipes.some(r => r.id === recipe.id) ? 'Unlike' : 'Like'}
                </button>
                {/* View Steps Button */}
                <button
                  onClick={() => toggleSteps(recipe.id)}
                  style={{
                    marginTop: '10px',
                    padding: '5px 10px',
                    backgroundColor: '#f4c27a',
                    color: '#4b2e2e',
                    border: '1px solid #d9a760',
                    borderRadius: '5px',
                  }}
                >
                  {expandedRecipeId === recipe.id ? 'Hide Steps' : 'View Steps'}
                </button>
                {/* Steps Display */}
                {expandedRecipeId === recipe.id && (
                  <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                    {Array.isArray(recipe.steps) 
                        ? recipe.steps.map((step, index) => (
                            <li key={index} style={{ marginBottom: '5px' }}>
                                {index + 1}. {step}
                            </li>
                        ))
                        : <li>{recipe.steps}</li>
                    }
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No recipes found for this category.</p>
      )}
    </div>
  );
}

export default RecipeList;
