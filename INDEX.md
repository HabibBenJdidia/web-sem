# 📚 Index des Fichiers - Intégration Certifications & Événements

## 🎯 Vue d'ensemble

Cette intégration ajoute une gestion complète et professionnelle des **Certifications Écologiques** et des **Événements** à votre application de tourisme écologique.

---

## 📁 Structure des Fichiers

### 🎨 Frontend - Pages Dashboard

#### `Web-Semantique-Front/src/pages/dashboard/Certifications.jsx`
**Rôle** : Page de gestion des certifications écologiques  
**Features** :
- Liste avec tableau interactif
- Recherche en temps réel
- Création via modal
- Édition et suppression
- Notifications toast

**Endpoints utilisés** :
- `GET /certification`
- `GET /certification/id/:id`
- `POST /certification`
- `PUT /certification/id/:id`
- `DELETE /certification/id/:id`

---

#### `Web-Semantique-Front/src/pages/dashboard/Evenements.jsx`
**Rôle** : Page de gestion des événements écologiques  
**Features** :
- Tableau enrichi avec icônes
- Sélection de date
- Association avec villes
- CRUD complet
- Recherche par nom

**Endpoints utilisés** :
- `GET /evenement`
- `GET /evenement/id/:id`
- `POST /evenement`
- `PUT /evenement/id/:id`
- `DELETE /evenement/id/:id`

---

#### `Web-Semantique-Front/src/pages/dashboard/Overview.jsx`
**Rôle** : Vue d'ensemble avec statistiques et analytics  
**Features** :
- 4 cartes KPI
- Onglets (Événements / Certifications / Analytics)
- Top 5 événements à venir
- Top 5 certifications récentes
- Analyses (organismes, prix)

**Endpoints utilisés** :
- `GET /certification`
- `GET /evenement`

---

### 🔧 Frontend - Composants & Utilitaires

#### `Web-Semantique-Front/src/components/DashboardStats.jsx`
**Rôle** : Composant réutilisable pour cartes de statistiques  
**Props** :
- `certifications` : Array de certifications
- `evenements` : Array d'événements

**Usage** :
```jsx
import { DashboardStats } from "@/components/DashboardStats";

<DashboardStats 
  certifications={certifications} 
  evenements={evenements} 
/>
```

---

#### `Web-Semantique-Front/src/utils/toast.js`
**Rôle** : Système de notifications toast personnalisé  
**API** :
```javascript
import { toast } from "@/utils/toast";

toast.success("Message de succès");
toast.error("Message d'erreur");
toast.info("Message d'info");
toast.warning("Message d'avertissement");
```

**Features** :
- Animations fluides
- Auto-dismiss (3s par défaut)
- Icônes colorées
- Positionnement top-right

---

### 🌐 Frontend - Services & Configuration

#### `Web-Semantique-Front/src/services/api.js`
**Rôle** : Service centralisé pour requêtes API  
**Nouvelles méthodes** :

**Certifications** :
```javascript
api.getCertifications()                    // GET /certification
api.getCertificationById(id)               // GET /certification/id/:id
api.createCertification(data)              // POST /certification
api.updateCertificationById(id, data)      // PUT /certification/id/:id
api.deleteCertificationById(id)            // DELETE /certification/id/:id
```

**Événements** :
```javascript
api.getEvenements()                        // GET /evenement
api.getEvenementById(id)                   // GET /evenement/id/:id
api.createEvenement(data)                  // POST /evenement
api.updateEvenementById(id, data)          // PUT /evenement/id/:id
api.deleteEvenementById(id)                // DELETE /evenement/id/:id
```

---

#### `Web-Semantique-Front/src/routes.jsx`
**Rôle** : Configuration des routes de l'application  
**Modifications** :
- Import des nouveaux composants
- Import des nouvelles icônes
- Ajout de 3 routes :
  - `/dashboard/overview`
  - `/dashboard/certifications`
  - `/dashboard/evenements`

---

#### `Web-Semantique-Front/src/pages/dashboard/index.js`
**Rôle** : Exports des pages dashboard  
**Modifications** :
```javascript
export * from "@/pages/dashboard/Certifications";
export * from "@/pages/dashboard/Evenements";
export * from "@/pages/dashboard/Overview";
```

---

### 📖 Documentation

#### `INTEGRATION_COMPLETE.md`
**Contenu** :
- Architecture complète
- Technologies utilisées
- Fonctionnalités détaillées
- Captures d'écran conceptuelles
- Guide de personnalisation
- Troubleshooting
- Roadmap

**Usage** : Documentation technique complète

---

#### `GUIDE_CERTIFICATIONS_EVENEMENTS.md`
**Contenu** :
- Guide d'utilisation pas à pas
- Exemples de requêtes API
- Fonctionnalités de l'interface
- Bonnes pratiques
- Dépannage

**Usage** : Guide utilisateur détaillé

---

#### `QUICK_START.md`
**Contenu** :
- Démarrage en 3 étapes
- Tests rapides
- Commandes utiles
- Navigation dans l'app
- Problèmes courants

**Usage** : Démarrage rapide pour nouveaux utilisateurs

---

#### `CHANGELOG.md`
**Contenu** :
- Historique des versions
- Nouveautés ajoutées
- Modifications
- Fichiers créés/modifiés
- Roadmap futur

**Usage** : Suivi des changements et versions

---

#### `INDEX.md` (ce fichier)
**Contenu** :
- Index de tous les fichiers
- Description de chaque fichier
- Usage et API
- Navigation rapide

**Usage** : Navigation et référence rapide

---

### 🧪 Tests

#### `test_certifications_evenements.ps1`
**Rôle** : Script de test PowerShell pour les API  
**Tests** :
1. Créer une certification
2. Lister toutes les certifications
3. Obtenir certification par ID
4. Créer un événement
5. Lister tous les événements
6. Obtenir événement par ID
7. Mettre à jour événement
8. Health check

**Usage** :
```powershell
.\test_certifications_evenements.ps1
```

---

## 🗺️ Navigation Rapide

### Pour démarrer :
1. Lire `QUICK_START.md`
2. Exécuter les commandes de démarrage
3. Tester avec le script PowerShell

### Pour développer :
1. Consulter `INTEGRATION_COMPLETE.md`
2. Explorer les fichiers source
3. Référer à ce fichier (INDEX.md)

### Pour utiliser :
1. Lire `GUIDE_CERTIFICATIONS_EVENEMENTS.md`
2. Naviguer dans l'application
3. Consulter les exemples

### Pour suivre les changements :
1. Lire `CHANGELOG.md`
2. Vérifier les versions
3. Consulter la roadmap

---

## 📊 Diagramme de Dépendances

```
app.py (Backend)
    ↓ REST API
api.js (Service)
    ↓ Fetch
Certifications.jsx ────┐
Evenements.jsx ────────┤→ toast.js (Notifications)
Overview.jsx ──────────┘
    ↓ Uses
DashboardStats.jsx
```

---

## 🎨 Hiérarchie des Composants

```
Dashboard Layout
├── Overview (Vue d'ensemble)
│   └── DashboardStats
│       ├── Card 1: Total Certifications
│       ├── Card 2: Total Événements
│       ├── Card 3: Événements à venir
│       └── Card 4: Certifications récentes
│
├── Certifications
│   ├── SearchBar
│   ├── Table
│   │   ├── Header
│   │   └── Rows
│   │       └── Actions (Edit/Delete)
│   └── Dialog (Create/Edit Form)
│
└── Evenements
    ├── SearchBar
    ├── Table
    │   ├── Header
    │   └── Rows
    │       └── Actions (Edit/Delete)
    └── Dialog (Create/Edit Form)
```

---

## 🔗 Liens API

### Certifications
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/certification` | Liste toutes |
| GET | `/certification/id/:id` | Par ID |
| POST | `/certification` | Créer |
| PUT | `/certification/id/:id` | Modifier |
| DELETE | `/certification/id/:id` | Supprimer |

### Événements
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/evenement` | Liste tous |
| GET | `/evenement/id/:id` | Par ID |
| POST | `/evenement` | Créer |
| PUT | `/evenement/id/:id` | Modifier |
| DELETE | `/evenement/id/:id` | Supprimer |

---

## 📦 Dépendances

### Existantes
- React 18.2.0
- Material Tailwind 2.1.4
- Hero Icons 2.0.18
- React Router 6.17.0

### Nouvelles (aucune !)
Tout est construit avec les dépendances existantes ✨

---

## 🎓 Références Rapides

### Composants Material Tailwind Utilisés
- `Card`, `CardHeader`, `CardBody`
- `Button`, `IconButton`
- `Dialog`, `DialogHeader`, `DialogBody`, `DialogFooter`
- `Input`, `Textarea`
- `Chip`
- `Spinner`
- `Typography`
- `Tabs`, `TabsHeader`, `TabsBody`, `Tab`, `TabPanel`

### Hero Icons Utilisés
- `CalendarIcon`, `CalendarDaysIcon`
- `CheckBadgeIcon`, `CheckCircleIcon`
- `ClockIcon`
- `CurrencyDollarIcon`
- `MapPinIcon`
- `MagnifyingGlassIcon`
- `PencilIcon`
- `PlusIcon`
- `TrashIcon`
- `UserGroupIcon`
- `ChartBarIcon`

---

## ✅ Checklist d'Utilisation

### Premier lancement
- [ ] Lire QUICK_START.md
- [ ] Démarrer le backend
- [ ] Démarrer le frontend
- [ ] Ouvrir http://localhost:5173
- [ ] Se connecter
- [ ] Tester certifications
- [ ] Tester événements
- [ ] Explorer vue d'ensemble

### Développement
- [ ] Lire INTEGRATION_COMPLETE.md
- [ ] Explorer les fichiers source
- [ ] Comprendre l'architecture
- [ ] Modifier selon besoins
- [ ] Tester les modifications

### Déploiement
- [ ] Build frontend : `npm run build`
- [ ] Tester en production
- [ ] Vérifier les endpoints
- [ ] Consulter CHANGELOG.md

---

## 🆘 Besoin d'Aide ?

1. **Problème de démarrage** → `QUICK_START.md`
2. **Comprendre l'architecture** → `INTEGRATION_COMPLETE.md`
3. **Utiliser les features** → `GUIDE_CERTIFICATIONS_EVENEMENTS.md`
4. **Voir les changements** → `CHANGELOG.md`
5. **Navigation fichiers** → `INDEX.md` (ce fichier)

---

**Développé avec ❤️ pour le tourisme écologique durable**

*Dernière mise à jour : 28 Octobre 2025*
