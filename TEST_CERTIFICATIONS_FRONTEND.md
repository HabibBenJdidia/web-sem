# 🧪 Guide de Test - Page Certifications

## ✅ Checklist Avant de Tester

### 1. Vérifier que le Backend est démarré
```powershell
# Dans un terminal PowerShell
cd c:\Users\houss\Desktop\ws\web-sem
python app.py
```

✅ Vous devriez voir : `Running on http://127.0.0.1:8000`

### 2. Tester l'API Backend directement
```powershell
# Ouvrir un nouveau terminal PowerShell
curl http://localhost:8000/certification
```

✅ Vous devriez recevoir une réponse JSON (même vide : `[]`)

### 3. Démarrer le Frontend
```powershell
# Dans un nouveau terminal PowerShell
cd c:\Users\houss\Desktop\ws\web-sem\Web-Semantique-Front
npm run dev
```

✅ Vous devriez voir : `Local: http://localhost:5173/`

---

## 🎯 Scénarios de Test

### Test 1️⃣ : Accéder à la Page Certifications

1. **Ouvrir** : http://localhost:5173
2. **Se connecter** avec vos identifiants
3. **Cliquer** sur "Dashboard" ou naviguer vers `/dashboard`
4. **Chercher** l'icône ✓ (badge) dans le menu latéral avec le texte "certifications"
5. **Cliquer** dessus

**Résultat attendu** :
- ✅ Page "Certifications Écologiques" s'affiche
- ✅ Bouton vert "+ Ajouter" en haut à droite
- ✅ Barre de recherche visible
- ✅ Tableau avec colonnes : ID, Label, Organisme, Année, Actions
- ✅ Message "Aucune certification trouvée" si la liste est vide

---

### Test 2️⃣ : Créer une Certification

1. **Cliquer** sur le bouton **"+ Ajouter"** (vert, en haut à droite)
2. **Modal** "Nouvelle Certification" s'ouvre
3. **Remplir** le formulaire :
   - **Label / Nom** : `Écolabel Européen`
   - **Organisme** : `Commission Européenne`
   - **Année d'Obtention** : `2024`
4. **Cliquer** sur **"Créer"** (bouton vert)

**Résultat attendu** :
- ✅ Modal se ferme automatiquement
- ✅ **Notification toast verte** en haut à droite : "Certification créée avec succès"
- ✅ **Nouvelle ligne** apparaît dans le tableau
- ✅ Les données sont correctement affichées

---

### Test 3️⃣ : Rechercher une Certification

1. **Taper** dans la barre de recherche : `Européen`
2. Observer le tableau

**Résultat attendu** :
- ✅ Le tableau **filtre instantanément**
- ✅ Seules les certifications contenant "Européen" dans le label ou l'organisme sont visibles
- ✅ Effacer la recherche affiche à nouveau toutes les certifications

---

### Test 4️⃣ : Modifier une Certification

1. **Cliquer** sur l'icône **✏️ (crayon bleu)** d'une certification
2. **Modal** "Modifier la Certification" s'ouvre
3. Les champs sont **pré-remplis** avec les données existantes
4. **Modifier** par exemple :
   - **Année d'Obtention** : `2025`
5. **Cliquer** sur **"Mettre à jour"** (bouton vert)

**Résultat attendu** :
- ✅ Modal se ferme
- ✅ **Notification toast verte** : "Certification mise à jour avec succès"
- ✅ Le tableau affiche les **nouvelles données**
- ✅ La modification est persistée (rafraîchir la page pour vérifier)

---

### Test 5️⃣ : Supprimer une Certification

1. **Cliquer** sur l'icône **🗑️ (poubelle rouge)** d'une certification
2. **Popup de confirmation** du navigateur s'affiche
3. **Cliquer** sur **"OK"** pour confirmer

**Résultat attendu** :
- ✅ **Notification toast verte** : "Certification supprimée avec succès"
- ✅ La ligne **disparaît** du tableau
- ✅ La suppression est persistée (rafraîchir la page pour vérifier)

---

### Test 6️⃣ : Annuler une Action

1. **Cliquer** sur **"+ Ajouter"** ou sur ✏️ pour modifier
2. **Modal** s'ouvre
3. **Cliquer** sur **"Annuler"** (bouton rouge)

**Résultat attendu** :
- ✅ Modal se ferme
- ✅ Aucune notification
- ✅ Aucun changement dans les données

---

### Test 7️⃣ : Validation du Formulaire

1. **Cliquer** sur **"+ Ajouter"**
2. **Laisser des champs vides**
3. **Cliquer** sur **"Créer"**

**Résultat attendu** :
- ✅ **Notification toast rouge** : "Veuillez remplir tous les champs"
- ✅ Modal **reste ouverte**
- ✅ Aucune donnée n'est créée

---

### Test 8️⃣ : États de Chargement

1. **Rafraîchir** la page (F5)
2. Observer l'interface pendant 1-2 secondes

**Résultat attendu** :
- ✅ **Spinner** (roue qui tourne) s'affiche pendant le chargement
- ✅ Puis le tableau apparaît avec les données

---

## 🐛 Problèmes Courants et Solutions

### Problème : Page blanche
**Cause** : Erreur JavaScript  
**Solution** :
1. Ouvrir la console du navigateur (F12)
2. Vérifier les erreurs en rouge
3. Vérifier que tous les imports sont corrects

### Problème : "Erreur lors du chargement des certifications"
**Cause** : Backend non démarré ou problème CORS  
**Solution** :
```powershell
# Vérifier que le backend tourne
curl http://localhost:8000/health

# Redémarrer le backend si nécessaire
cd c:\Users\houss\Desktop\ws\web-sem
python app.py
```

### Problème : Aucune notification toast n'apparaît
**Cause** : Fichier toast.js non chargé  
**Solution** :
```powershell
# Vérifier que le fichier existe
ls Web-Semantique-Front/src/utils/toast.js

# Vérifier l'import dans Certifications.jsx
```

### Problème : Bouton "+ Ajouter" ne fait rien
**Cause** : Problème d'événement onClick  
**Solution** :
1. Vérifier la console (F12)
2. Chercher des erreurs JavaScript
3. Vérifier que le composant Dialog est bien importé

### Problème : Modal ne se ferme pas
**Cause** : État openDialog non mis à jour  
**Solution** :
1. Cliquer en dehors du modal
2. Appuyer sur Échap
3. Rafraîchir la page si nécessaire

---

## 📸 Captures d'Écran Attendues

### Vue Initiale (liste vide)
```
┌─────────────────────────────────────────────────┐
│ Certifications Écologiques        [+ Ajouter]  │
├─────────────────────────────────────────────────┤
│ [🔍 Rechercher...]                               │
├──────────────────────────────────────────────────┤
│                                                  │
│        Aucune certification trouvée             │
│                                                  │
└──────────────────────────────────────────────────┘
```

### Vue avec Données
```
┌─────────────────────────────────────────────────┐
│ Certifications Écologiques        [+ Ajouter]  │
├─────────────────────────────────────────────────┤
│ [🔍 Rechercher...]                               │
├────┬────────────────┬────────────────┬──────┬───┤
│ ID │ Label          │ Organisme      │ Année│ A │
├────┼────────────────┼────────────────┼──────┼───┤
│ 1  │✓ Écolabel EU   │ Commission EU  │ 2024 │✏🗑│
│ 2  │✓ Bio Label     │ France Bio     │ 2023 │✏🗑│
└────┴────────────────┴────────────────┴──────┴───┘
```

### Modal Création
```
┌───────────────────────────────────┐
│ Nouvelle Certification         [×]│
├───────────────────────────────────┤
│ Label / Nom *                     │
│ [____________________________]    │
│                                   │
│ Organisme *                       │
│ [____________________________]    │
│                                   │
│ Année d'Obtention *               │
│ [____________________________]    │
│                                   │
├───────────────────────────────────┤
│         [Annuler]  [Créer]        │
└───────────────────────────────────┘
```

---

## ✅ Checklist Finale

Après avoir testé tous les scénarios, vérifiez :

- [ ] La page se charge correctement
- [ ] Le tableau affiche les données
- [ ] La recherche fonctionne en temps réel
- [ ] La création fonctionne et affiche une notification
- [ ] La modification fonctionne
- [ ] La suppression fonctionne avec confirmation
- [ ] Les notifications toast s'affichent
- [ ] Les validations fonctionnent
- [ ] Le spinner de chargement s'affiche
- [ ] L'annulation ferme le modal sans modification

---

## 🚀 Tests Avancés

### Test Performance
1. Créer 10-20 certifications
2. Vérifier que la recherche reste rapide
3. Vérifier que le scroll fonctionne

### Test Responsive
1. Redimensionner la fenêtre du navigateur
2. Tester sur mobile (F12 > Mode Responsive)
3. Vérifier que le tableau est scrollable horizontalement

### Test Persistance
1. Créer une certification
2. Fermer le navigateur
3. Rouvrir et vérifier que la donnée existe toujours

---

## 📊 Résultats Attendus

| Test | Attendu | Notes |
|------|---------|-------|
| Chargement page | ✅ 2-3s max | Avec Fuseki local |
| Création | ✅ < 1s | Notification immédiate |
| Modification | ✅ < 1s | Mise à jour visuelle |
| Suppression | ✅ < 1s | Disparition immédiate |
| Recherche | ✅ Instantané | Filtrage local |

---

## 🎯 Si Tout Fonctionne

**Félicitations ! 🎉** Vous avez une interface de gestion des certifications pleinement fonctionnelle !

**Prochaines étapes** :
1. Tester la page **Événements** (même processus)
2. Tester la page **Vue d'ensemble**
3. Ajouter des données réelles
4. Personnaliser selon vos besoins

---

## 📞 Besoin d'Aide ?

**Console du Navigateur** (F12) :
- Onglet **Console** : Erreurs JavaScript
- Onglet **Network** : Requêtes API
- Onglet **Elements** : Structure HTML

**Logs Backend** :
- Terminal où tourne `python app.py`
- Voir les requêtes HTTP reçues

**Documentation** :
- `QUICK_START.md` - Démarrage
- `INTEGRATION_COMPLETE.md` - Architecture
- `GUIDE_CERTIFICATIONS_EVENEMENTS.md` - Guide complet

---

**Bon test ! 🚀**
