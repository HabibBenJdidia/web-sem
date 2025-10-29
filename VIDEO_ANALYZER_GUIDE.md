# 📹 Analyseur Vidéo avec IA - Guide d'utilisation

## Vue d'ensemble

La fonctionnalité **Analyseur Vidéo AI** permet aux utilisateurs d'enregistrer une vidéo avec audio, puis de la télécharger vers l'IA **AISalhi** pour :
- Détecter l'ambiance/vibe de la vidéo
- Analyser les éléments visuels et audio
- Recommander des événements écologiques similaires

## 🎯 Fonctionnalités

### 1. Enregistrement Vidéo
- **Accès caméra et microphone** : Permission automatique pour accéder à la caméra et au micro
- **Enregistrement en temps réel** : Prévisualisation en direct pendant l'enregistrement
- **Format WebM** : Codec VP9 pour vidéo, Opus pour audio
- **Timer** : Affichage du temps d'enregistrement en cours
- **Qualité** : 1280x720 pixels

### 2. Analyse IA (AISalhi)
L'IA analyse la vidéo sur plusieurs dimensions :

#### Analyse Visuelle
- Environnement et décor
- Activités visibles
- Personnes présentes
- Couleurs dominantes
- Éclairage et atmosphère

#### Analyse Audio
- Sons ambiants
- Musique (style, tempo, énergie)
- Conversations
- Bruits de nature
- Niveau d'énergie sonore

#### Détection de l'Ambiance (Vibe)
- Émotions : joie, calme, aventure, etc.
- Mots-clés descriptifs
- Atmosphère générale : festive, relaxante, énergique, culturelle
- Niveau d'énergie : faible, moyen, élevé

### 3. Recommandations d'Événements
L'IA recommande des événements écologiques basés sur :
- **Score de correspondance** : 0-100% de similarité
- **Type d'événement** : Festival, Foire, Randonnée, etc.
- **Justification** : Explication de la recommandation
- **Détails** : Date, lieu, description

## 📋 Guide d'utilisation

### Étape 1 : Accès
1. Connectez-vous au dashboard
2. Cliquez sur "Analyse Vidéo" dans le menu de navigation
3. Autorisez l'accès à la caméra et au microphone

### Étape 2 : Enregistrement
1. Cliquez sur "Démarrer l'enregistrement" 🎥
2. Enregistrez votre vidéo (ambiance, événement, lieu, etc.)
3. Cliquez sur "Arrêter" ⏹️ quand vous avez terminé
4. Prévisualisez votre vidéo

### Étape 3 : Message optionnel
- Ajoutez un message pour guider l'IA
- Exemple : "Je cherche des festivals de musique en plein air"
- Ce message aide l'IA à affiner ses recommandations

### Étape 4 : Analyse
1. Cliquez sur "Analyser avec l'IA" ✨
2. Patientez pendant l'analyse (peut prendre 10-30 secondes)
3. Consultez les résultats

### Étape 5 : Résultats
Les résultats incluent :
- **Vibe Analysis** : Ambiance détectée, mots-clés, descriptions
- **Recommandations** : Liste d'événements avec scores de correspondance
- **Niveau de confiance** : Fiabilité de l'analyse (0-100%)

## 🔧 Architecture Technique

### Backend (Python + Flask)

#### Endpoint API
```
POST /ai/analyze-video
Content-Type: multipart/form-data

Paramètres :
- video: File (video/webm, video/mp4)
- message: String (optionnel)

Réponse :
{
  "vibe_analysis": {
    "visual_description": "...",
    "audio_description": "...",
    "mood": "festive",
    "atmosphere": "...",
    "energy_level": "high",
    "keywords": ["nature", "musique", "joie"]
  },
  "event_recommendations": [
    {
      "event_name": "Festival Eco Nature",
      "event_type": "Festival",
      "match_score": 95,
      "why_similar": "...",
      "date": "2025-06-15",
      "location": "Marrakech",
      "description": "..."
    }
  ],
  "confidence_score": 88
}
```

#### Agent IA (aisalhi_agent.py)
```python
def analyze_video_vibe(self, video_file_path: str, user_message: str = "")
```

Processus :
1. Upload vidéo vers Gemini File API
2. Attente du processing (état PROCESSING → ACTIVE)
3. Analyse avec Gemini 2.5 Flash (multimodal)
4. Parsing des résultats JSON
5. Exécution de requêtes SPARQL pour enrichir les recommandations
6. Retour des résultats structurés

### Frontend (React + Material Tailwind)

#### Composant : VideoAnalyzer
Fichier : `src/pages/dashboard/video-analyzer.jsx`

**États principaux :**
- `isRecording` : Enregistrement en cours
- `recordedBlob` : Blob vidéo enregistré
- `isAnalyzing` : Analyse en cours
- `analysisResult` : Résultats de l'analyse
- `hasPermission` : Permissions caméra/micro

**Fonctions clés :**
- `requestPermissions()` : Demande accès média
- `startRecording()` : Démarre l'enregistrement
- `stopRecording()` : Arrête et sauvegarde
- `analyzeVideo()` : Upload et analyse IA
- `reset()` : Réinitialise tout

#### Service : AISalhi
Fichier : `src/services/aisalhi.service.js`

```javascript
async analyzeVideo(videoBlob, message = '')
```

## 🎨 Interface Utilisateur

### Composants Material Tailwind utilisés
- `Card` / `CardBody` / `CardHeader` : Structure
- `Button` : Actions (Enregistrer, Arrêter, Analyser)
- `Typography` : Textes
- `Chip` : Tags et badges
- `Alert` : Messages d'erreur
- `Progress` : Barre de progression
- `Spinner` : Indicateur de chargement

### Icônes Heroicons
- 🎥 `VideoCameraIcon` : Enregistrement
- ⏹️ `StopIcon` : Arrêt
- ✨ `SparklesIcon` : IA/Analyse
- ✅ `CheckCircleIcon` : Succès
- ⚠️ `ExclamationTriangleIcon` : Erreur
- ❌ `XMarkIcon` : Fermer/Annuler

## 🌐 Navigation

La page est accessible via :
- **URL** : `/dashboard/video-analyzer`
- **Menu** : "Analyse Vidéo" avec icône 🎥
- **Position** : Après "AISalhi" dans le menu dashboard

## 🔒 Sécurité et Permissions

### Permissions nécessaires
1. **Camera** : `navigator.mediaDevices.getUserMedia({ video: true })`
2. **Microphone** : `navigator.mediaDevices.getUserMedia({ audio: true })`

### Gestion des erreurs
- Permission refusée : Message d'erreur explicite
- Échec d'enregistrement : Réinitialisation automatique
- Erreur d'analyse : Affichage de l'erreur + possibilité de réessayer
- Timeout : Gestion des dépassements de temps

## 📊 Exemples de cas d'usage

### 1. Festival de musique
**Vidéo** : Concert en plein air, foule joyeuse, musique live
**Analyse** : 
- Vibe : Festif, énergique
- Keywords : musique, concert, foule, joie
- Recommandations : Festivals de musique, événements culturels

### 2. Randonnée nature
**Vidéo** : Sentier de montagne, sons d'oiseaux, calme
**Analyse** :
- Vibe : Paisible, aventureux
- Keywords : nature, montagne, tranquillité
- Recommandations : Randonnées, zones naturelles, écotourisme

### 3. Marché local
**Vidéo** : Stands de produits, conversations, ambiance conviviale
**Analyse** :
- Vibe : Social, culturel
- Keywords : marché, local, produits, convivial
- Recommandations : Foires, marchés bio, événements locaux

## 🚀 Optimisations futures

### Court terme
- [ ] Support de formats vidéo supplémentaires (MP4, MOV)
- [ ] Limite de durée d'enregistrement (ex: 2 minutes)
- [ ] Compression vidéo avant upload
- [ ] Prévisualisation avant envoi

### Moyen terme
- [ ] Galerie de vidéos analysées
- [ ] Historique des analyses
- [ ] Partage de résultats
- [ ] Export PDF des recommandations

### Long terme
- [ ] Analyse en temps réel (streaming)
- [ ] Comparaison de vidéos
- [ ] Filtres et effets vidéo
- [ ] Intégration réseaux sociaux

## 📝 Notes techniques

### Formats supportés
- **Enregistrement** : WebM (VP9 + Opus)
- **Upload** : WebM, MP4 (backend flexible)
- **Taille max** : À définir (actuellement illimitée)

### Performance
- **Temps d'analyse moyen** : 15-30 secondes
- **Dépendances** : Google Gemini 2.5 Flash API
- **Limitations** : Rate limits de l'API Gemini

### Compatibilité navigateurs
- ✅ Chrome/Edge (Chromium) : Complet
- ✅ Firefox : Complet
- ⚠️ Safari : Partiel (codec différent)
- ❌ Internet Explorer : Non supporté

## 🐛 Debugging

### Vérifier les logs
```bash
# Backend
docker logs web-sem-backend-1

# Console navigateur
# Ouvrir DevTools > Console
```

### Tests
```bash
# Test de l'endpoint
python test_video_endpoint.py

# Test manuel avec curl
curl -X POST http://localhost:8000/ai/analyze-video \
  -F "video=@test_video.webm" \
  -F "message=Test d'analyse"
```

## 📚 Ressources

- **Gemini File API** : https://ai.google.dev/tutorials/python_quickstart#upload_files
- **MediaRecorder API** : https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder
- **Material Tailwind** : https://www.material-tailwind.com/
- **Heroicons** : https://heroicons.com/

---

**Version** : 1.0.0  
**Dernière mise à jour** : 28 octobre 2025  
**Auteur** : Équipe AISalhi
