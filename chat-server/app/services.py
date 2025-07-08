import os
import base64
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage

def invoke_gemini_model(message: str, image_base64: str = None, history: list = []):
    """
    Invokes the Gemini model with the given message, image, and history.
    """
    # Explicitly get the API key from environment variables
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found. Make sure it's set in your .env file.")

    # Initialize the Gemini model with the API key
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.0-flash",
        google_api_key=api_key
    )

    # Build the user message content
    user_message_content = [{"type": "text", "text": message}]
    if image_base64:
        user_message_content.append({
            "type": "image_url",
            "image_url": {
                "url": f"data:image/jpeg;base64,{image_base64}"
            }
        })

    user_message = HumanMessage(content=user_message_content)

    # Invoke the model with history
    response = llm.invoke(history + [user_message])
    
    return user_message, response