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
