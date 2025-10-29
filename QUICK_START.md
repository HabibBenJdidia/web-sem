# 🚀 Guide de Démarrage Rapide

## ⚡ Lancement en 3 étapes

### Étape 1️⃣ : Démarrer le Backend
```powershell
# Ouvrir un terminal PowerShell
cd c:\Users\houss\Desktop\ws\web-sem

# Démarrer Flask
python app.py
```

✅ **Succès** : Vous devriez voir :
```
* Running on http://0.0.0.0:8000
* Running on http://127.0.0.1:8000
```

### Étape 2️⃣ : Démarrer le Frontend
```powershell
# Ouvrir un NOUVEAU terminal PowerShell
cd c:\Users\houss\Desktop\ws\web-sem\Web-Semantique-Front

# Démarrer Vite
npm run dev
```

✅ **Succès** : Vous devriez voir :
```
  VITE v4.5.0  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Étape 3️⃣ : Tester l'Application

1. **Ouvrir le navigateur** : http://localhost:5173

2. **Se connecter** (ou créer un compte)

3. **Accéder au Dashboard** :
   - Cliquez sur "Dashboard" dans le menu
   - Vous verrez le menu latéral avec les nouvelles options :
     - ✓ **Certifications** (icône badge vert)
     - 📅 **Événements** (icône calendrier bleu)
     - 📊 **Vue d'ensemble** (icône graphique)

## 🎯 Test Rapide

### Test Certifications

1. Cliquez sur **"Certifications"** dans le menu
2. Cliquez sur **"+ Ajouter"**
3. Remplissez le formulaire :
   - Label : `Écolabel Test`
   - Organisme : `Commission Européenne`
   - Année : `2024`
4. Cliquez sur **"Créer"**
5. ✅ Vous devriez voir une notification de succès

### Test Événements

1. Cliquez sur **"Événements"** dans le menu
2. Cliquez sur **"+ Ajouter"**
3. Remplissez le formulaire :
   - Nom : `Festival Écologique`
   - Date : Sélectionnez une date future
   - Durée : `6`
   - Prix : `50`
   - Lieu : Sélectionnez une ville
4. Cliquez sur **"Créer"**
5. ✅ Vous devriez voir l'événement dans la liste

### Test Vue d'Ensemble

1. Cliquez sur **"Vue d'ensemble"** dans le menu
2. Vous verrez :
   - 📊 Cartes de statistiques en haut
   - 📅 Onglets : Événements à venir / Certifications récentes / Analyses
   - 📈 Graphiques et métriques

## 🔧 Commandes Utiles

### Backend
```powershell
# Tester les endpoints
.\test_certifications_evenements.ps1

# Vérifier le health check
curl http://localhost:8000/health
```

### Frontend
```powershell
# Installer les dépendances
npm install

# Démarrer en mode dev
npm run dev

# Build pour production
npm run build
```

## 📱 Navigation dans l'Application

```
🏠 Page d'accueil (/)
    └─→ 🔐 Connexion (/auth/sign-in)
            └─→ 📊 Dashboard (/dashboard)
                    ├─→ 🏠 Home (/dashboard/home)
                    ├─→ 📊 Vue d'ensemble (/dashboard/overview) ✨ NOUVEAU
                    ├─→ 👤 Profile (/dashboard/profile)
                    ├─→ 👥 Users (/dashboard/tables)
                    ├─→ ✓ Certifications (/dashboard/certifications) ✨ NOUVEAU
                    ├─→ 📅 Événements (/dashboard/evenements) ✨ NOUVEAU
                    └─→ 🔔 Notifications (/dashboard/notifications)
```

## 🎨 Aperçu des Fonctionnalités

### Page Certifications
- ✅ Tableau avec colonnes : ID, Label, Organisme, Année, Actions
- 🔍 Recherche en temps réel
- ➕ Création via modal
- ✏️ Édition
- 🗑️ Suppression avec confirmation
- 🎨 Design vert (écologie)

### Page Événements
- ✅ Tableau avec : ID, Nom, Date, Durée, Prix, Lieu, Actions
- 🔍 Recherche par nom
- 📅 Date picker natif
- ⏱️ Icônes pour durée et prix
- 📍 Chips pour les lieux
- 🎨 Design bleu (événements)

### Vue d'Ensemble
- 📊 4 cartes de statistiques
- 📅 Événements à venir (top 5)
- ✓ Certifications récentes (top 5)
- 📈 Analyses (organismes, prix)
- 🎨 Design mixte avec onglets

## ⚠️ Prérequis

### Backend
- ✅ Python 3.8+
- ✅ Flask
- ✅ Flask-CORS
- ✅ Fuseki server running

### Frontend
- ✅ Node.js 16+
- ✅ npm ou yarn
- ✅ Material Tailwind
- ✅ Hero Icons

## 🐛 Problèmes Courants

### Backend ne démarre pas
```powershell
# Vérifier Python
python --version

# Installer les dépendances
pip install -r requirements.txt
```

### Frontend ne démarre pas
```powershell
# Nettoyer et réinstaller
rm -r node_modules
rm package-lock.json
npm install
```

### Erreur CORS
```python
# Dans app.py, vérifiez :
from flask_cors import CORS
CORS(app)  # Doit être présent
```

### Page blanche
```javascript
// Ouvrir la console (F12) et vérifier les erreurs
// Vérifier que l'API est accessible
fetch('http://localhost:8000/health')
  .then(r => r.json())
  .then(console.log)
```

## 📚 Documentation Complète

Pour plus de détails, consultez :
- 📖 `INTEGRATION_COMPLETE.md` - Documentation complète
- 📖 `GUIDE_CERTIFICATIONS_EVENEMENTS.md` - Guide détaillé
- 📖 `GUIDE_UTILISATION.md` - Guide général de l'API

## ✨ Fonctionnalités Ajoutées

| Feature | Description | Status |
|---------|-------------|--------|
| API Certifications | CRUD complet | ✅ |
| API Événements | CRUD complet | ✅ |
| UI Certifications | Interface moderne | ✅ |
| UI Événements | Interface moderne | ✅ |
| Vue d'ensemble | Statistiques & Analytics | ✅ |
| Toast notifications | Système custom | ✅ |
| Recherche | Temps réel | ✅ |
| Validation | Frontend + Backend | ✅ |

## 🎉 C'est Parti !

Vous êtes prêt à utiliser l'application ! 

```powershell
# Terminal 1 : Backend
python app.py

# Terminal 2 : Frontend
cd Web-Semantique-Front
npm run dev

# Ouvrir le navigateur
start http://localhost:5173
```

**Bon développement ! 🚀**
