from flask import Flask
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Import routes after app initialization to avoid circular imports
from . import routes
