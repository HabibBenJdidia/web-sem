"""
Standalone Test for AI BSila - No Docker Required
Tests the AI agent without Fuseki (using mock SPARQL manager)
"""

import sys
import os

# Mock SPARQL Manager for testing without Fuseki
class MockSPARQLManager:
    """Mock SPARQL Manager that returns sample data"""
    
    def execute_query(self, query):
        """Return mock data based on query content"""
        if "Restaurant" in query and "RestaurantEco" not in query:
            return [
                {
                    'restaurant': {'value': 'http://example.org/eco-tourism#Restaurant_1'},
                    'nom': {'value': 'Le Jardin Bio'},
                    'destination': {'value': 'http://example.org/eco-tourism#Ville_1'}
                },
                {
                    'restaurant': {'value': 'http://example.org/eco-tourism#Restaurant_2'},
                    'nom': {'value': 'La Table Verte'},
                    'destination': {'value': 'http://example.org/eco-tourism#Ville_2'}
                }
            ]
        elif "RestaurantEco" in query:
            return [
                {
                    'restaurant': {'value': 'http://example.org/eco-tourism#RestaurantEco_1'},
                    'nom': {'value': 'Éco-Restaurant Bio'}
                },
                {
                    'restaurant': {'value': 'http://example.org/eco-tourism#RestaurantEco_2'},
                    'nom': {'value': 'Le Vert'}
                }
            ]
        elif "ProduitLocal" in query and "Bio" not in query:
            return [
                {
                    'produit': {'value': 'http://example.org/eco-tourism#ProduitLocal_1'},
                    'nom': {'value': 'Tomates locales'},
                    'saison': {'value': 'Été'},
                    'bio': {'value': 'true'}
                },
                {
                    'produit': {'value': 'http://example.org/eco-tourism#ProduitLocal_2'},
                    'nom': {'value': 'Fraises'},
                    'saison': {'value': 'Printemps'},
                    'bio': {'value': 'false'}
                }
            ]
        elif "ProduitLocalBio" in query or "bio true" in query.lower():
            return [
                {
                    'produit': {'value': 'http://example.org/eco-tourism#ProduitLocalBio_1'},
                    'nom': {'value': 'Tomates Bio'},
                    'saison': {'value': 'Été'}
                },
                {
                    'produit': {'value': 'http://example.org/eco-tourism#ProduitLocalBio_2'},
                    'nom': {'value': 'Carottes Bio'},
                    'saison': {'value': 'Toute l\'année'}
                }
            ]
        else:
            return []

# Test AI BSila Agent
def test_ai_bsila():
    """Test AI BSila functionality"""
    print("=" * 60)
    print("🎤 Testing AI BSila Voice Assistant")
    print("=" * 60)
    print()
    
    # Import AI BSila
    try:
        from ai.aiBSila import AIBSilaAgent
    except ImportError as e:
        print(f"❌ Error importing AIBSilaAgent: {e}")
        print("Make sure you're running from web-sem directory")
        return
    
    # Create mock manager
    mock_manager = MockSPARQLManager()
    
    # Initialize AI BSila
    print("🔧 Initializing AI BSila Agent...")
    try:
        agent = AIBSilaAgent(mock_manager)
        print("✅ Agent initialized successfully!")
    except Exception as e:
        print(f"❌ Error initializing agent: {e}")
        return
    
    print()
    
    # Test 1: Get Restaurants
    print("-" * 60)
    print("📋 Test 1: Get All Restaurants")
    print("-" * 60)
    try:
        result = agent.get_restaurants()
        print(f"✅ Success: {result['success']}")
        print(f"🔊 Vocal Response: {result['vocal_response'][:100]}...")
        print(f"📊 Data: Found {len(result['data_response'])} restaurants")
        if result.get('voice_audio'):
            print(f"🎵 Voice Audio: Generated ({len(result['voice_audio'])} chars)")
        print()
    except Exception as e:
        print(f"❌ Error: {e}")
        print()
    
    # Test 2: Get Eco Restaurants
    print("-" * 60)
    print("🌿 Test 2: Get Eco Restaurants")
    print("-" * 60)
    try:
        result = agent.get_eco_restaurants()
        print(f"✅ Success: {result['success']}")
        print(f"🔊 Vocal Response: {result['vocal_response'][:100]}...")
        print(f"📊 Data: Found {len(result['data_response'])} eco restaurants")
        print()
    except Exception as e:
        print(f"❌ Error: {e}")
        print()
    
    # Test 3: Get Bio Products
    print("-" * 60)
    print("🥬 Test 3: Get Bio Products")
    print("-" * 60)
    try:
        result = agent.get_bio_products()
        print(f"✅ Success: {result['success']}")
        print(f"🔊 Vocal Response: {result['vocal_response'][:100]}...")
        print(f"📊 Data: Found {len(result['data_response'])} bio products")
        print()
    except Exception as e:
        print(f"❌ Error: {e}")
        print()
    
    # Test 4: Voice Query (Main Feature)
    print("-" * 60)
    print("🎤 Test 4: Voice Query - Main Feature")
    print("-" * 60)
    test_queries = [
        "Quels sont les restaurants disponibles?",
        "Montre-moi les produits biologiques",
        "Liste les restaurants écologiques"
    ]
    
    for i, query in enumerate(test_queries, 1):
        print(f"\nQuery {i}: '{query}'")
        print("-" * 40)
        try:
            result = agent.process_voice_query(query)
            
            if result['success']:
                print(f"✅ Success!")
                print(f"\n🔊 VOCAL RESPONSE:")
                print(f"   {result['vocal_response'][:150]}...")
                
                if result.get('data_response'):
                    print(f"\n📊 DATA RESPONSE:")
                    data = result['data_response']
                    if isinstance(data, str):
                        print(f"   {data[:150]}...")
                    else:
                        print(f"   Type: {type(data)}, Length: {len(data) if hasattr(data, '__len__') else 'N/A'}")
                
                if result.get('sparql_query'):
                    print(f"\n🔍 SPARQL QUERY:")
                    query_lines = result['sparql_query'].split('\n')
                    for line in query_lines[:5]:
                        print(f"   {line}")
                    if len(query_lines) > 5:
                        print(f"   ... ({len(query_lines) - 5} more lines)")
                
                if result.get('voice_audio'):
                    print(f"\n🎵 VOICE AUDIO: Generated (base64, {len(result['voice_audio'])} chars)")
            else:
                print(f"❌ Failed: {result.get('error', 'Unknown error')}")
            
        except Exception as e:
            print(f"❌ Error: {e}")
            import traceback
            traceback.print_exc()
    
    print()
    print("=" * 60)
    print("✅ Testing Complete!")
    print("=" * 60)
    print()
    print("📝 Notes:")
    print("  - This test uses MOCK data (no Fuseki required)")
    print("  - Voice audio is generated using gTTS")
    print("  - To test with real data, start Fuseki and use real SPARQLManager")
    print("  - API Key used:", os.getenv('GEMINI_API_KEY', 'Not set')[:20] + "...")
    print()

if __name__ == "__main__":
    test_ai_bsila()




