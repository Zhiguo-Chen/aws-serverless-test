import base64
from flask import request, jsonify
from . import app
from .services import invoke_gemini_model
from .session_manager import get_history, update_history

@app.route("/chat", methods=["POST"])
def chat():
    """
    Handles chat requests, supporting both JSON and multipart/form-data.
    """
    image_base64 = None
    
    # Handle multipart/form-data (for file uploads)
    if 'multipart/form-data' in request.content_type:
        message = request.form.get("message")
        session_id = request.form.get("sessionId")
        
        # Check for an image file in the request, mirroring original JS controller
        if 'image' in request.files:
            image_file = request.files['image']
            if image_file and image_file.filename:
                image_bytes = image_file.read()
                image_base64 = base64.b64encode(image_bytes).decode('utf-8')

    # Handle application/json
    elif request.is_json:
        data = request.get_json()
        message = data.get("message")
        session_id = data.get("sessionId")
        image_base64 = data.get("imageBase64")
        
    else:
        return jsonify({"error": "Unsupported Media Type. Please use application/json or multipart/form-data."}), 415

    if not message or not session_id:
        return jsonify({"error": "Missing message or sessionId"}), 400

    try:
        history = get_history(session_id)
        user_message, ai_response = invoke_gemini_model(message, image_base64, history)
        update_history(session_id, user_message, ai_response)

        final_response = {
            "response": ai_response.content,
            "products": [],  # Placeholder for product logic
            "sessionId": session_id,
        }

        return jsonify(final_response), 200

    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/")
def hello_world():
    return "Hi, how can I assist you today!"