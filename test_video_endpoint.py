#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test de l'endpoint d'analyse vidéo
Ce script teste l'endpoint /ai/analyze-video en créant une vidéo de test
"""

import requests
import io
import json

def test_video_endpoint():
    """Test l'endpoint d'analyse vidéo avec un fichier simulé"""
    
    # URL de l'endpoint
    url = "http://localhost:8000/ai/analyze-video"
    
    print("🎬 Test de l'endpoint d'analyse vidéo...")
    print(f"URL: {url}\n")
    
    # Créer un fichier vidéo simulé (données binaires minimales)
    # En réalité, Gemini a besoin d'une vraie vidéo WebM, mais on teste la structure
    video_data = b'\x1a\x45\xdf\xa3'  # Header WebM minimal
    
    # Créer un fichier en mémoire
    video_file = io.BytesIO(video_data)
    video_file.name = 'test_video.webm'
    
    # Préparer les fichiers pour l'upload
    files = {
        'video': ('recording.webm', video_file, 'video/webm')
    }
    
    try:
        # Envoyer la requête
        print("📤 Envoi de la vidéo de test...")
        response = requests.post(url, files=files, timeout=30)
        
        print(f"✅ Status Code: {response.status_code}")
        print(f"✅ Headers: {dict(response.headers)}\n")
        
        # Afficher la réponse
        if response.status_code == 200:
            data = response.json()
            print("📊 Réponse de l'API:")
            print(json.dumps(data, indent=2, ensure_ascii=False))
            
            # Vérifier la structure
            if 'vibe' in data and 'recommendations' in data:
                print("\n✅ Structure de réponse valide!")
                print(f"   - Vibe détecté: {len(data['vibe'].get('emotions', []))} émotions")
                print(f"   - Recommandations: {len(data['recommendations'])} événements")
            else:
                print("\n⚠️  Structure de réponse incomplète")
                
        else:
            print(f"❌ Erreur HTTP {response.status_code}")
            print(f"Réponse: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Erreur de connexion - Le serveur est-il démarré?")
    except requests.exceptions.Timeout:
        print("❌ Timeout - L'analyse prend trop de temps")
    except Exception as e:
        print(f"❌ Erreur: {str(e)}")

def test_video_endpoint_without_file():
    """Test l'endpoint sans fichier pour vérifier la validation"""
    
    url = "http://localhost:8000/ai/analyze-video"
    
    print("\n\n🧪 Test de validation (sans fichier)...")
    print(f"URL: {url}\n")
    
    try:
        response = requests.post(url, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Réponse: {response.json()}")
        
        if response.status_code == 400:
            print("✅ Validation correcte - Erreur 400 attendue")
        else:
            print("⚠️  Code de statut inattendu")
            
    except Exception as e:
        print(f"❌ Erreur: {str(e)}")

if __name__ == "__main__":
    print("=" * 70)
    print("TEST DE L'ENDPOINT D'ANALYSE VIDÉO")
    print("=" * 70 + "\n")
    
    # Test 1: Avec fichier vidéo
    test_video_endpoint()
    
    # Test 2: Sans fichier (validation)
    test_video_endpoint_without_file()
    
    print("\n" + "=" * 70)
    print("TESTS TERMINÉS")
    print("=" * 70)
