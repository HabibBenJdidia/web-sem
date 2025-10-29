# 🎨 Aide-Mémoire Visuel - Interface Certifications & Événements

## 🚀 Commandes de Démarrage

```
┌─────────────────────────────────────────┐
│  TERMINAL 1 - BACKEND                   │
├─────────────────────────────────────────┤
│  cd c:\Users\houss\Desktop\ws\web-sem   │
│  python app.py                          │
│                                         │
│  ✅ Running on http://localhost:8000    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  TERMINAL 2 - FRONTEND                  │
├─────────────────────────────────────────┤
│  cd Web-Semantique-Front                │
│  npm run dev                            │
│                                         │
│  ✅ Local: http://localhost:5173/       │
└─────────────────────────────────────────┘
```

---

## 🗺️ Navigation dans l'Application

```
┌────────────────────────────────────────────────────┐
│  URL: http://localhost:5173                        │
└────────────────────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────────────────┐
│  🏠 PAGE D'ACCUEIL                                 │
│  [Se connecter] [S'inscrire]                       │
└────────────────────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────────────────┐
│  🔐 CONNEXION                                      │
│  Email: _____________                              │
│  Password: __________                              │
│  [Connexion]                                       │
└────────────────────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────────────────┐
│  📊 DASHBOARD                                      │
│  ┌─────────────┬────────────────────────────────┐ │
│  │  SIDEBAR    │  CONTENU PRINCIPAL             │ │
│  │             │                                │ │
│  │  🏠 Home    │                                │ │
│  │  📊 Vue     │  [Votre page sélectionnée]     │ │
│  │  👤 Profile │                                │ │
│  │  👥 Users   │                                │ │
│  │  ✅ Certif. │ ← NOUVEAU                      │ │
│  │  📅 Events  │ ← NOUVEAU                      │ │
│  │  🔔 Notif   │                                │ │
│  └─────────────┴────────────────────────────────┘ │
└────────────────────────────────────────────────────┘
```

---

## ✅ Page Certifications

```
┌──────────────────────────────────────────────────────────┐
│  Certifications Écologiques              [➕ Ajouter]    │
├──────────────────────────────────────────────────────────┤
│  🔍 [Rechercher...]                                      │
├──────┬────────────────┬─────────────────┬────────┬───────┤
│  ID  │  Label         │  Organisme      │  Année │ Actions│
├──────┼────────────────┼─────────────────┼────────┼───────┤
│  1   │ ✅ Écolabel EU │ Commission EU   │ 2024   │ ✏️ 🗑️ │
│  2   │ ✅ Bio Label   │ Ecocert France  │ 2023   │ ✏️ 🗑️ │
│  3   │ ✅ Green Key   │ Foundation      │ 2024   │ ✏️ 🗑️ │
└──────┴────────────────┴─────────────────┴────────┴───────┘

Cliquer sur [➕ Ajouter] ouvre :

╔════════════════════════════════════════╗
║  Nouvelle Certification                ║
╠════════════════════════════════════════╣
║  Label / Nom *                         ║
║  [____________________]                ║
║                                        ║
║  Organisme *                           ║
║  [____________________]                ║
║                                        ║
║  Année d'Obtention *                   ║
║  [____________________]                ║
║                                        ║
║          [Annuler]  [Créer]           ║
╚════════════════════════════════════════╝
```

---

## 📅 Page Événements

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Événements Écologiques                              [➕ Ajouter]       │
├─────────────────────────────────────────────────────────────────────────┤
│  🔍 [Rechercher un événement...]                                        │
├────┬────────────────┬────────┬──────┬──────┬──────────┬────────────────┤
│ ID │  Nom           │  Date  │  ⏱  │  💰  │  Lieu    │  Actions       │
├────┼────────────────┼────────┼──────┼──────┼──────────┼────────────────┤
│ 1  │ 📅 Festival    │ 25 Dec │ 6h   │ 50€  │ Tunis    │ ✏️ 🗑️         │
│ 2  │ 📅 Conférence  │ 10 Jan │ 4h   │ 30€  │ Carthage │ ✏️ 🗑️         │
│ 3  │ 📅 Workshop    │ 15 Feb │ 8h   │ 75€  │ Sousse   │ ✏️ 🗑️         │
└────┴────────────────┴────────┴──────┴──────┴──────────┴────────────────┘

Cliquer sur [➕ Ajouter] ouvre :

╔════════════════════════════════════════╗
║  Nouvel Événement                      ║
╠════════════════════════════════════════╣
║  Nom de l'événement *                  ║
║  [____________________]                ║
║                                        ║
║  Date *                                ║
║  [📅 ____/____/____]                   ║
║                                        ║
║  Durée (heures)                        ║
║  [____]                                ║
║                                        ║
║  Prix (€)                              ║
║  [____]                                ║
║                                        ║
║  Lieu (Ville)                          ║
║  [▼ Sélectionner...____]               ║
║                                        ║
║          [Annuler]  [Créer]           ║
╚════════════════════════════════════════╝
```

---

## 📊 Page Vue d'Ensemble

```
┌────────────────────────────────────────────────────────────┐
│  Vue d'ensemble - Écologie                                 │
│  Statistiques des certifications et événements écologiques │
├────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────┐│
│  │✅ Total     │ │📅 Total     │ │📍 À venir   │ │⭐ Réc││
│  │             │ │             │ │             │ │      ││
│  │     25      │ │     42      │ │     15      │ │   8  ││
│  │ Certifs     │ │ Événements  │ │ Événements  │ │ 2024 ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └──────┘│
├────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────┐│
│  │ [Événements à venir] [Certifications] [Analyses]      ││
│  ├────────────────────────────────────────────────────────┤│
│  │                                                        ││
│  │  📅 Festival Écologique                   25 Dec • 6h ││
│  │     Prix: 50€                                         ││
│  │                                                        ││
│  │  📅 Conférence Climat                     10 Jan • 4h ││
│  │     Prix: 30€                                         ││
│  │                                                        ││
│  │  📅 Workshop Biodiversité                 15 Feb • 8h ││
│  │     Prix: 75€                                         ││
│  │                                                        ││
│  └────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────┘
```

---

## 🔔 Notifications Toast

```
                          ┌─────────────────────────┐
                          │ ✅ Certification créée  │
                          │    avec succès          │
                          └─────────────────────────┘
                          Position: Top-Right
                          Durée: 3 secondes
                          Types:
                          • ✅ Success (vert)
                          • ❌ Error (rouge)
                          • ℹ️ Info (bleu)
                          • ⚠️ Warning (orange)
```

---

## ⌨️ Actions Clavier Rapides

```
┌─────────────────────────────────────────┐
│  ESC           → Fermer modal          │
│  ENTER         → Soumettre formulaire  │
│  TAB           → Navigation champs     │
│  CTRL + F      → Focus recherche       │
└─────────────────────────────────────────┘
```

---

## 🎨 Code Couleurs

```
┌──────────────────────────────────────────────┐
│  Certifications                              │
│  ────────────────────────────               │
│  Couleur principale: 🟢 VERT                │
│  Badge: CheckBadgeIcon                       │
│  Thème: Écologie / Environnement            │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│  Événements                                  │
│  ────────────────────────────               │
│  Couleur principale: 🔵 BLEU                │
│  Badge: CalendarDaysIcon                     │
│  Thème: Planification / Calendrier           │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│  Vue d'ensemble                              │
│  ────────────────────────────               │
│  Couleurs mixtes: 🟢🔵🟠🟣                   │
│  Badge: ChartBarIcon                         │
│  Thème: Analytics / Statistiques             │
└──────────────────────────────────────────────┘
```

---

## 📋 Checklist Utilisation

```
□ Backend démarré (http://localhost:8000)
□ Frontend démarré (http://localhost:5173)
□ Connecté à l'application
□ Navigation vers Dashboard
□ Test création certification
   □ Remplir formulaire
   □ Cliquer "Créer"
   □ Vérifier notification
   □ Voir dans la liste
□ Test création événement
   □ Remplir formulaire
   □ Sélectionner date
   □ Choisir ville
   □ Cliquer "Créer"
   □ Vérifier notification
   □ Voir dans la liste
□ Explorer vue d'ensemble
   □ Voir statistiques
   □ Consulter événements à venir
   □ Consulter certifications récentes
   □ Explorer analyses
```

---

## 🔧 Commandes Utiles

```bash
# Test Backend
curl http://localhost:8000/health
curl http://localhost:8000/certification
curl http://localhost:8000/evenement

# Test Script
.\test_certifications_evenements.ps1

# Frontend Dev
cd Web-Semantique-Front
npm run dev          # Démarrer
npm run build        # Build production
npm run preview      # Preview build

# Backend Dev
python app.py        # Démarrer
python test_api.py   # Tests API
```

---

## 📊 Flux de Travail Typique

```
1️⃣  DÉMARRAGE
    └─→ Terminal 1: python app.py
    └─→ Terminal 2: npm run dev

2️⃣  CONNEXION
    └─→ Ouvrir http://localhost:5173
    └─→ Se connecter

3️⃣  CRÉER CERTIFICATION
    └─→ Menu: Certifications
    └─→ Cliquer [+ Ajouter]
    └─→ Remplir formulaire
    └─→ Cliquer [Créer]
    └─→ ✅ Notification succès

4️⃣  CRÉER ÉVÉNEMENT
    └─→ Menu: Événements
    └─→ Cliquer [+ Ajouter]
    └─→ Remplir formulaire
    └─→ Sélectionner ville
    └─→ Cliquer [Créer]
    └─→ ✅ Notification succès

5️⃣  CONSULTER STATS
    └─→ Menu: Vue d'ensemble
    └─→ Voir KPI
    └─→ Explorer onglets

6️⃣  RECHERCHER
    └─→ Utiliser barre de recherche
    └─→ Résultats temps réel

7️⃣  MODIFIER
    └─→ Cliquer icône ✏️
    └─→ Modifier données
    └─→ [Mettre à jour]

8️⃣  SUPPRIMER
    └─→ Cliquer icône 🗑️
    └─→ Confirmer
    └─→ ✅ Supprimé
```

---

## 🆘 En Cas de Problème

```
❌ Backend ne démarre pas
   └─→ python --version
   └─→ pip install -r requirements.txt

❌ Frontend ne démarre pas
   └─→ rm -r node_modules
   └─→ npm install

❌ Page blanche
   └─→ F12 (console navigateur)
   └─→ Vérifier erreurs

❌ API ne répond pas
   └─→ curl http://localhost:8000/health
   └─→ Redémarrer backend

❌ Données ne s'affichent pas
   └─→ Vérifier console (F12)
   └─→ Tester endpoints directement
   └─→ Vérifier Fuseki
```

---

## 📚 Guides de Référence

```
┌────────────────────────────────────────┐
│  QUICK_START.md                        │
│  → Démarrage rapide                    │
└────────────────────────────────────────┘
┌────────────────────────────────────────┐
│  INTEGRATION_COMPLETE.md               │
│  → Documentation technique             │
└────────────────────────────────────────┘
┌────────────────────────────────────────┐
│  GUIDE_CERTIFICATIONS_EVENEMENTS.md    │
│  → Guide utilisateur                   │
└────────────────────────────────────────┘
┌────────────────────────────────────────┐
│  INDEX.md                              │
│  → Navigation fichiers                 │
└────────────────────────────────────────┘
┌────────────────────────────────────────┐
│  RESUME.md                             │
│  → Résumé général                      │
└────────────────────────────────────────┘
```

---

**🎉 Bonne utilisation de votre nouvelle interface ! 🚀**
