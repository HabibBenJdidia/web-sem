"""
Test direct de l'endpoint avec curl pour voir l'erreur
"""
import requests
import io

API_URL = "http://localhost:8000"

def test_with_fake_video():
    """Test avec un fichier vidéo fictif"""
    print("🔍 Test avec fichier vidéo fictif...")
    
    try:
        # Créer un fichier fictif
        fake_video = io.BytesIO(b"fake video data")
        
        files = {
            'video': ('test.webm', fake_video, 'video/webm')
        }
        data = {
            'message': 'Test message'
        }
        
        response = requests.post(
            f"{API_URL}/ai/analyze-video",
            files=files,
            data=data,
            timeout=10
        )
        
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text[:500]}")
        
        if response.status_code == 500:
            try:
                error_data = response.json()
                print(f"\n❌ Erreur serveur:")
                print(f"Error: {error_data.get('error', 'Unknown')}")
                if 'vibe_analysis' in error_data:
                    print(f"Details: {error_data['vibe_analysis'].get('visual_description', '')}")
            except:
                print(f"\n❌ Réponse brute: {response.text}")
        
    except Exception as e:
        print(f"❌ Exception: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_with_fake_video()
