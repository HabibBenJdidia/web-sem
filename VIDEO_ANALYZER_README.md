# 🎥 Video Analyzer AI - Quick Start

## 🚀 Démarrage rapide

### 1. Démarrer le backend
```bash
docker-compose up -d
```

### 2. Démarrer le frontend
```bash
cd Web-Semantique-Front
npm run dev
```

### 3. Accéder à l'interface
Ouvrez votre navigateur : http://localhost:5173/dashboard/video-analyzer

---

## 📋 Fonctionnalités

✅ **Enregistrement vidéo avec audio** via webcam et microphone  
✅ **Analyse IA multimodale** (Gemini 2.5 Flash)  
✅ **Détection de l'ambiance** (vibe, émotions, atmosphère)  
✅ **Recommandations d'événements** basées sur la vidéo  
✅ **Score de correspondance** pour chaque événement  
✅ **Interface intuitive** Material Tailwind  

---

## 🎯 Comment utiliser

1. **Cliquez sur "Démarrer l'enregistrement"** 🎥
2. **Enregistrez votre vidéo** (ambiance d'un lieu, événement, etc.)
3. **Arrêtez l'enregistrement** ⏹️
4. **Ajoutez un message optionnel** pour guider l'IA
5. **Cliquez sur "Analyser avec l'IA"** ✨
6. **Consultez les résultats** : ambiance détectée + événements recommandés

---

## 🧪 Tests

### Test automatique (Python)
```bash
python test_video_analyzer.py
```

### Test automatique (PowerShell)
```powershell
.\test_video_analyzer.ps1
```

### Test manuel
1. Naviguez vers `/dashboard/video-analyzer`
2. Enregistrez une vidéo de test
3. Analysez et vérifiez les résultats

---

## 🔧 Architecture

### Backend
- **Endpoint** : `POST /ai/analyze-video`
- **Format** : multipart/form-data
- **Paramètres** :
  - `video` : File (WebM, MP4)
  - `message` : String (optionnel)

### Frontend
- **Composant** : `VideoAnalyzer.jsx`
- **Route** : `/dashboard/video-analyzer`
- **Service** : `aisalhi.service.js`

### IA
- **Modèle** : Gemini 2.5 Flash
- **Capacités** : Vision + Audio
- **Méthode** : `analyze_video_vibe()`

---

## 📊 Format de réponse

```json
{
  "vibe_analysis": {
    "visual_description": "Description de ce qui est vu",
    "audio_description": "Description de ce qui est entendu",
    "mood": "festive",
    "atmosphere": "Ambiance joyeuse et énergique",
    "energy_level": "high",
    "keywords": ["musique", "danse", "foule", "joie"]
  },
  "event_recommendations": [
    {
      "event_name": "Festival Eco Music",
      "event_type": "Festival",
      "match_score": 95,
      "why_similar": "Ambiance festive similaire...",
      "date": "2025-06-15",
      "location": "Marrakech",
      "description": "Festival de musique écologique..."
    }
  ],
  "confidence_score": 88
}
```

---

## 💡 Exemples de cas d'usage

### 🎵 Festival de musique
**Vidéo** : Concert, foule dansante, musique live  
**Recommandations** : Festivals, concerts, événements musicaux

### 🌿 Nature et randonnée
**Vidéo** : Sentier, montagne, sons de nature  
**Recommandations** : Randonnées, zones naturelles, écotourisme

### 🛍️ Marché local
**Vidéo** : Stands, produits locaux, ambiance conviviale  
**Recommandations** : Foires, marchés bio, événements locaux

### 🏛️ Événement culturel
**Vidéo** : Exposition, musée, atmosphère calme  
**Recommandations** : Événements culturels, ateliers, expositions

---

## 🔒 Permissions requises

- **Caméra** : Pour capturer la vidéo
- **Microphone** : Pour capturer l'audio
- **Stockage temporaire** : Pour sauvegarder la vidéo avant upload

---

## ⚙️ Configuration

### Variables d'environnement (.env)
```bash
AISALHI_API_KEY=your_gemini_api_key_here
VITE_API_URL=http://localhost:8000
```

### Formats vidéo supportés
- WebM (VP9 + Opus) - Par défaut
- MP4 (H.264 + AAC) - Supporté

---

## 🐛 Troubleshooting

### Erreur : "Permission refusée"
➡️ Autorisez l'accès caméra/micro dans les paramètres du navigateur

### Erreur : "Endpoint non disponible"
➡️ Vérifiez que le backend est démarré : `docker ps`

### Erreur : "Timeout"
➡️ Vidéo trop longue, essayez avec max 30 secondes

### Erreur : "API Key invalid"
➡️ Vérifiez votre clé Gemini dans `.env`

---

## 📚 Documentation complète

Voir [VIDEO_ANALYZER_GUIDE.md](./VIDEO_ANALYZER_GUIDE.md) pour :
- Architecture détaillée
- API Reference complète
- Guide de développement
- Optimisations futures

---

## 🎨 Screenshots

### Interface d'enregistrement
![Recording Interface](docs/screenshots/video-recorder.png)

### Analyse IA
![AI Analysis](docs/screenshots/video-analysis.png)

### Recommandations
![Event Recommendations](docs/screenshots/event-recommendations.png)

---

## 🚀 Prochaines étapes

- [ ] Support multi-formats (MP4, MOV)
- [ ] Compression avant upload
- [ ] Galerie d'analyses
- [ ] Export PDF des résultats
- [ ] Partage sur réseaux sociaux

---

## 📞 Support

Pour toute question ou problème :
- Consultez [VIDEO_ANALYZER_GUIDE.md](./VIDEO_ANALYZER_GUIDE.md)
- Vérifiez les logs : `docker logs web-sem-backend-1`
- Testez avec : `python test_video_analyzer.py`

---

**Version** : 1.0.0  
**Dernière mise à jour** : 28 octobre 2025  
**License** : MIT
