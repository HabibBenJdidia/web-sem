# Web Semantique - Eco-Tourism Platform

Plateforme de tourisme écologique basée sur le web sémantique avec intégration IA.

## 🚀 Configuration Rapide

### 1. Prérequis
- Python 3.10+
- Apache Jena Fuseki
- Node.js 18+ (pour le frontend)

### 2. Configuration Backend

#### Installation des dépendances
```bash
pip install -r requirements.txt
```

#### Configuration des variables d'environnement
Créez un fichier `.env` à la racine du projet (copiez `.env.example`):

```bash
cp .env.example .env
```

Puis éditez `.env` avec vos valeurs:

```env
# Fuseki Database
FUSEKI_URL=http://localhost:3030/ecotourism
FUSEKI_USER=admin
FUSEKI_PASSWORD=admin

# Gemini AI (REQUIS pour le chatbot transport)
GEMINI_API_KEY=votre_cle_api_ici

# Email (pour l'authentification)
MAIL_USERNAME=votre_email@gmail.com
MAIL_PASSWORD=votre_mot_de_passe_app
```

**🔑 Obtenir une clé API Gemini:**
1. Allez sur [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Connectez-vous avec votre compte Google
3. Créez une nouvelle clé API
4. Copiez-la dans votre fichier `.env`

### 3. Démarrage

#### Démarrer Fuseki
```bash
# Option 1: Docker
docker-compose up fuseki

# Option 2: Manuel
fuseki-server --mem /ecotourism
```

#### Charger l'ontologie
```bash
python load_ontology_to_fuseki.py
```

#### Démarrer le backend Flask
```bash
python app.py
```

Le serveur démarre sur `http://localhost:8000`

### 4. Frontend React

```bash
cd Web-Semantique-Front
npm install
npm run dev
```

Le frontend démarre sur `http://localhost:5173`

## 📚 Endpoints Principaux

### Authentification
- `POST /auth/register` - Inscription
- `POST /auth/login` - Connexion
- `GET /auth/profile` - Profil utilisateur

### Entités
- `GET/POST /touriste` - Gestion des touristes
- `GET/POST /guide` - Gestion des guides
- `GET/POST /transport` - Gestion des transports
- `GET/POST /activite` - Gestion des activités
- `GET/POST /hebergement` - Gestion des hébergements

### AI Chatbot (nécessite GEMINI_API_KEY)
- `POST /ai/chat` - Chat interactif
- `POST /ai/ask` - Question simple
- `POST /ai/recommend-activities` - Recommandations d'activités

### Transport & Emissions
- `GET /transport` - Liste tous les transports avec empreintes CO2
- `POST /transport/calculate-price` - Calculer le prix d'un trajet
- `POST /transport/compare-prices` - Comparer les prix

## 🤖 Chatbot Transport

Le chatbot transport utilise l'API Gemini pour:
- Répondre aux questions sur les catégories de transport
- Recommander des transports écologiques
- Calculer les émissions CO2
- Comparer les prix

**Si le chatbot ne fonctionne pas:**
- Vérifiez que `GEMINI_API_KEY` est défini dans `.env`
- Testez avec: `python -c "from config import GEMINI_API_KEY; print(GEMINI_API_KEY)"`
- Consultez les logs du backend Flask

## 🧪 Tests

```bash
# Test de l'authentification
python test_auth_complete.py

# Test de l'API
python test_api.py

# Test de l'IA
python test_ai_complete.py

# Test des transports
python test_empreinte_query.py
```

## 🌍 Architecture

```
web-sem/
├── ai/                    # Agent IA Gemini
├── models/                # Modèles ontologiques
├── Mangage/               # Gestionnaire SPARQL
├── Web-Semantique-Front/  # Frontend React
├── app.py                 # Backend Flask
├── config.py              # Configuration
├── auth_routes.py         # Routes d'authentification
├── email_service.py       # Service d'email
└── untitled-ontology-13   # Ontologie OWL/RDF
```

## 🔐 Sécurité

- **Ne jamais committer le fichier `.env`** (déjà dans `.gitignore`)
- Les mots de passe sont hashés avec SHA-256
- JWT pour l'authentification
- CORS activé pour le frontend

## 📝 Licence

Projet académique - Web Sémantique



