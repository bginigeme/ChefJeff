import React, { useState, useEffect } from 'react';
import './App.css';
import CategoryList from './components/CategoryList';
import RecipeList from './components/RecipeList';
import logo from './assets/ChefJeff.jpg';
import AddRecipeForm from './components/AddRecipeForm';


function App() {
  const [activeTab, setActiveTab] = useState('Home'); // Track which tab is active
  const [selectedCategory, setSelectedCategory] = useState('All'); // Track selected category
  const [likedRecipes, setLikedRecipes] = useState([]); // Track liked recipes
  const [userPreferences, setUserPreferences] = useState({
    feeling: '',
    dietaryRestrictions: '',
    favoriteCuisines: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [customRecipes, setCustomRecipes] = useState([]);

  const handleInputChange = (field, value) => {
    setUserPreferences(prev => ({
      ...prev,
      [field]: value,
    }));
  };
  
  
  const categories = [
    'Breakfast',
    'Lunch',
    'Southern',
    'Nigerian',
    'Asian',
    'Tex-Mex',
    'Vegan',
    'Desserts',
    'Snacks',
    'Dinner',
  ];

  // Update the filteredRecipes logic
  const filteredRecipes = selectedCategory === 'All'
    ? [...recipes, ...customRecipes]
    : [...recipes, ...customRecipes].filter(
        recipe => recipe.category.toLowerCase() === selectedCategory.toLowerCase()
      );

  // Function to handle liking a recipe
  const handleLike = recipe => {
    if (!likedRecipes.some(r => r.id === recipe.id)) {
      setLikedRecipes([...likedRecipes, recipe]);
    }
  };

  // Function to handle unliking a recipe
  const handleUnlike = recipe => {
    setLikedRecipes(likedRecipes.filter(r => r.id !== recipe.id));
  };

  // GET request
  const getPreferences = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/preferences');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch preferences');
      }
      return data;
    } catch (error) {
      console.error('Error fetching preferences:', error);
      return null;
    }
  };

  // POST request
  const savePreferences = async (preferences) => {
    try {
      const response = await fetch('http://localhost:5000/api/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });
      const data = await response.json();
      // Handle the response
      return data;
    } catch (error) {
      console.error('Error saving preferences:', error);
      return null;
    }
  };

  useEffect(() => {
    if (activeTab === 'Jeff') {
      setIsLoading(true);
      getPreferences()
        .then(data => {
          if (data && !data.error) {
            setUserPreferences({
              feeling: '',
              dietaryRestrictions: data.dietaryRestrictions || '',
              favoriteCuisines: data.favoriteCuisines || '',
            });
          }
        })
        .catch(error => console.error('Error loading preferences:', error))
        .finally(() => setIsLoading(false));
    }
  }, [activeTab]);

  // Update the useEffect to fetch recipes when category changes
  useEffect(() => {
    const tags = selectedCategory === 'All' ? '' : selectedCategory;
    fetchRecipes(tags);
  }, [selectedCategory]);

  const fetchRecipes = async (tags = '', page = 1) => {
    setLoading(true);
    setError(null);
    try {
      // Map our categories to Spoonacular's supported types
      const categoryMapping = {
        'Breakfast': 'breakfast',
        'Lunch': 'lunch',
        'Dinner': 'dinner',
        'Southern': 'southern',
        'Asian': 'asian',
        'Tex-Mex': 'mexican',
        'Vegan': 'vegan',
        'Desserts': 'dessert',
        'Snacks': 'snack',
        'Nigerian': 'african'
      };

      const mappedTag = categoryMapping[tags] || tags;
      console.log('Fetching recipes for tag:', mappedTag);
      
      const response = await fetch(`http://localhost:5000/api/recipes?tags=${mappedTag}&page=${page}`);
      if (!response.ok) throw new Error('Failed to fetch recipes');
      const data = await response.json();
      console.log('Received recipes:', data);
      
      if (page === 1) {
        setRecipes(data.recipes);
      } else {
        setRecipes(prev => [...prev, ...data.recipes]);
      }
      
      setCurrentPage(data.currentPage);
      setHasMore(data.hasMore);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5000/api/recipes/search?query=${query}`);
      if (!response.ok) throw new Error('Failed to search recipes');
      const data = await response.json();
      setRecipes(data);
    } catch (err) {
      setError(err.message);
      console.error('Error searching recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    fetchRecipes(selectedCategory, currentPage + 1);
  };

  const handleAddRecipe = (newRecipe) => {
    setCustomRecipes(prev => [...prev, newRecipe]);
  };

  return (
    <div>
      <header className="app-header">
  <img src={logo} alt="ChefJeff Logo" className="logo" />
</header>


      {/* Navigation Bar */}
      <nav className="navbar">
        <button
          className={activeTab === 'Home' ? 'active' : ''}
          onClick={() => setActiveTab('Home')}
        >
          Home
        </button>
        <button
          className={activeTab === 'Jeff' ? 'active' : ''}
          onClick={() => setActiveTab('Jeff')}
        >
          Jeff
        </button>
        <button
          className={activeTab === 'My Recipes' ? 'active' : ''}
          onClick={() => setActiveTab('My Recipes')}
        >
          My Recipes
        </button>
        <button
          className={activeTab === 'Add Recipe' ? 'active' : ''}
          onClick={() => setActiveTab('Add Recipe')}
        >
          Add Recipe
        </button>
      </nav>

      {/* Conditional Rendering Based on Active Tab */}
      {activeTab === 'Home' && (
        <>
          <h1>Explore Recipes</h1>
          <div style={{ margin: '20px 0' }}>
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '8px',
                width: '200px',
                marginRight: '10px',
                borderRadius: '5px',
                border: '1px solid #d9a760'
              }}
            />
            <button
              onClick={() => handleSearch(searchQuery)}
              style={{
                padding: '8px 15px',
                backgroundColor: '#d74e09',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Search
            </button>
          </div>
          <CategoryList
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
          {loading ? (
            <div>Loading recipes...</div>
          ) : error ? (
            <div>Error: {error}</div>
          ) : (
            <RecipeList
              recipes={filteredRecipes}
              likedRecipes={likedRecipes}
              onLike={handleLike}
              onUnlike={handleUnlike}
              onLoadMore={loadMore}
              hasMore={hasMore}
              loading={loading}
            />
          )}
        </>
      )}
{activeTab === 'Jeff' && (
  <>
    <h1>Welcome to Jeff's Tab</h1>
    <p>Let's create a recipe based on your preferences!</p>
    {isLoading ? (
      <p>Loading your preferences...</p>
    ) : (
      <form style={{ margin: '20px 0' }}>
        {/* Feeling Input */}
        <label>
          <strong>How are you feeling today?</strong>
          <br />
          <input
            type="text"
            placeholder="e.g., Energized, Tired"
            value={userPreferences.feeling}
            onChange={e => handleInputChange('feeling', e.target.value)}
            style={{ margin: '10px 0', padding: '5px' }}
          />
        </label>
        <br />

        {/* Dietary Restrictions Input */}
        <label>
          <strong>Any dietary restrictions or allergies?</strong>
          <br />
          <input
            type="text"
            placeholder="e.g., Gluten-free, Nut allergy"
            value={userPreferences.dietaryRestrictions}
            onChange={e => handleInputChange('dietaryRestrictions', e.target.value)}
            style={{ margin: '10px 0', padding: '5px' }}
          />
        </label>
        <br />

        {/* Favorite Cuisines Input */}
        <label>
          <strong>What type of cuisine do you enjoy?</strong>
          <br />
          <input
            type="text"
            placeholder="e.g., Italian, Asian"
            value={userPreferences.favoriteCuisines}
            onChange={e => handleInputChange('favoriteCuisines', e.target.value)}
            style={{ margin: '10px 0', padding: '5px' }}
          />
        </label>
        <br />

        {/* Generate Recipe Button */}
        <button
          type="button"
          onClick={async () => {
            try {
              const response = await savePreferences(userPreferences);
              console.log('Preferences saved:', response);
            } catch (error) {
              console.error('Error saving preferences:', error);
            }
          }}
          style={{
            padding: '10px 15px',
            backgroundColor: '#d74e09',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
          }}
        >
          Generate Recipe
        </button>
      </form>
    )}

    {/* Display Placeholder for AI-Generated Recipe */}
    <div
      style={{
        marginTop: '20px',
        padding: '10px',
        border: '1px solid #d9a760',
        borderRadius: '10px',
      }}
    >
      <h3>Your Recipe Will Appear Here</h3>
      <p>(This will display an AI-generated recipe based on your inputs.)</p>
    </div>
  </>
)}


      {activeTab === 'My Recipes' && (
        <>
          <h1>My Recipes</h1>
          <RecipeList
            recipes={likedRecipes}
            likedRecipes={likedRecipes}
            onLike={handleLike}
            onUnlike={handleUnlike}
          />
        </>
      )}

      {activeTab === 'Add Recipe' && (
        <AddRecipeForm onSubmit={handleAddRecipe} />
      )}
    </div>
  );
}

export default App;
