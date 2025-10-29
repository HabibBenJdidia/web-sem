"""
Test rapide de l'endpoint video analyzer
"""
import requests

API_URL = "http://localhost:8000"

def test_endpoint_options():
    """Test OPTIONS request"""
    print("🔍 Test OPTIONS sur /ai/analyze-video...")
    try:
        response = requests.options(f"{API_URL}/ai/analyze-video")
        print(f"✅ Status: {response.status_code}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def test_endpoint_no_file():
    """Test POST without file"""
    print("\n🔍 Test POST sans fichier (devrait retourner 400)...")
    try:
        response = requests.post(f"{API_URL}/ai/analyze-video")
        print(f"Status: {response.status_code}")
        if response.status_code == 400:
            print(f"✅ Erreur attendue: {response.json()}")
            return True
        else:
            print(f"⚠️  Status inattendu: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def main():
    print("=" * 60)
    print("TEST ENDPOINT VIDEO ANALYZER")
    print("=" * 60)
    
    # Test 1: OPTIONS
    test1 = test_endpoint_options()
    
    # Test 2: POST without file
    test2 = test_endpoint_no_file()
    
    print("\n" + "=" * 60)
    print("RÉSULTATS")
    print("=" * 60)
    print(f"Test OPTIONS: {'✅ PASS' if test1 else '❌ FAIL'}")
    print(f"Test POST sans fichier: {'✅ PASS' if test2 else '❌ FAIL'}")
    print(f"\nEndpoint fonctionnel: {'✅ OUI' if test1 and test2 else '❌ NON'}")
    print("=" * 60)
    
    if test1 and test2:
        print("\n💡 L'endpoint est prêt à recevoir des vidéos!")
        print("   Testez maintenant avec l'interface web:")
        print("   http://localhost:5173/dashboard/video-analyzer")
    else:
        print("\n⚠️  Il y a des problèmes avec l'endpoint")

if __name__ == "__main__":
    main()
