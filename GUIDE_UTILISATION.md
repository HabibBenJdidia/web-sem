# 🌍 Guide d'utilisation - Application Eco-Tourism

## 📡 URLs de l'application

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173/ | - |
| **API Backend** | http://localhost:8000/ | - |
| **Documentation API** | http://localhost:8000/ | Liste tous les endpoints |
| **Fuseki SPARQL** | http://localhost:3030/ | admin/admin |

## 🚀 Démarrage rapide

### 1. Démarrer tous les services

```powershell
# Terminal 1 - Démarrer Fuseki + API (avec Docker)
docker-compose up

# Terminal 2 - Démarrer le Frontend
cd Web-Semantique-Front
npm run dev
```

### 2. Initialiser la base de données

```powershell
# Créer le dataset et charger l'ontologie
python setup_fuseki.py
```

## 👤 Gestion des utilisateurs

### S'inscrire (Touriste)

```powershell
Invoke-WebRequest -Uri "http://localhost:8000/auth/register" `
  -Method POST `
  -Body '{"nom":"Marie Dubois","email":"marie@example.com","password":"secret123","age":28,"nationalite":"France","type":"touriste"}' `
  -ContentType "application/json"
```

### S'inscrire (Guide)

```powershell
Invoke-WebRequest -Uri "http://localhost:8000/auth/register" `
  -Method POST `
  -Body '{"nom":"Ahmed Ben Ali","email":"ahmed@example.com","password":"secret123","age":35,"nationalite":"Tunisie","type":"guide"}' `
  -ContentType "application/json"
```

### Se connecter

```powershell
$response = Invoke-WebRequest -Uri "http://localhost:8000/auth/login" `
  -Method POST `
  -Body '{"email":"marie@example.com","password":"secret123"}' `
  -ContentType "application/json"

$token = ($response.Content | ConvertFrom-Json).token
Write-Host "Token: $token"
```

### Récupérer son profil

```powershell
Invoke-WebRequest -Uri "http://localhost:8000/auth/profile" `
  -Headers @{"Authorization"="Bearer $token"}
```

## 🏨 Créer des hébergements

### Hébergement écologique

```powershell
Invoke-WebRequest -Uri "http://localhost:8000/hebergement" `
  -Method POST `
  -Body '{"nom":"Eco Lodge Djerba","type":"Lodge","prix":120.0,"nb_chambres":15,"niveau_eco":"Gold"}' `
  -ContentType "application/json"
```

### Lister tous les hébergements

```powershell
Invoke-WebRequest -Uri "http://localhost:8000/hebergement" | 
  Select-Object -ExpandProperty Content
```

## 🎯 Créer des activités

### Activité de randonnée

```powershell
Invoke-WebRequest -Uri "http://localhost:8000/activite" `
  -Method POST `
  -Body '{"nom":"Trek Sahara 3 jours","difficulte":"Difficile","duree_heures":72,"prix":250.0}' `
  -ContentType "application/json"
```

### Activité nautique

```powershell
Invoke-WebRequest -Uri "http://localhost:8000/activite" `
  -Method POST `
  -Body '{"nom":"Plongee sous-marine","difficulte":"Facile","duree_heures":2.5,"prix":45.0}' `
  -ContentType "application/json"
```

## 🚗 Créer des moyens de transport

### Transport écologique

```powershell
Invoke-WebRequest -Uri "http://localhost:8000/transport" `
  -Method POST `
  -Body '{"nom":"Velo electrique","type":"Velo","emission_co2_per_km":0.0}' `
  -ContentType "application/json"
```

## 🍽️ Créer des restaurants

### Restaurant bio

```powershell
Invoke-WebRequest -Uri "http://localhost:8000/restaurant" `
  -Method POST `
  -Body '{"nom":"Le Jardin Bio","type":"Restaurant","prix_moyen":25.0,"cuisine":"Mediterraneenne"}' `
  -ContentType "application/json"
```

## 🏙️ Créer des destinations

### Ville touristique

```powershell
Invoke-WebRequest -Uri "http://localhost:8000/ville" `
  -Method POST `
  -Body '{"nom":"Sidi Bou Said","pays":"Tunisie","climat":"Mediterraneen"}' `
  -ContentType "application/json"
```

### Destination générale

```powershell
Invoke-WebRequest -Uri "http://localhost:8000/destination" `
  -Method POST `
  -Body '{"nom":"Sahara","pays":"Tunisie","climat":"Desertique"}' `
  -ContentType "application/json"
```

## 🔍 Recherches avancées

### Rechercher par nom

```powershell
Invoke-WebRequest -Uri "http://localhost:8000/search/name/Sahara"
```

### Hébergements éco-responsables

```powershell
Invoke-WebRequest -Uri "http://localhost:8000/search/eco-hebergements"
```

### Produits bio locaux

```powershell
Invoke-WebRequest -Uri "http://localhost:8000/search/bio-products"
```

### Transports zéro émission

```powershell
Invoke-WebRequest -Uri "http://localhost:8000/search/zero-emission-transport"
```

## 📊 Requêtes SPARQL directes (via Fuseki)

### Lister tous les touristes

Allez sur http://localhost:3030/#/dataset/ecotourism/query et exécutez :

```sparql
PREFIX eco: <http://example.org/eco-tourism#>
SELECT * WHERE {
  ?touriste a eco:Touriste .
  OPTIONAL { ?touriste eco:nom ?nom }
  OPTIONAL { ?touriste eco:age ?age }
  OPTIONAL { ?touriste eco:nationalite ?nationalite }
}
```

### Compter les entités

```sparql
PREFIX eco: <http://example.org/eco-tourism#>
SELECT ?type (COUNT(?entity) AS ?count) WHERE {
  ?entity a ?type .
  FILTER(STRSTARTS(STR(?type), "http://example.org/eco-tourism#"))
} GROUP BY ?type
```

## 🤖 Fonctionnalités IA (nécessite AISALHI_API_KEY)

Pour activer l'IA, ajoutez votre clé API dans un fichier `.env` :

```bash
AISALHI_API_KEY=votre_cle_ici
```

Puis utilisez :

```powershell
# Poser une question
Invoke-WebRequest -Uri "http://localhost:8000/ai/ask" `
  -Method POST `
  -Body '{"question":"Quelles sont les activites disponibles?"}' `
  -ContentType "application/json"

# Obtenir des recommandations
Invoke-WebRequest -Uri "http://localhost:8000/ai/recommend-activities" `
  -Method POST `
  -Body '{"age":30,"nationalite":"France","preferences":["nature","eco"],"budget":100}' `
  -ContentType "application/json"
```

## 🛠️ Commandes utiles

### Vérifier le statut de l'API

```powershell
Invoke-WebRequest -Uri "http://localhost:8000/health"
```

### Lister tous les endpoints

```powershell
Invoke-WebRequest -Uri "http://localhost:8000/"
```

### Redémarrer les services Docker

```powershell
docker-compose restart
```

### Voir les logs

```powershell
docker-compose logs -f app
docker-compose logs -f fuseki
```

## 📱 Utiliser le Frontend

1. Ouvrez http://localhost:5173/
2. Inscrivez-vous ou connectez-vous
3. Explorez le tableau de bord
4. Créez et gérez vos données via l'interface graphique

## 🐛 Dépannage

### Le frontend ne démarre pas

```powershell
cd Web-Semantique-Front
npm install
npm run dev
```

### Fuseki ne répond pas

```powershell
docker-compose restart fuseki
```

### L'API retourne des erreurs 400

Vérifiez que Fuseki est accessible et que le dataset `ecotourism` existe :
- Allez sur http://localhost:3030/
- Le dataset `/ecotourism` doit être listé

### Recréer le dataset

```powershell
python setup_fuseki.py
```

## 📚 Ressources supplémentaires

- **Collections Postman** : Utilisez `eco-tourism-api.postman_collection.json` et `ai-postman-collection.json`
- **Tests** : Exécutez `python test_all_postman.py` pour tester tous les endpoints
- **Ontologie** : Fichier `untitled-ontology-13` contient les définitions RDF

## 🎯 Exemples d'usage complet

### Scénario : Créer un voyage écologique complet

```powershell
# 1. Créer un touriste
Invoke-WebRequest -Uri "http://localhost:8000/auth/register" `
  -Method POST `
  -Body '{"nom":"Sophie Martin","email":"sophie@example.com","password":"voyage2024","age":32,"nationalite":"France","type":"touriste"}' `
  -ContentType "application/json"

# 2. Créer un hébergement
Invoke-WebRequest -Uri "http://localhost:8000/hebergement" `
  -Method POST `
  -Body '{"nom":"Eco Resort Tozeur","type":"Resort","prix":180.0,"nb_chambres":20,"niveau_eco":"Platinum"}' `
  -ContentType "application/json"

# 3. Créer une activité
Invoke-WebRequest -Uri "http://localhost:8000/activite" `
  -Method POST `
  -Body '{"nom":"Safari oasis du Sahara","difficulte":"Moyen","duree_heures":6,"prix":85.0}' `
  -ContentType "application/json"

# 4. Créer un transport vert
Invoke-WebRequest -Uri "http://localhost:8000/transport" `
  -Method POST `
  -Body '{"nom":"Calèche traditionnelle","type":"Hippomobile","emission_co2_per_km":0.0}' `
  -ContentType "application/json"

# 5. Lister tout pour vérifier
Invoke-WebRequest -Uri "http://localhost:8000/touriste"
Invoke-WebRequest -Uri "http://localhost:8000/hebergement"
Invoke-WebRequest -Uri "http://localhost:8000/activite"
Invoke-WebRequest -Uri "http://localhost:8000/transport"
```

---

**Bon voyage écologique ! 🌱✈️**
