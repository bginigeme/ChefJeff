import React, { useState } from 'react';

function RecipeList({ recipes, likedRecipes, onLike, onUnlike, onLoadMore, hasMore, loading }) {
  const [expandedRecipeId, setExpandedRecipeId] = useState(null);

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
        <>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {recipes.map(recipe => (
              <li key={recipe.id} style={{ margin: '20px 0', display: 'flex', gap: '20px' }}>
                <div style={{ flex: '0 0 150px' }}>
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
                </div>
                <div style={{ flex: 1 }}>
                  <h3>{recipe.title}</h3>
                  <p>{recipe.description}</p>
                  <small>Category: {recipe.category}</small>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button onClick={() => toggleSteps(recipe.id)}>
                      {expandedRecipeId === recipe.id ? 'Hide Steps' : 'View Steps'}
                    </button>
                    <button
                      onClick={() =>
                        likedRecipes.some(r => r.id === recipe.id)
                          ? onUnlike(recipe)
                          : onLike(recipe)
                      }
                      style={{
                        backgroundColor: likedRecipes.some(r => r.id === recipe.id) ? '#d74e09' : '#ffe8c9',
                        color: likedRecipes.some(r => r.id === recipe.id) ? '#fff' : '#4b2e2e',
                      }}
                    >
                      {likedRecipes.some(r => r.id === recipe.id) ? 'Unlike' : 'Like'}
                    </button>
                  </div>
                  {expandedRecipeId === recipe.id && (
                    <ol style={{ marginTop: '10px', paddingLeft: '20px' }}>
                      {recipe.steps.map((step, index) => (
                        <li key={index} style={{ marginBottom: '5px' }}>
                          {step}
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </li>
            ))}
          </ul>
          {hasMore && (
            <button
              onClick={onLoadMore}
              disabled={loading}
              style={{
                margin: '20px auto',
                display: 'block',
                padding: '10px 20px',
                backgroundColor: '#d74e09',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Loading...' : 'Load More Recipes'}
            </button>
          )}
        </>
      ) : (
        <p>No recipes available.</p>
      )}
    </div>
  );
}

export default RecipeList;
