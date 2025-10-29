# 🌿 Eco-Tourism Application - Interface Certifications & Événements

## 🎯 Bienvenue !

Cette application permet de gérer de manière **professionnelle** les **Certifications Écologiques** et les **Événements** dans le cadre d'un système de tourisme écologique basé sur le Web Sémantique.

---

## 🚀 Démarrage Ultra-Rapide

### Option 1 : Script Automatique (Recommandé)
```powershell
.\start_all.ps1
```
Ce script démarre automatiquement le backend et le frontend, puis ouvre votre navigateur ! ✨

### Option 2 : Manuel
```powershell
# Terminal 1 - Backend
python app.py

# Terminal 2 - Frontend
cd Web-Semantique-Front
npm run dev
```

**Ensuite** : Ouvrez http://localhost:5173

---

## 📚 Documentation Disponible

| Document | Description | Quand l'utiliser |
|----------|-------------|------------------|
| **[QUICK_START.md](QUICK_START.md)** | Guide de démarrage rapide | ⭐ Commencez ici |
| **[RESUME.md](RESUME.md)** | Résumé de l'intégration | Vue d'ensemble |
| **[INTEGRATION_COMPLETE.md](INTEGRATION_COMPLETE.md)** | Documentation technique complète | Pour les développeurs |
| **[GUIDE_CERTIFICATIONS_EVENEMENTS.md](GUIDE_CERTIFICATIONS_EVENEMENTS.md)** | Guide d'utilisation détaillé | Pour les utilisateurs |
| **[INDEX.md](INDEX.md)** | Index de navigation | Référence rapide |
| **[AIDE_MEMOIRE.md](AIDE_MEMOIRE.md)** | Aide-mémoire visuel | Référence visuelle |
| **[CHANGELOG.md](CHANGELOG.md)** | Historique des versions | Suivi des changements |

---

## ✨ Nouvelles Fonctionnalités

### ✅ Gestion des Certifications Écologiques
- **Liste** avec recherche en temps réel
- **Création** via formulaire modal
- **Modification** et **Suppression**
- **Notifications** toast pour chaque action

### 📅 Gestion des Événements
- **Liste** enrichie avec icônes
- **Création** avec date picker et sélection de ville
- **Modification** complète
- **Recherche** par nom

### 📊 Vue d'Ensemble
- **4 cartes de statistiques** (KPI)
- **Événements à venir** (top 5)
- **Certifications récentes** (top 5)
- **Analyses** (organismes, prix)

---

## 🎨 Aperçu de l'Interface

```
Dashboard
├── 📊 Vue d'ensemble       ← NOUVEAU
│   ├── Statistiques
│   ├── Événements à venir
│   └── Analytics
│
├── ✅ Certifications       ← NOUVEAU
│   ├── Liste
│   ├── Recherche
│   └── CRUD complet
│
└── 📅 Événements           ← NOUVEAU
    ├── Liste
    ├── Recherche
    └── CRUD complet
```

---

## 🔧 Technologies Utilisées

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, Material Tailwind, Hero Icons |
| **Backend** | Flask, Python |
| **Database** | Apache Jena Fuseki (RDF) |
| **Query Language** | SPARQL |
| **Ontology** | OWL/RDF |

---

## 📦 Structure du Projet

```
web-sem/
├── app.py                          # Backend Flask ✅
├── start_all.ps1                   # Script démarrage auto ✨
├── test_certifications_evenements.ps1  # Tests API ✨
│
├── 📚 Documentation/
│   ├── QUICK_START.md             ✨
│   ├── RESUME.md                  ✨
│   ├── INTEGRATION_COMPLETE.md    ✨
│   ├── GUIDE_CERTIFICATIONS_EVENEMENTS.md  ✨
│   ├── INDEX.md                   ✨
│   ├── AIDE_MEMOIRE.md            ✨
│   └── CHANGELOG.md               ✨
│
└── Web-Semantique-Front/
    └── src/
        ├── pages/dashboard/
        │   ├── Certifications.jsx  ✨
        │   ├── Evenements.jsx      ✨
        │   └── Overview.jsx        ✨
        ├── components/
        │   └── DashboardStats.jsx  ✨
        ├── utils/
        │   └── toast.js            ✨
        └── services/
            └── api.js              📝 (étendu)
```

**Légende** :
- ✨ = Nouveau fichier
- 📝 = Fichier modifié
- ✅ = Fichier existant

---

## 🎯 Fonctionnalités Clés

### Pour les Certifications
- [x] Création
- [x] Lecture (liste + détail)
- [x] Mise à jour
- [x] Suppression
- [x] Recherche en temps réel
- [x] Validation formulaire
- [x] Notifications

### Pour les Événements
- [x] Création
- [x] Lecture (liste + détail)
- [x] Mise à jour
- [x] Suppression
- [x] Recherche par nom
- [x] Sélection de date
- [x] Association avec villes

### Vue d'Ensemble
- [x] Statistiques KPI
- [x] Top événements
- [x] Top certifications
- [x] Analytics

---

## 🧪 Tests

### Script de Test Automatique
```powershell
.\test_certifications_evenements.ps1
```

**Tests inclus** :
- ✅ Création certification
- ✅ Listing certifications
- ✅ Get certification par ID
- ✅ Création événement
- ✅ Listing événements
- ✅ Get événement par ID
- ✅ Update événement
- ✅ Health check

---

## 📖 Guide Rapide d'Utilisation

### 1️⃣ Démarrer l'Application
```powershell
.\start_all.ps1
```

### 2️⃣ Se Connecter
Ouvrir http://localhost:5173 et se connecter

### 3️⃣ Accéder aux Nouvelles Pages
Dans le menu latéral :
- Cliquer sur **"✅ Certifications"**
- Cliquer sur **"📅 Événements"**
- Cliquer sur **"📊 Vue d'ensemble"**

### 4️⃣ Créer une Certification
1. Page Certifications → **[+ Ajouter]**
2. Remplir : Label, Organisme, Année
3. Cliquer **[Créer]**
4. ✅ Notification de succès

### 5️⃣ Créer un Événement
1. Page Événements → **[+ Ajouter]**
2. Remplir : Nom, Date, Durée, Prix, Ville
3. Cliquer **[Créer]**
4. ✅ Notification de succès

---

## 🔌 API Endpoints

### Certifications
```
GET    /certification           Liste toutes
GET    /certification/id/:id    Par ID
POST   /certification           Créer
PUT    /certification/id/:id    Modifier
DELETE /certification/id/:id    Supprimer
```

### Événements
```
GET    /evenement              Liste tous
GET    /evenement/id/:id       Par ID
POST   /evenement              Créer
PUT    /evenement/id/:id       Modifier
DELETE /evenement/id/:id       Supprimer
```

---

## 🐛 Dépannage

### Le backend ne démarre pas
```powershell
python --version              # Vérifier Python
pip install -r requirements.txt  # Installer dépendances
```

### Le frontend ne démarre pas
```powershell
cd Web-Semantique-Front
npm install                   # Installer dépendances
```

### Erreur CORS
Vérifier dans `app.py` :
```python
from flask_cors import CORS
CORS(app)
```

### Plus d'aide
Consultez **[QUICK_START.md](QUICK_START.md)** section "Problèmes Courants"

---

## 📊 Statistiques du Projet

- **Frontend** : ~1500 lignes de code
- **Documentation** : ~2000 lignes
- **Pages créées** : 3 (Certifications, Événements, Overview)
- **Composants** : 2 (DashboardStats, Toast)
- **Tests** : 8 tests automatiques

---

## 🚀 Roadmap

### ✅ Version 1.1 (Actuelle)
- [x] Interface Certifications
- [x] Interface Événements
- [x] Vue d'ensemble
- [x] Documentation complète

### 🔮 Version 1.2 (Planifiée)
- [ ] Pagination
- [ ] Filtres avancés
- [ ] Export CSV/PDF
- [ ] Calendrier visuel

### 🔮 Version 2.0 (Future)
- [ ] Mode sombre
- [ ] Multilingue (i18n)
- [ ] PWA support
- [ ] Mobile app

---

## 👥 Contribution

Ce projet est développé dans le cadre d'un projet académique sur le **Web Sémantique** et le **Tourisme Écologique**.

---

## 📞 Support

Pour toute question :
1. 📖 Consultez la documentation dans l'ordre :
   - `QUICK_START.md` (démarrage)
   - `RESUME.md` (vue d'ensemble)
   - `INTEGRATION_COMPLETE.md` (détails techniques)
2. 🧪 Exécutez les tests : `.\test_certifications_evenements.ps1`
3. 🔍 Vérifiez les logs backend/frontend

---

## 🎉 Prêt à Commencer !

```powershell
# Une seule commande pour tout démarrer :
.\start_all.ps1
```

Puis ouvrez **http://localhost:5173** et explorez ! 🚀

---

## 📝 Licence

Projet académique - Web Sémantique & Tourisme Écologique

---

**Développé avec ❤️ pour un tourisme durable et responsable 🌿**

*Dernière mise à jour : 28 Octobre 2025 | Version 1.1.0*
