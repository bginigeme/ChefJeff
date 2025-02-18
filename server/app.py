from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from marshmallow import Schema, fields, validate

app = Flask(__name__)
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

if __name__ == '__main__':
    app.run(debug=True, port=5000)  # Explicitly set port to 5000
