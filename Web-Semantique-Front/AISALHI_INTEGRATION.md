# 🤖 Intégration AISalhi dans le Frontend

## 📋 Vue d'Ensemble

AISalhi est maintenant intégré de manière professionnelle dans votre application React avec une architecture complète incluant :
- Service centralisé
- Composants réutilisables
- Page dashboard dédiée
- Widget compact pour intégration rapide

## 📁 Structure des Fichiers

```
src/
├── services/
│   └── aisalhi.service.js          # Service principal AISalhi
├── components/
│   ├── AISalhiChat.jsx             # Composant chat interactif
│   ├── AISalhiRecommendations.jsx  # Composant recommandations
│   └── AISalhiQuickWidget.jsx      # Widget compact
└── pages/
    └── dashboard/
        └── AISalhiDashboard.jsx     # Page dashboard complète
```

## 🚀 Utilisation

### 1. Service AISalhi

Le service expose toutes les fonctionnalités d'AISalhi :

```javascript
import AISalhiService from '@/services/aisalhi.service';

// Question simple
const response = await AISalhiService.ask("Combien de certifications?");
console.log(response.response);

// Chat interactif
const chatResponse = await AISalhiService.chat("Trouve des hôtels écologiques");

// Recommandations personnalisées
const recommendations = await AISalhiService.getRecommendations({
  age: 30,
  nationalite: 'FR',
  preferences: ['nature', 'randonnée'],
  budget: 150
});

// Score écologique
const ecoScore = await AISalhiService.getEcoScore('Hebergement', hotelUri);

// Requête SPARQL
const results = await AISalhiService.executeSPARQL(`
  PREFIX eco: <http://example.org/eco-tourism#>
  SELECT * WHERE { ?s a eco:Ville }
`);
```

### 2. Composant Chat

Intégrez le chat complet dans n'importe quelle page :

```jsx
import { AISalhiChat } from '@/components/AISalhiChat';

function MyPage() {
  return (
    <div>
      <h1>Ma Page</h1>
      <AISalhiChat />
    </div>
  );
}
```

### 3. Widget Recommandations

Obtenez des recommandations personnalisées :

```jsx
import { AISalhiRecommendations } from '@/components/AISalhiRecommendations';

function MyPage() {
  const handleRecommendations = (recommendations) => {
    console.log('Recommandations reçues:', recommendations);
  };

  return (
    <AISalhiRecommendations 
      onRecommendationsReceived={handleRecommendations}
    />
  );
}
```

### 4. Widget Rapide

Ajoutez un widget compact dans votre page d'accueil :

```jsx
import { AISalhiQuickWidget } from '@/components/AISalhiQuickWidget';

function Home() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div>Contenu principal</div>
      <div>
        <AISalhiQuickWidget /> {/* Widget AISalhi */}
      </div>
    </div>
  );
}
```

### 5. Page Dashboard Complète

Accessible via `/dashboard/aisalhi`, la page dashboard inclut :
- Chat interactif
- Recommandations personnalisées
- Insights et statistiques
- Informations sur les capacités

## 🎨 Personnalisation

### Modifier les Couleurs

Les composants utilisent Material Tailwind. Changez les couleurs :

```jsx
<Button color="blue">  {/* au lieu de green */}
<Card color="purple">
<Typography color="red">
```

### Ajouter des Actions Rapides

Dans `AISalhiChat.jsx`, modifiez le tableau `quickActions` :

```javascript
const quickActions = [
  { label: 'Ma Question', query: 'Texte de la question' },
  // Ajoutez vos propres actions
];
```

### Personnaliser les Préférences

Dans `AISalhiRecommendations.jsx`, modifiez `popularPreferences` :

```javascript
const popularPreferences = [
  'nature',
  'culture',
  // Ajoutez vos préférences
];
```

## 📊 Fonctionnalités Disponibles

### Service AISalhi (aisalhi.service.js)

| Méthode | Description | Paramètres |
|---------|-------------|------------|
| `ask(question)` | Question simple | `string` |
| `chat(message)` | Chat interactif | `string` |
| `executeSPARQL(query)` | Exécuter SPARQL | `string` |
| `getRecommendations(profile)` | Recommandations | `{age, nationalite, preferences, budget}` |
| `getEcoScore(type, uri)` | Score écologique | `string, string` |
| `resetChat()` | Réinitialiser session | - |
| `getHelp()` | Info sur AISalhi | - |

### Composants

| Composant | Description | Props |
|-----------|-------------|-------|
| `AISalhiChat` | Chat complet | - |
| `AISalhiRecommendations` | Recommandations | `onRecommendationsReceived(fn)` |
| `AISalhiQuickWidget` | Widget compact | - |
| `AISalhiDashboard` | Page complète | - |

## 🔧 Configuration

### Variables d'Environnement

Créez `.env` dans le dossier frontend :

```env
VITE_API_URL=http://localhost:8000
```

### Backend

Assurez-vous que votre backend est démarré :

```bash
# Avec Docker
docker-compose up -d

# Ou directement
python app.py
```

## 🎯 Exemples d'Intégration

### Exemple 1 : Page d'Accueil avec Widget

```jsx
// src/pages/dashboard/home.jsx
import { AISalhiQuickWidget } from '@/components/AISalhiQuickWidget';

export function Home() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        {/* Contenu principal */}
      </div>
      <div>
        <AISalhiQuickWidget />
      </div>
    </div>
  );
}
```

### Exemple 2 : Modal avec Chat

```jsx
import { Dialog } from '@material-tailwind/react';
import { AISalhiChat } from '@/components/AISalhiChat';

function MyComponent() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        Parler à AISalhi
      </Button>
      <Dialog open={open} handler={setOpen} size="xl">
        <AISalhiChat />
      </Dialog>
    </>
  );
}
```

### Exemple 3 : Recommandations dans Profil

```jsx
// src/pages/dashboard/profile.jsx
import { AISalhiRecommendations } from '@/components/AISalhiRecommendations';

export function Profile() {
  return (
    <div>
      <h1>Mon Profil</h1>
      <div className="mt-6">
        <h2>Recommandations pour vous</h2>
        <AISalhiRecommendations />
      </div>
    </div>
  );
}
```

## 🐛 Dépannage

### Erreur "Cannot connect to backend"
- Vérifiez que le backend est démarré sur le port 8000
- Vérifiez `VITE_API_URL` dans `.env`

### Erreur "No module named 'AISalhi'"
- Le backend n'a pas été mis à jour avec la nouvelle version AISalhi
- Reconstruisez l'image Docker : `docker-compose build --no-cache`

### Les réponses sont lentes
- Normal pour la première requête (chargement du modèle)
- Les requêtes suivantes sont plus rapides

## 📚 Documentation Complète

- **Backend** : Voir `AISALHI_README.md` à la racine du projet
- **API** : Voir `QUICKSTART_AISALHI.md` pour les exemples d'API
- **Migration** : Voir `MIGRATION_AISALHI.md` pour la migration depuis Gemini

## ✨ Prochaines Étapes

1. ✅ Service AISalhi créé
2. ✅ Composants React créés
3. ✅ Page dashboard ajoutée
4. ✅ Routes configurées
5. 🔄 Testez l'intégration
6. 🎨 Personnalisez selon vos besoins
7. 🚀 Déployez en production

## 🎉 C'est Prêt !

Accédez à `/dashboard/aisalhi` dans votre application pour voir AISalhi en action !
