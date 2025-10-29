# 🚀 Guide de Démarrage Rapide - Pages Front-Office

## ⚡ Accès Immédiat

### Option 1 : Via le Menu de Navigation
1. Ouvrez votre navigateur : **http://localhost:5173**
2. Dans le menu principal, cliquez sur :
   - **🏆 Certifications** → Page des certifications
   - **📅 Événements** → Page des événements

### Option 2 : URLs Directes
- **Certifications** : `http://localhost:5173/public/certifications`
- **Événements** : `http://localhost:5173/public/evenements`

## 📊 État Actuel des Données

D'après le test, votre base contient :
- ✅ **3 Certifications**
- ✅ **4 Événements**
- ✅ **5 Villes** (Tunis, Sousse, Sfax, Hammamet, Djerba)

## 🎯 Fonctionnalités Disponibles

### Page Certifications
```
┌─────────────────────────────────────┐
│ 🌿 Certifications Écologiques       │
│ [Rechercher...] [Type ▼] [3 rés.]  │
├─────────────────────────────────────┤
│ ┌─────┐  ┌─────┐  ┌─────┐          │
│ │Cert1│  │Cert2│  │Cert3│          │
│ │ ✓   │  │ ✓   │  │ ✓   │          │
│ └─────┘  └─────┘  └─────┘          │
├─────────────────────────────────────┤
│ [3] Total  [?] Actives  [?] Types   │
└─────────────────────────────────────┘
```

**Actions possibles** :
- 🔍 Rechercher par nom ou organisme
- 📋 Filtrer par type de certification
- 📊 Voir les statistiques globales
- 👁️ Consulter les détails de chaque certification

### Page Événements
```
┌─────────────────────────────────────┐
│ 📅 Événements Écologiques           │
│ [4 Événements] [? À venir] [5 Ville]│
│ [Rechercher] [Ville ▼] [Date ▼]    │
├─────────────────────────────────────┤
│ ┌─────────┐  ┌─────────┐           │
│ │ llmm    │  │ update  │           │
│ │11/12/22 │  │11/12/22 │           │
│ │ 1h      │  │ 8h      │           │
│ │ 52€     │  │ 666€    │           │
│ │ 📍?     │  │ 📍?     │           │
│ └─────────┘  └─────────┘           │
└─────────────────────────────────────┘
```

**Actions possibles** :
- 🔍 Rechercher par nom d'événement
- 📍 Filtrer par ville (Tunis, Sousse, etc.)
- 🗓️ Filtrer par date (Tous / À venir / Passés)
- 🔥 Voir badge "À venir" pour événements futurs
- 💰 Consulter prix, durée, lieu

## 🎨 Aperçu du Design

### Certifications
- **Couleur** : Vert écologique 🌿
- **Style** : Cartes modernes avec header vert
- **Badges** : Status "✓ Valide" ou "⚠ À renouveler"
- **Animation** : Effet hover (levée de carte)

### Événements
- **Couleur** : Bleu professionnel 💙
- **Style** : Cartes avec date mise en avant
- **Badges** : "🔥 À venir" pour événements futurs
- **Layout** : Date + Lieu + Détails (durée/prix)

## 🛠️ Commandes Utiles

### Tester l'Intégration
```powershell
# Script de test automatique
.\test_frontoffice.ps1
```

### Ajouter des Données de Test
```powershell
# Créer plus de villes
.\create_villes.ps1

# Créer des certifications (via dashboard)
# http://localhost:5173/dashboard/certifications

# Créer des événements (via dashboard)
# http://localhost:5173/dashboard/evenements
```

### Vérifier les Données Backend
```powershell
# Voir toutes les certifications
curl http://localhost:8000/certification

# Voir tous les événements
curl http://localhost:8000/evenement

# Voir toutes les villes
curl http://localhost:8000/ville
```

## 🔄 Workflow Complet

### Pour les Administrateurs
1. **Connexion** : `http://localhost:5173/auth/sign-in`
2. **Dashboard** : `http://localhost:5173/dashboard/home`
3. **Gérer Certifications** : `http://localhost:5173/dashboard/certifications`
   - Ajouter / Modifier / Supprimer
4. **Gérer Événements** : `http://localhost:5173/dashboard/evenements`
   - Ajouter / Modifier / Supprimer / Choisir ville

### Pour les Visiteurs (Public)
1. **Page d'accueil** : `http://localhost:5173`
2. **Clic menu** : "🏆 Certifications" ou "📅 Événements"
3. **Parcourir** : Rechercher, filtrer, consulter
4. **S'inscrire** : Clic sur "S'inscrire" (CTA)

## 📱 Responsive Design

Les pages sont **100% responsives** :

| Device | Layout |
|--------|--------|
| 📱 Mobile | 1 colonne |
| 📱 Tablet | 2 colonnes |
| 💻 Desktop | 3 colonnes |
| 🖥️ Large | 3 colonnes |

## ✅ Checklist de Vérification

Avant de présenter :

- [ ] Backend actif (`python app.py`)
- [ ] Frontend actif (`npm run dev`)
- [ ] Au moins 3+ certifications en base
- [ ] Au moins 3+ événements en base
- [ ] Au moins 3+ villes en base
- [ ] Menu navigation avec liens visibles
- [ ] Pages accessibles via URLs directes
- [ ] Recherche fonctionne
- [ ] Filtres fonctionnent
- [ ] Stats affichées correctement
- [ ] Design responsive testé

## 🎓 Pour Aller Plus Loin

### Créer Plus de Données
**Certifications** :
```powershell
$body = @{
    nom = "Ecolabel Europeen"
    type_certification = "Label Officiel"
    organisme_certificateur = "Commission Europeenne"
    criteres_certification = "Criteres environnementaux stricts"
    date_certification = "2024-01-15"
    certification_valide = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/certification" -Method Post -Body $body -ContentType "application/json"
```

**Événements** :
```powershell
$body = @{
    nom = "Festival Eco-Tourism Tunis 2025"
    event_date = "2025-12-20"
    event_duree_heures = 12
    event_prix = 75
    a_lieu_dans = "http://example.org/eco-tourism#Ville_Tunis"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/evenement" -Method Post -Body $body -ContentType "application/json"
```

### Personnaliser l'Apparence
Modifiez les fichiers :
- `CertificationsPublic.jsx` → Couleurs, layout
- `EvenementsPublic.jsx` → Style, badges
- `landing.css` → CSS global

## 🐛 Problèmes Courants

### "Page blanche"
```powershell
# Vider le cache
Ctrl + Shift + R

# Vérifier la console
F12 → Console → Chercher erreurs
```

### "Aucune donnée"
```powershell
# Vérifier le backend
curl http://localhost:8000/health

# Créer des données
# Via dashboard ou scripts PowerShell
```

### "Menu ne s'affiche pas"
```powershell
# Redémarrer le frontend
cd Web-Semantique-Front
Ctrl + C
npm run dev
```

## 📚 Documentation Complète

Pour plus de détails, consultez :
- **FRONT_OFFICE_PAGES.md** → Guide détaillé
- **SOLUTION_DROPDOWN_VILLES.md** → Fix villes
- **INTEGRATION_COMPLETE.md** → Integration dashboard

## 🎉 Félicitations !

Vous avez maintenant :
✅ Un **back-office** complet (dashboard admin)
✅ Un **front-office** professionnel (pages publiques)
✅ Une **intégration complète** backend-frontend
✅ Des **outils de test** et scripts

**Prêt pour la démo ! 🚀**

---

**Question ? Problème ? Consultez les guides ou testez avec `.\test_frontoffice.ps1` !**
