import requests
import io

# Créer une vidéo de test de plus de 1KB (simulée)
fake_video_data = b'WEBM\x00\x00\x00\x00' + (b'X' * 2000)  # Plus de 1KB
video_file = io.BytesIO(fake_video_data)

# Préparer la requête
files = {
    'video': ('test.webm', video_file, 'video/webm')
}
data = {
    'message': 'Test avec une vidéo de taille normale'
}

print("Envoi de la requête avec une vidéo de", len(fake_video_data), "bytes...")

try:
    response = requests.post(
        'http://localhost:8000/ai/analyze-video',
        files=files,
        data=data,
        timeout=60
    )
    
    print(f"\nStatus: {response.status_code}")
    print(f"Response: {response.text[:500]}")
    
except Exception as e:
    print(f"\nErreur: {e}")
