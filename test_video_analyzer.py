# Test Video Analyzer Endpoint
# Tests the /ai/analyze-video endpoint

import requests
import os
import sys

API_BASE_URL = "http://localhost:8000"

def test_video_analyzer():
    """Test the video analyzer endpoint"""
    
    print("🎥 Test de l'analyseur vidéo AI")
    print("=" * 60)
    
    # Check if test video file exists
    test_video_path = "test_video.webm"
    
    if not os.path.exists(test_video_path):
        print("⚠️  Aucun fichier test_video.webm trouvé")
        print("📝 Veuillez créer un fichier vidéo de test ou enregistrer une vidéo via l'interface")
        print("💡 Vous pouvez ignorer ce test si vous testez directement via l'interface web")
        return
    
    print(f"✅ Fichier vidéo trouvé : {test_video_path}")
    print(f"📊 Taille : {os.path.getsize(test_video_path)} bytes")
    
    # Prepare the request
    url = f"{API_BASE_URL}/ai/analyze-video"
    
    with open(test_video_path, 'rb') as video_file:
        files = {
            'video': ('test_video.webm', video_file, 'video/webm')
        }
        data = {
            'message': 'Ceci est un test de l\'analyseur vidéo. Détecte l\'ambiance et recommande des événements similaires.'
        }
        
        print(f"\n🚀 Envoi de la requête à {url}")
        print("⏳ Analyse en cours (cela peut prendre 15-30 secondes)...")
        
        try:
            response = requests.post(url, files=files, data=data, timeout=60)
            
            print(f"\n📡 Status code : {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                
                print("\n✅ SUCCÈS - Analyse terminée !")
                print("=" * 60)
                
                # Display vibe analysis
                if 'vibe_analysis' in result:
                    vibe = result['vibe_analysis']
                    print("\n🎭 ANALYSE DE L'AMBIANCE")
                    print("-" * 60)
                    
                    if 'mood' in vibe:
                        print(f"  Ambiance : {vibe['mood']}")
                    
                    if 'keywords' in vibe:
                        print(f"  Mots-clés : {', '.join(vibe['keywords'])}")
                    
                    if 'visual_description' in vibe:
                        print(f"\n  Description visuelle :")
                        print(f"    {vibe['visual_description']}")
                    
                    if 'audio_description' in vibe:
                        print(f"\n  Description audio :")
                        print(f"    {vibe['audio_description']}")
                    
                    if 'atmosphere' in vibe:
                        print(f"\n  Atmosphère :")
                        print(f"    {vibe['atmosphere']}")
                    
                    if 'energy_level' in vibe:
                        print(f"\n  Niveau d'énergie : {vibe['energy_level']}")
                
                # Display event recommendations
                if 'event_recommendations' in result and result['event_recommendations']:
                    print("\n\n🎉 RECOMMANDATIONS D'ÉVÉNEMENTS")
                    print("-" * 60)
                    
                    for i, event in enumerate(result['event_recommendations'], 1):
                        print(f"\n  {i}. {event.get('event_name', event.get('name', 'Événement'))}")
                        
                        if 'event_type' in event:
                            print(f"     Type : {event['event_type']}")
                        
                        if 'match_score' in event:
                            print(f"     Score de correspondance : {event['match_score']}%")
                        
                        if 'description' in event:
                            print(f"     Description : {event['description']}")
                        
                        if 'why_similar' in event or 'reason' in event:
                            reason = event.get('why_similar', event.get('reason'))
                            print(f"     Pourquoi : {reason}")
                        
                        if 'date' in event:
                            print(f"     Date : {event['date']}")
                        
                        if 'location' in event:
                            print(f"     Lieu : {event['location']}")
                
                # Display confidence score
                if 'confidence_score' in result:
                    print(f"\n\n📊 NIVEAU DE CONFIANCE : {result['confidence_score']}%")
                
                # Display SPARQL queries used (if any)
                if 'sparql_queries' in result and result['sparql_queries']:
                    print("\n\n📝 REQUÊTES SPARQL UTILISÉES")
                    print("-" * 60)
                    for i, query in enumerate(result['sparql_queries'], 1):
                        print(f"\n  Requête {i}:")
                        print(f"  {query[:200]}...")
                
                print("\n" + "=" * 60)
                
            else:
                print(f"\n❌ ERREUR - Status {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"Message : {error_data.get('error', 'Erreur inconnue')}")
                except:
                    print(f"Réponse : {response.text[:500]}")
        
        except requests.exceptions.Timeout:
            print("\n⏱️  TIMEOUT - L'analyse a pris trop de temps")
            print("💡 Essayez avec une vidéo plus courte ou vérifiez la connexion au backend")
        
        except requests.exceptions.ConnectionError:
            print(f"\n❌ ERREUR DE CONNEXION")
            print(f"💡 Vérifiez que le backend est démarré sur {API_BASE_URL}")
            print("   Commande : docker-compose up -d")
        
        except Exception as e:
            print(f"\n❌ ERREUR INATTENDUE : {str(e)}")
            import traceback
            traceback.print_exc()

def test_endpoint_availability():
    """Test if the endpoint is available"""
    print("\n🔍 Test de disponibilité de l'endpoint")
    print("=" * 60)
    
    try:
        response = requests.options(f"{API_BASE_URL}/ai/analyze-video", timeout=5)
        print(f"✅ Endpoint disponible (Status : {response.status_code})")
        return True
    except:
        print(f"❌ Endpoint non disponible sur {API_BASE_URL}")
        print("💡 Vérifiez que le backend est démarré")
        return False

def main():
    print("\n" + "=" * 60)
    print("     TEST DE L'ANALYSEUR VIDÉO AI (AISALHI)")
    print("=" * 60)
    
    # Test endpoint availability first
    if not test_endpoint_availability():
        return
    
    # Test video analyzer
    print("\n")
    test_video_analyzer()
    
    print("\n" + "=" * 60)
    print("📋 INSTRUCTIONS POUR TEST MANUEL")
    print("=" * 60)
    print("1. Ouvrez http://localhost:5173/dashboard/video-analyzer")
    print("2. Autorisez l'accès à la caméra et au microphone")
    print("3. Enregistrez une vidéo courte (10-30 secondes)")
    print("4. Ajoutez un message optionnel")
    print("5. Cliquez sur 'Analyser avec l'IA'")
    print("6. Attendez les résultats (15-30 secondes)")
    print("\n💡 Testez avec différentes ambiances :")
    print("   - Vidéo festive (musique, danse)")
    print("   - Vidéo calme (nature, paysage)")
    print("   - Vidéo d'activité (sport, randonnée)")
    print("=" * 60)

if __name__ == "__main__":
    main()
