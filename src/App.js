import React, { useState, useEffect } from 'react';
import './App.css';
import CategoryList from './components/CategoryList';
import RecipeList from './components/RecipeList';
import logo from './assets/ChefJeff.jpg';


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

  const recipes = [
    {
      id: 1,
      title: 'Pancakes',
      description: 'Fluffy homemade pancakes.',
      category: 'Breakfast',
      image: 'https://via.placeholder.com/150?text=Pancakes',
      steps: [
        'Mix flour, eggs, milk, and sugar in a bowl.',
        'Heat a skillet over medium heat and grease it lightly.',
        'Pour batter and cook until bubbles appear, then flip.',
      ],
    },
    {
      id: 2,
      title: 'Omelette',
      description: 'Quick and easy breakfast omelette.',
      category: 'Breakfast',
      image: 'https://via.placeholder.com/150?text=Omelette',
      steps: [
        'Beat eggs with salt and pepper.',
        'Pour eggs into a hot skillet with butter.',
        'Cook until set, then fold and serve.',
      ],
    },
    {
      id: 3,
      title: 'Vegan Salad',
      description: 'Healthy and delicious.',
      category: 'Vegan',
      image: 'https://via.placeholder.com/150?text=Salad',
      steps: [
        'Chop lettuce, tomatoes, and cucumbers.',
        'Mix olive oil, lemon juice, and seasoning.',
        'Toss vegetables with dressing.',
      ],
    },
    {
      id: 4,
      title: 'Vegan Buddha Bowl',
      description: 'A colorful and nutrient-packed bowl.',
      category: 'Vegan',
      image: 'https://via.placeholder.com/150?text=Buddha+Bowl',
      steps: [
        'Cook quinoa and let cool.',
        'Prepare roasted vegetables and fresh greens.',
        'Assemble the bowl with toppings and dressing.',
      ],
    },
    {
      id: 5,
      title: 'Chocolate Cake',
      description: 'Rich and moist dessert.',
      category: 'Desserts',
      image: 'https://via.placeholder.com/150?text=Cake',
      steps: [
        'Preheat oven to 350°F (175°C).',
        'Mix flour, cocoa, sugar, and baking powder in a bowl.',
        'Add eggs, milk, and butter. Mix until smooth.',
        'Pour batter into a greased pan and bake for 30 minutes.',
      ],
    },
    {
      id: 6,
      title: 'Brownies',
      description: 'Chewy and chocolatey brownies.',
      category: 'Desserts',
      image: 'https://via.placeholder.com/150?text=Brownies',
      steps: [
        'Melt chocolate and butter together.',
        'Mix in sugar, eggs, and flour.',
        'Pour into a pan and bake at 350°F for 25 minutes.',
      ],
    },
  ];
  
  

  const filteredRecipes =
    selectedCategory === 'All'
      ? recipes
      : recipes.filter(recipe => recipe.category === selectedCategory);

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
      </nav>

      {/* Conditional Rendering Based on Active Tab */}
      {activeTab === 'Home' && (
        <>
          <h1>Explore Recipes</h1>
          <CategoryList
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
          <RecipeList
            recipes={filteredRecipes}
            likedRecipes={likedRecipes}
            onLike={handleLike}
            onUnlike={handleUnlike}
          />
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
    </div>
  );
}

export default App;
