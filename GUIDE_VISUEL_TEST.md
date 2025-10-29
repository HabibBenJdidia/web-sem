# 🎯 Guide Visuel - Test Certifications Frontend

## 📋 Checklist Rapide

### ✅ Étape 1: Backend
```powershell
# Terminal 1
cd c:\Users\houss\Desktop\ws\web-sem
python app.py
```
**Attendez de voir** : `Running on http://127.0.0.1:8000`

### ✅ Étape 2: Test API Backend
```powershell
# Terminal 2
cd c:\Users\houss\Desktop\ws\web-sem
.\test_backend_certifications.ps1
```
**Vérifiez** : Tous les tests sont ✓ verts

### ✅ Étape 3: Frontend
```powershell
# Terminal 3
cd c:\Users\houss\Desktop\ws\web-sem\Web-Semantique-Front
npm run dev
```
**Attendez de voir** : `Local: http://localhost:5173/`

---

## 🖥️ Test dans le Navigateur

### Navigation
```
1. Ouvrir http://localhost:5173
2. Se connecter
3. Cliquer "Dashboard" (ou aller à /dashboard/home)
4. Menu latéral → Chercher l'icône ✓ avec "certifications"
5. Cliquer dessus
```

### URL Directe
Si vous êtes déjà connecté :
```
http://localhost:5173/dashboard/certifications
```

---

## 📸 Ce que Vous Devriez Voir

### 1. En-tête de la Page
```
┌─────────────────────────────────────────────────────────┐
│ 🟢 Certifications Écologiques        [+ Ajouter]       │
└─────────────────────────────────────────────────────────┘
```
- Fond vert (couleur écologie)
- Titre blanc
- Bouton blanc "+ Ajouter" aligné à droite

---

### 2. Barre de Recherche
```
┌─────────────────────────────────────────────────────────┐
│ 🔍 Rechercher...                                        │
└─────────────────────────────────────────────────────────┘
```
- Icône loupe à gauche
- Texte placeholder "Rechercher..."

---

### 3. Tableau (vide initialement)
```
┌──────┬─────────────┬──────────────┬────────┬─────────┐
│ ID   │ Label       │ Organisme    │ Année  │ Actions │
├──────┼─────────────┼──────────────┼────────┼─────────┤
│                                                        │
│          Aucune certification trouvée                 │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

### 4. Créer une Certification

**Action** : Cliquer sur "+ Ajouter"

**Modal qui s'ouvre** :
```
┌───────────────────────────────────────────────┐
│  Nouvelle Certification                    [×]│
├───────────────────────────────────────────────┤
│                                               │
│  Label / Nom *                                │
│  ┌─────────────────────────────────────────┐ │
│  │                                         │ │
│  └─────────────────────────────────────────┘ │
│                                               │
│  Organisme *                                  │
│  ┌─────────────────────────────────────────┐ │
│  │                                         │ │
│  └─────────────────────────────────────────┘ │
│                                               │
│  Année d'Obtention *                          │
│  ┌─────────────────────────────────────────┐ │
│  │                                         │ │
│  └─────────────────────────────────────────┘ │
│                                               │
├───────────────────────────────────────────────┤
│              [Annuler] [Créer]                │
└───────────────────────────────────────────────┘
```

**Remplir** :
- Label : `Écolabel Européen`
- Organisme : `Commission Européenne`
- Année : `2024`

**Cliquer** : Bouton vert "Créer"

---

### 5. Notification Toast

**Après création, en haut à droite** :
```
┌─────────────────────────────────────────┐
│ ✓  Certification créée avec succès  [×] │
└─────────────────────────────────────────┘
```
- Fond blanc
- Bordure gauche verte
- Icône ✓ verte
- Bouton × pour fermer
- Disparaît automatiquement après 3 secondes

---

### 6. Tableau avec Données
```
┌────┬─────────────────────┬────────────────────┬────────┬────────┐
│ ID │ Label               │ Organisme          │ Année  │ Actions│
├────┼─────────────────────┼────────────────────┼────────┼────────┤
│ 1  │ ✓ Écolabel Européen │ Commission EU      │  2024  │ ✏️  🗑️ │
└────┴─────────────────────┴────────────────────┴────────┴────────┘
```

**Détails** :
- Icône ✓ verte avant le label
- Année affichée comme chip (badge)
- Boutons : 
  - ✏️ bleu pour modifier
  - 🗑️ rouge pour supprimer

---

### 7. Recherche en Action

**Taper** : "Européen" dans la barre de recherche

```
┌─────────────────────────────────────────────────────────┐
│ 🔍 Européen                                             │
└─────────────────────────────────────────────────────────┘

┌────┬─────────────────────┬────────────────────┬────────┬────────┐
│ ID │ Label               │ Organisme          │ Année  │ Actions│
├────┼─────────────────────┼────────────────────┼────────┼────────┤
│ 1  │ ✓ Écolabel Européen │ Commission EU      │  2024  │ ✏️  🗑️ │
└────┴─────────────────────┴────────────────────┴────────┴────────┘
```

**Taper** : "xyz" (qui n'existe pas)

```
┌─────────────────────────────────────────────────────────┐
│ 🔍 xyz                                                  │
└─────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│                                                        │
│          Aucune certification trouvée                 │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

### 8. Modifier une Certification

**Cliquer** : ✏️ (crayon bleu)

**Modal pré-rempli** :
```
┌───────────────────────────────────────────────┐
│  Modifier la Certification                 [×]│
├───────────────────────────────────────────────┤
│                                               │
│  Label / Nom *                                │
│  ┌─────────────────────────────────────────┐ │
│  │ Écolabel Européen                       │ │ ← Pré-rempli
│  └─────────────────────────────────────────┘ │
│                                               │
│  Organisme *                                  │
│  ┌─────────────────────────────────────────┐ │
│  │ Commission Européenne                   │ │ ← Pré-rempli
│  └─────────────────────────────────────────┘ │
│                                               │
│  Année d'Obtention *                          │
│  ┌─────────────────────────────────────────┐ │
│  │ 2024                                    │ │ ← Pré-rempli
│  └─────────────────────────────────────────┘ │
│                                               │
├───────────────────────────────────────────────┤
│          [Annuler] [Mettre à jour]            │
└───────────────────────────────────────────────┘
```

**Modifier** : Année → `2025`
**Cliquer** : "Mettre à jour"

---

### 9. Supprimer une Certification

**Cliquer** : 🗑️ (poubelle rouge)

**Popup Navigateur** :
```
┌─────────────────────────────────────────────┐
│  ⚠️  Message                                 │
├─────────────────────────────────────────────┤
│  Êtes-vous sûr de vouloir supprimer cette   │
│  certification ?                            │
│                                             │
│          [Annuler]  [OK]                    │
└─────────────────────────────────────────────┘
```

**Cliquer** : OK

**Toast** :
```
┌─────────────────────────────────────────────┐
│ ✓  Certification supprimée avec succès  [×] │
└─────────────────────────────────────────────┘
```

**Ligne disparaît** du tableau

---

## 🔍 Vérification dans la Console

### Ouvrir la Console du Navigateur
- **Windows** : `F12` ou `Ctrl + Shift + I`
- **Mac** : `Cmd + Option + I`

### Onglets à Surveiller

#### Console
```javascript
// Vous devriez voir (lors du chargement) :
Fetching certifications...
✓ Certifications loaded: 1

// PAS d'erreurs en rouge
```

#### Network
```
Name                   Status   Type        Size
────────────────────────────────────────────────
certification          200      fetch       1.2kb
certification          201      fetch       850b  (POST)
certification/id/1     200      fetch       650b  (PUT)
```

#### Elements
```html
<!-- Structure attendue -->
<div class="mt-12 mb-8">
  <div class="Card">
    <div class="CardHeader variant-gradient color-green">
      <h6>Certifications Écologiques</h6>
      <button>+ Ajouter</button>
    </div>
    <div class="CardBody">
      <input placeholder="Rechercher..." />
      <table>
        ...
      </table>
    </div>
  </div>
</div>
```

---

## ⚙️ Console Backend (Terminal Python)

Lorsque vous testez, vous devriez voir dans le terminal backend :

```
127.0.0.1 - - [28/Oct/2025 14:30:15] "GET /certification HTTP/1.1" 200 -
127.0.0.1 - - [28/Oct/2025 14:30:25] "POST /certification HTTP/1.1" 200 -
127.0.0.1 - - [28/Oct/2025 14:30:35] "PUT /certification/id/1 HTTP/1.1" 200 -
127.0.0.1 - - [28/Oct/2025 14:30:45] "DELETE /certification/id/1 HTTP/1.1" 200 -
```

**Pas d'erreurs 500 ou 404**

---

## ✅ Checklist de Validation

Cochez après avoir vérifié :

- [ ] Page charge sans erreur
- [ ] En-tête vert visible
- [ ] Bouton "+ Ajouter" présent
- [ ] Barre de recherche fonctionne
- [ ] Modal création s'ouvre/ferme
- [ ] Champs du formulaire acceptent la saisie
- [ ] Validation empêche soumission si champs vides
- [ ] Création fonctionne (toast + ligne apparaît)
- [ ] Modification fonctionne (modal pré-rempli)
- [ ] Suppression fonctionne (confirmation + toast)
- [ ] Recherche filtre instantanément
- [ ] Notifications toast apparaissent et disparaissent
- [ ] Console sans erreurs rouges
- [ ] Network montre requêtes réussies (200/201)

---

## 🎨 Palette de Couleurs Attendue

```
Header:         Dégradé vert (Material Tailwind green)
Texte Header:   Blanc
Bouton Ajouter: Blanc avec texte vert
Recherche:      Gris clair
Tableau:        Blanc avec bordures grises
Icône ✓:        Vert (#4CAF50)
Bouton Edit:    Bleu
Bouton Delete:  Rouge
Toast Success:  Bordure verte, fond blanc
Toast Error:    Bordure rouge, fond blanc
Chips Année:    Gris-bleu
```

---

## 🐛 Si Quelque Chose Ne Fonctionne Pas

### Problème : Page Blanche
1. **Console (F12)** → Regarder les erreurs
2. Vérifier que tous les fichiers sont créés :
   ```powershell
   ls Web-Semantique-Front/src/pages/dashboard/Certifications.jsx
   ls Web-Semantique-Front/src/utils/toast.js
   ls Web-Semantique-Front/src/components/DashboardStats.jsx
   ```

### Problème : Erreur "Cannot read property..."
- Vérifier les imports en haut du fichier
- Redémarrer le serveur Vite (`Ctrl+C` puis `npm run dev`)

### Problème : Boutons ne fonctionnent pas
- Vérifier la console pour erreurs onClick
- Vérifier que Material Tailwind est installé

### Problème : Toast ne s'affiche pas
- Vérifier `toast.js` existe dans `src/utils/`
- Vérifier l'import : `import { toast } from "@/utils/toast"`

---

## 📞 Aide Supplémentaire

**Documentation** :
- `TEST_CERTIFICATIONS_FRONTEND.md` - Tests détaillés
- `QUICK_START.md` - Démarrage rapide
- `INTEGRATION_COMPLETE.md` - Architecture complète

**Scripts** :
```powershell
.\test_backend_certifications.ps1  # Test API backend
.\start_all.ps1                    # Démarrage auto
```

---

**Bon test ! 🚀 Tout devrait fonctionner parfaitement !**
