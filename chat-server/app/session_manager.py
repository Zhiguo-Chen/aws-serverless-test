# In-memory session store (for demonstration purposes)
chat_sessions = {}

def get_history(session_id: str):
    """
    Retrieves the chat history for a given session ID.
    """
    if session_id not in chat_sessions:
        chat_sessions[session_id] = []
    return chat_sessions[session_id]

def update_history(session_id: str, user_message, ai_response):
    """
    Updates the chat history with the user message and AI response.
    """
    history = get_history(session_id)
    history.append(user_message)
    history.append(ai_response)
    chat_sessions[session_id] = history
