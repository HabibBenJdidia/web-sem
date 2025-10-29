# Guide d'Utilisation - Gestion des Événements et Certifications

## 📋 Vue d'ensemble

Ce module permet de gérer professionnellement les **Événements Écologiques** et les **Certifications Éco** dans votre application de tourisme écologique.

## 🎯 Fonctionnalités

### Certifications Écologiques
- ✅ Création de nouvelles certifications
- ✅ Liste complète avec recherche
- ✅ Modification des certifications existantes
- ✅ Suppression avec confirmation
- ✅ Affichage par ID ou URI

### Événements Écologiques
- ✅ Création d'événements avec date, durée, prix
- ✅ Association avec des villes
- ✅ Recherche par nom
- ✅ Gestion complète (CRUD)
- ✅ Interface moderne avec icônes

## 🚀 Démarrage

### 1. Backend (Flask)
Le backend est déjà configuré dans `app.py` avec tous les endpoints nécessaires.

```bash
# Démarrer le backend
cd c:\Users\houss\Desktop\ws\web-sem
python app.py
```

Le serveur démarre sur `http://localhost:8000`

### 2. Frontend (React)
```bash
# Installer les dépendances (si nécessaire)
cd Web-Semantique-Front
npm install

# Démarrer le frontend
npm run dev
```

Le frontend démarre sur `http://localhost:5173`

## 📱 Navigation

Une fois connecté au dashboard :

1. **Certifications** : Cliquez sur l'icône de badge dans le menu latéral
2. **Événements** : Cliquez sur l'icône de calendrier dans le menu latéral

## 🔧 API Endpoints Utilisés

### Certifications
```
GET    /certification          - Liste toutes les certifications
GET    /certification/id/{id}  - Obtenir une certification par ID
POST   /certification          - Créer une nouvelle certification
PUT    /certification/id/{id}  - Mettre à jour une certification
DELETE /certification/id/{id}  - Supprimer une certification
```

### Événements
```
GET    /evenement             - Liste tous les événements
GET    /evenement/id/{id}     - Obtenir un événement par ID
POST   /evenement             - Créer un nouvel événement
PUT    /evenement/id/{id}     - Mettre à jour un événement
DELETE /evenement/id/{id}     - Supprimer un événement
```

## 📝 Exemples d'Utilisation

### Créer une Certification
```javascript
{
  "label_nom": "Écolabel Européen",
  "organisme": "Commission Européenne",
  "annee_obtention": "2023"
}
```

### Créer un Événement
```javascript
{
  "nom": "Festival Écologique de Tunis",
  "event_date": "2025-06-15",
  "event_duree_heures": 8,
  "event_prix": 25.50,
  "a_lieu_dans": "http://example.org/eco-tourism#Ville_Tunis"
}
```

## 🎨 Fonctionnalités de l'Interface

### Page Certifications
- **Tableau interactif** avec colonnes : ID, Label, Organisme, Année
- **Barre de recherche** pour filtrer par nom ou organisme
- **Bouton "Ajouter"** pour créer une nouvelle certification
- **Actions** : Modifier (icône crayon) et Supprimer (icône poubelle)
- **Dialog modal** pour création/édition

### Page Événements
- **Tableau complet** : ID, Nom, Date, Durée, Prix, Lieu
- **Recherche** par nom d'événement
- **Icônes visuelles** : Calendrier, Horloge, Dollar, Localisation
- **Chips colorées** pour afficher les informations
- **Sélection de ville** via dropdown

## 🔐 Sécurité

- Les routes sont protégées via `ProtectedRoute`
- Authentification JWT requise
- Validation des données côté frontend et backend

## 🎯 Bonnes Pratiques

1. **Toujours remplir tous les champs obligatoires** (marqués avec *)
2. **Confirmer avant suppression** pour éviter les pertes de données
3. **Utiliser la recherche** pour trouver rapidement des éléments
4. **Vérifier les notifications** toast pour confirmer les actions

## 🐛 Dépannage

### Erreur "Certification not found"
- Vérifiez que l'ID existe dans la base de données
- Rafraîchissez la liste des certifications

### Erreur "Événement not found"
- Assurez-vous que l'événement n'a pas été supprimé
- Vérifiez la connexion au backend

### Liste vide
- Vérifiez que le backend est démarré
- Vérifiez l'URL de l'API dans `.env` (VITE_API_URL)
- Ouvrez la console du navigateur pour voir les erreurs

## 📊 Structure des Fichiers

```
Web-Semantique-Front/
├── src/
│   ├── pages/
│   │   └── dashboard/
│   │       ├── Certifications.jsx  # Page des certifications
│   │       ├── Evenements.jsx      # Page des événements
│   │       └── index.js            # Exports
│   ├── services/
│   │   └── api.js                  # Service API complet
│   ├── utils/
│   │   └── toast.js                # Système de notifications
│   └── routes.jsx                  # Configuration des routes
```

## 🎓 Technologies Utilisées

- **React 18** - Framework frontend
- **Material Tailwind** - Composants UI
- **Hero Icons** - Icônes
- **React Router** - Navigation
- **Fetch API** - Requêtes HTTP

## ✨ Améliorations Possibles

1. **Pagination** pour grandes listes
2. **Filtres avancés** (par date, prix, organisme)
3. **Export** des données (CSV, PDF)
4. **Calendrier visuel** pour les événements
5. **Upload d'images** pour les événements
6. **Notifications en temps réel**

## 📞 Support

Pour toute question ou problème :
1. Vérifiez les logs du backend dans le terminal
2. Ouvrez la console du navigateur (F12)
3. Consultez ce guide d'utilisation

---

**Développé avec ❤️ pour le tourisme écologique**
