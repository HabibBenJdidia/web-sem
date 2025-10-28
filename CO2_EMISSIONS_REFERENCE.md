# 📊 Référence des Émissions CO2 par Type de Transport

## Valeurs Automatiques d'Émission CO2 (kg/km)

Ce document liste les valeurs d'émission CO2 automatiquement attribuées selon le type de transport sélectionné.

### 🟢 **Transports Écologiques (0.00 - 0.04 kg/km)**

| Type de Transport | Émission CO2 (kg/km) | Catégorie Ontologie |
|-------------------|----------------------|---------------------|
| **Vélo** | 0.00 | `TransportNonMotorise` |
| **Transport Non Motorisé** | 0.00 | `TransportNonMotorise` |
| **Train** | 0.03 | `EcoTransport` |
| **Eco Transport** | 0.03 | `EcoTransport` |
| **Bus Électrique** | 0.04 | `EcoTransport` |

---

### 🔵 **Transports Standard (0.06 - 0.12 kg/km)**

| Type de Transport | Émission CO2 (kg/km) | Catégorie Ontologie |
|-------------------|----------------------|---------------------|
| **Bus** | 0.06 | `Transport` |
| **Moto** | 0.08 | `Transport` |
| **Transport Standard** | 0.10 | `Transport` |
| **Voiture** | 0.12 | `Transport` |

---

### 🔴 **Transports à Haute Émission (0.18 - 0.25 kg/km)**

| Type de Transport | Émission CO2 (kg/km) | Catégorie Ontologie |
|-------------------|----------------------|---------------------|
| **Bateau** | 0.18 | `Transport` |
| **Avion** | 0.25 | `Transport` |

---

## 📐 **Conformité Ontologie RDF**

### Contraintes selon l'ontologie `untitled-ontology-13`:

1. **`EcoTransport`** (lignes 534-552):
   - Émission CO2 ≤ 0.05 kg/km
   - ✅ Vérifié: Train (0.03), Bus Électrique (0.04)

2. **`TransportNonMotorise`** (lignes 787-797):
   - Émission CO2 = 0.00 kg/km
   - ✅ Vérifié: Vélo (0.00)

3. **`Transport`** (classe parente):
   - Pas de contrainte spécifique
   - Utilisé pour tous les autres types

---

## 🔧 **Implémentation Frontend**

### Fichier: `Web-Semantique-Front/src/pages/dashboard/transport.jsx`

```javascript
const CO2_EMISSIONS_MAP = {
  "Vélo": 0.0,
  "TransportNonMotorise": 0.0,
  "Train": 0.03,
  "Bus Électrique": 0.04,
  "EcoTransport": 0.03,
  "Voiture": 0.12,
  "Moto": 0.08,
  "Bus": 0.06,
  "Bateau": 0.18,
  "Avion": 0.25,
  "Transport": 0.10, // Valeur par défaut
};
```

---

## 📚 **Sources des Données**

Les valeurs sont basées sur:
- Normes environnementales européennes
- Base de données ADEME (Agence de l'Environnement et de la Maîtrise de l'Énergie)
- Études sur l'empreinte carbone des transports (2023-2025)

### Références:
1. Train électrique: ~30g CO2/km/passager
2. Bus électrique: ~40g CO2/km/passager
3. Voiture thermique: ~120g CO2/km
4. Avion court-courrier: ~250g CO2/km

---

## 🎯 **Fonctionnement de l'Auto-Attribution**

1. L'utilisateur sélectionne un **type de transport** dans le menu déroulant
2. La valeur CO2 est **automatiquement calculée** et affichée
3. Le champ CO2 devient **désactivé** (fond gris) pour éviter la modification manuelle
4. Un **message informatif** avec icône sparkle (✨) confirme l'auto-calcul

### Exemple d'utilisation:

```
1. Sélectionner "Train" 
   → Émission CO2: 0.03 kg/km ✅ (Auto-calculé)

2. Sélectionner "Avion"
   → Émission CO2: 0.25 kg/km ✅ (Auto-calculé)
```

---

## 🔄 **Mise à Jour des Valeurs**

Pour modifier les valeurs CO2:

1. Éditer `CO2_EMISSIONS_MAP` dans `transport.jsx`
2. Mettre à jour ce fichier de référence
3. Vérifier la conformité avec l'ontologie RDF
4. Tester via l'interface graphique

---

**Date de création:** 26 Octobre 2025  
**Version:** 1.0  
**Auteur:** Système de Gestion Eco-Tourism

