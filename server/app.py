from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from marshmallow import Schema, fields, validate
import os
import requests
from dotenv import load_dotenv
from bs4 import BeautifulSoup

load_dotenv()  # Load environment variables

app = Flask(__name__)
SPOONACULAR_API_KEY = os.getenv('SPOONACULAR_API_KEY')

# Update CORS configuration to specify your React frontend URL
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000"],  # Add your React app URL
        "methods": ["GET", "POST"],
        "allow_headers": ["Content-Type"]
    }
})

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///preferences.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Database model
class UserPreference(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    favorite_cuisines = db.Column(db.String(255))
    dietary_restrictions = db.Column(db.String(255))
    health_goals = db.Column(db.String(255))

# Create database
with app.app_context():
    db.create_all()

# Endpoint to save preferences
@app.route('/api/preferences', methods=['POST'])
def save_preferences():
    try:
        data = request.json
        new_preference = UserPreference(
            favorite_cuisines=data.get('favoriteCuisines'),
            dietary_restrictions=data.get('dietaryRestrictions'),
            health_goals=data.get('healthGoals')
        )
        db.session.add(new_preference)
        db.session.commit()
        return jsonify({'message': 'Preferences saved successfully!'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Endpoint to fetch preferences
@app.route('/api/preferences', methods=['GET'])
def get_preferences():
    try:
        preferences = UserPreference.query.first()
        if preferences:
            return jsonify({
                'favoriteCuisines': preferences.favorite_cuisines,
                'dietaryRestrictions': preferences.dietary_restrictions,
                'healthGoals': preferences.health_goals
            }), 200
        return jsonify({'message': 'No preferences found!'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/recipes', methods=['GET'])
def get_recipes():
    try:
        tags = request.args.get('tags', '')
        
        # Add cuisine type for certain categories
        if tags.lower() in ['asian', 'nigerian', 'southern']:
            params = {
                'apiKey': SPOONACULAR_API_KEY,
                'number': 6,
                'cuisine': tags,
                'addRecipeInformation': True  # Add this to get full recipe info
            }
            url = "https://api.spoonacular.com/recipes/complexSearch"
        else:
            params = {
                'apiKey': SPOONACULAR_API_KEY,
                'number': 6,
                'tags': tags,
                'type': tags if tags else None
            }
            url = "https://api.spoonacular.com/recipes/random"
        
        response = requests.get(url, params=params)
        response.raise_for_status()
        
        def clean_html(html_text):
            if not html_text:
                return ''
            soup = BeautifulSoup(html_text, 'html.parser')
            return soup.get_text()

        # Handle different response structures
        if 'recipes' in response.json():
            recipes = response.json()['recipes']
        else:
            recipes = response.json()['results']
            
        formatted_recipes = []
        for recipe in recipes:
            # Extract steps from analyzedInstructions
            steps = []
            if recipe.get('analyzedInstructions'):
                for instruction in recipe['analyzedInstructions']:
                    for step in instruction.get('steps', []):
                        steps.append(clean_html(step.get('step', '')))
            
            formatted_recipe = {
                'id': recipe.get('id'),
                'title': recipe.get('title'),
                'description': clean_html(recipe.get('summary', '')).split('.')[0] if recipe.get('summary') else '',
                'category': tags.capitalize() if tags else 'Main',
                'image': recipe.get('image'),
                'steps': steps if steps else ['No detailed steps available.']
            }
            formatted_recipes.append(formatted_recipe)
            
        return jsonify(formatted_recipes)
        
    except Exception as e:
        print('Error:', str(e))  # Add server-side logging
        return jsonify({'error': str(e)}), 500

@app.route('/api/recipes/search', methods=['GET'])
def search_recipes():
    try:
        query = request.args.get('query', '')
        
        params = {
            'apiKey': SPOONACULAR_API_KEY,
            'query': query,
            'number': 6,
            'addRecipeInformation': True
        }
        
        url = "https://api.spoonacular.com/recipes/complexSearch"
        
        response = requests.get(url, params=params)
        response.raise_for_status()
        
        recipes = response.json()['results']
        
        def clean_html(html_text):
            if not html_text:
                return ''
            soup = BeautifulSoup(html_text, 'html.parser')
            return soup.get_text()
            
        formatted_recipes = []
        for recipe in recipes:
            steps = []
            if recipe.get('analyzedInstructions'):
                for instruction in recipe['analyzedInstructions']:
                    for step in instruction.get('steps', []):
                        steps.append(clean_html(step.get('step', '')))
            
            formatted_recipe = {
                'id': recipe.get('id'),
                'title': recipe.get('title'),
                'description': clean_html(recipe.get('summary', '')).split('.')[0] if recipe.get('summary') else '',
                'category': 'Search Result',
                'image': recipe.get('image'),
                'steps': steps if steps else ['No detailed steps available.']
            }
            formatted_recipes.append(formatted_recipe)
            
        return jsonify(formatted_recipes)
        
    except Exception as e:
        print('Error:', str(e))
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)  # Explicitly set port to 5000
