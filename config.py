import os
from dotenv import load_dotenv

load_dotenv()

FUSEKI_URL = os.getenv('FUSEKI_URL', 'http://localhost:3030/ecotourism')
FUSEKI_QUERY_ENDPOINT = f"{FUSEKI_URL}/query"
FUSEKI_UPDATE_ENDPOINT = f"{FUSEKI_URL}/update"
FUSEKI_DATA_ENDPOINT = f"{FUSEKI_URL}/data"
FUSEKI_USER = os.getenv('FUSEKI_USER', 'admin')
FUSEKI_PASSWORD = os.getenv('FUSEKI_PASSWORD', 'admin')

NAMESPACE = "http://example.org/eco-tourism#"

# AI Configuration
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
ELEVENLABS_API_KEY = os.getenv('ELEVENLABS_API_KEY', 'sk_1ae6238c7dd8c2846f3b6ae5fd66cb829690350a51403857')
