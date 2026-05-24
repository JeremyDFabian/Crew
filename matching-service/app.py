from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'service': 'crew-matching'
    })  

@app.route('/api/match/<user_id>', methods=['GET'])
def get_matches(user_id):
    # Placeholder - algorithm goes here in Week 4
    return jsonify({
        'user_id': user_id,
        'groups': [],
        'message': 'matching not yet implemented'
    })

if __name__ == '__main__':
    app.run(port=5001, debug=True)