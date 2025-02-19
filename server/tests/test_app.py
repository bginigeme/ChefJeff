import json

def test_get_preferences(client):
    response = client.get('/api/preferences')
    assert response.status_code == 404  # Assuming no preferences initially

def test_save_preferences(client):
    data = {
        'favoriteCuisines': 'Italian',
        'dietaryRestrictions': 'Gluten-free',
        'healthGoals': 'Weight loss'
    }
    response = client.post('/api/preferences', data=json.dumps(data), content_type='application/json')
    assert response.status_code == 200
    assert response.json['message'] == 'Preferences saved successfully!'

def test_get_recipes(client):
    response = client.get('/api/recipes?tags=african&page=1')
    assert response.status_code == 200
    assert 'recipes' in response.json 