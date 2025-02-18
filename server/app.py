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
        page = int(request.args.get('page', 1))
        per_page = 6
        
        if tags.lower() in ['asian', 'nigerian', 'southern']:
            params = {
                'apiKey': SPOONACULAR_API_KEY,
                'number': per_page * 2,  # Fetch more to allow pagination
                'offset': (page - 1) * per_page,
                'cuisine': tags,
                'addRecipeInformation': True
            }
            url = "https://api.spoonacular.com/recipes/complexSearch"
        else:
            params = {
                'apiKey': SPOONACULAR_API_KEY,
                'number': per_page * 2,
                'offset': (page - 1) * per_page,
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
            
            # Check if video is available
            video_available = False
            if recipe.get('videoUrl') or recipe.get('video'):
                video_available = True
            
            formatted_recipe = {
                'id': recipe.get('id'),
                'title': recipe.get('title'),
                'description': clean_html(recipe.get('summary', '')).split('.')[0] if recipe.get('summary') else '',
                'category': tags.capitalize() if tags else 'Main',
                'image': recipe.get('image'),
                'steps': steps if steps else ['No detailed steps available.'],
                'hasVideo': video_available
            }
            formatted_recipes.append(formatted_recipe)
            
        return jsonify({
            'recipes': formatted_recipes,
            'currentPage': page,
            'hasMore': len(formatted_recipes) >= per_page
        })
        
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

@app.route('/api/recipes/videos', methods=['GET'])
def get_recipe_videos():
    try:
        recipe_id = request.args.get('recipeId')
        
        # First get recipe information including videos
        params = {
            'apiKey': SPOONACULAR_API_KEY,
            'id': recipe_id,
        }
        
        url = f"https://api.spoonacular.com/recipes/{recipe_id}/information"
        
        response = requests.get(url, params=params)
        response.raise_for_status()
        recipe_data = response.json()
        
        # Check if there's a video URL in the recipe data
        video_url = recipe_data.get('videoUrl')
        
        if not video_url:
            # If no direct video, search for related videos
            search_params = {
                'apiKey': SPOONACULAR_API_KEY,
                'query': recipe_data['title'],
                'number': 1
            }
            
            video_search_url = "https://api.spoonacular.com/food/videos/search"
            video_response = requests.get(video_search_url, params=search_params)
            video_response.raise_for_status()
            videos = video_response.json().get('videos', [])
            
            if videos:
                video_url = f"https://www.youtube.com/watch?v={videos[0]['youTubeId']}"
            
        return jsonify({
            'videoUrl': video_url,
            'title': recipe_data['title']
        })
        
    except Exception as e:
        print('Error:', str(e))
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)  # Explicitly set port to 5000
