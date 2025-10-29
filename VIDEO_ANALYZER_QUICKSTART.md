# 🚀 DÉMARRAGE RAPIDE - Analyseur Vidéo AI

## 📋 Checklist de Démarrage

### 1️⃣ Prérequis
- [x] Docker installé et démarré
- [x] Node.js installé (v18+)
- [x] Clé API Gemini configurée dans `.env`

### 2️⃣ Démarrer le Backend
```powershell
# Option A : Avec Docker
docker-compose up -d

# Option B : Sans Docker
python app.py
```

**Vérifier** : Backend sur http://localhost:8000

### 3️⃣ Démarrer le Frontend
```powershell
cd Web-Semantique-Front
npm run dev
```

**Vérifier** : Frontend sur http://localhost:5173

### 4️⃣ Accéder à l'Analyseur Vidéo
```
http://localhost:5173/dashboard/video-analyzer
```

---

## 🎬 Premier Test

### Étapes simples :

1. **Ouvrir l'interface**
   - Naviguer vers `/dashboard/video-analyzer`
   - Le composant se charge automatiquement

2. **Autoriser les permissions**
   - Cliquer sur "Démarrer l'enregistrement"
   - Autoriser l'accès caméra + microphone
   - La prévisualisation apparaît

3. **Enregistrer une vidéo test**
   - Parler ou montrer quelque chose (10-20 secondes)
   - Cliquer sur "Arrêter"
   - La vidéo s'affiche en lecture

4. **Analyser avec l'IA**
   - (Optionnel) Ajouter un message : "Je cherche des événements festifs"
   - Cliquer sur "Analyser avec l'IA"
   - Attendre 15-30 secondes

5. **Voir les résultats**
   - Ambiance détectée (vibe, mots-clés, descriptions)
   - Événements recommandés avec scores
   - Niveau de confiance de l'analyse

---

## 🧪 Tests Automatiques

### Test Python
```bash
python test_video_analyzer.py
```

### Test PowerShell
```powershell
.\test_video_analyzer.ps1
```

---

## 📁 Structure des Fichiers

### Backend
```
ai/
  aisalhi_agent.py          # Méthode analyze_video_vibe()
app.py                      # Endpoint POST /ai/analyze-video
```

### Frontend
```
src/
  pages/dashboard/
    video-analyzer.jsx      # Composant principal
    index.js                # Export
  services/
    aisalhi.service.js      # Méthode analyzeVideo()
  routes.jsx                # Route /video-analyzer
```

### Documentation
```
VIDEO_ANALYZER_README.md    # Guide rapide
VIDEO_ANALYZER_GUIDE.md     # Documentation complète
VIDEO_ANALYZER_FEATURE.md   # Présentation fonctionnalité
VIDEO_ANALYZER_SUMMARY.md   # Résumé technique
```

### Tests
```
test_video_analyzer.py      # Tests Python
test_video_analyzer.ps1     # Tests PowerShell
```

---

## 🎯 Cas d'Usage Rapides

### Test 1 : Vidéo Festive
- Enregistrer : Musique, mouvement, énergie
- Résultat attendu : Festivals, concerts

### Test 2 : Vidéo Nature
- Enregistrer : Paysage, sons d'oiseaux, calme
- Résultat attendu : Randonnées, écotourisme

### Test 3 : Vidéo Marché
- Enregistrer : Stands, produits, conversations
- Résultat attendu : Foires, marchés locaux

---

## ⚙️ Configuration

### Variables d'environnement (.env)
```bash
AISALHI_API_KEY=votre_clé_gemini_ici
VITE_API_URL=http://localhost:8000
```

### Vérifier la configuration
```bash
# Backend
curl http://localhost:8000/health

# Frontend  
curl http://localhost:5173
```

---

## 🐛 Problèmes Courants

### Backend ne démarre pas
```powershell
# Vérifier les logs
docker logs web-sem-backend-1

# Redémarrer
docker-compose restart backend
```

### Frontend ne compile pas
```powershell
# Nettoyer et réinstaller
cd Web-Semantique-Front
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Permission caméra refusée
1. Paramètres navigateur > Confidentialité
2. Autoriser caméra/microphone pour localhost
3. Rafraîchir la page

### Timeout lors de l'analyse
- Réduire la durée de la vidéo (< 30 secondes)
- Vérifier la connexion API Gemini
- Vérifier les logs backend

---

## 📊 Format de Réponse API

```json
{
  "vibe_analysis": {
    "mood": "festive",
    "keywords": ["musique", "danse", "joie"],
    "visual_description": "...",
    "audio_description": "...",
    "atmosphere": "...",
    "energy_level": "high"
  },
  "event_recommendations": [
    {
      "event_name": "Festival Eco Music",
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

---

## 🔗 Liens Utiles

- **Backend API** : http://localhost:8000
- **Frontend** : http://localhost:5173
- **Analyseur Vidéo** : http://localhost:5173/dashboard/video-analyzer
- **Health Check** : http://localhost:8000/health
- **API Docs** : http://localhost:8000/ai/help

---

## 💡 Conseils

### Pour de meilleurs résultats :
✅ Vidéos courtes (10-30 secondes)  
✅ Bonne luminosité  
✅ Audio clair  
✅ Montrer l'ambiance globale  
✅ Ajouter un message descriptif  

### À éviter :
❌ Vidéos trop longues  
❌ Vidéos floues ou sombres  
❌ Audio saturé  
❌ Mouvements trop rapides  

---

## 📚 Documentation Complète

Pour plus de détails, consultez :
- [VIDEO_ANALYZER_README.md](./VIDEO_ANALYZER_README.md)
- [VIDEO_ANALYZER_GUIDE.md](./VIDEO_ANALYZER_GUIDE.md)
- [VIDEO_ANALYZER_FEATURE.md](./VIDEO_ANALYZER_FEATURE.md)

---

## ✅ Validation Finale

Avant de déclarer le succès, vérifiez :

- [ ] Backend démarré (docker ps)
- [ ] Frontend démarré (npm run dev)
- [ ] Page accessible (/dashboard/video-analyzer)
- [ ] Permissions caméra/micro accordées
- [ ] Enregistrement fonctionne
- [ ] Upload et analyse fonctionnent
- [ ] Résultats affichés correctement

---

## 🎉 C'est Parti !

**Tout est prêt ! Lancez l'analyseur et testez avec votre première vidéo !** ✨

```bash
# Démarrage complet
docker-compose up -d
cd Web-Semantique-Front && npm run dev

# Ouvrir
start http://localhost:5173/dashboard/video-analyzer
```

---

**Version** : 1.0.0  
**Dernière mise à jour** : 28 octobre 2025  
**Status** : ✅ Ready to Use
