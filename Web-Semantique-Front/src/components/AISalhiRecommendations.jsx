import React, { useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Select,
  Option,
  Typography,
  Chip,
  Alert,
  Spinner,
} from '@material-tailwind/react';
import {
  SparklesIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  HeartIcon,
} from '@heroicons/react/24/solid';
import AISalhiService from '@/services/aisalhi.service';

/**
 * AISalhi Recommendations Widget
 * Get personalized activity recommendations based on user preferences
 */
export function AISalhiRecommendations({ onRecommendationsReceived }) {
  const [profile, setProfile] = useState({
    age: '',
    nationalite: '',
    preferences: [],
    budget: '',
  });

  const [currentPreference, setCurrentPreference] = useState('');
  const [recommendations, setRecommendations] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const popularPreferences = [
    'nature',
    'randonnée',
    'écologie',
    'culture',
    'gastronomie',
    'aventure',
    'détente',
    'photographie',
    'mer',
    'montagne',
  ];

  const handleAddPreference = () => {
    if (currentPreference && !profile.preferences.includes(currentPreference)) {
      setProfile({
        ...profile,
        preferences: [...profile.preferences, currentPreference],
      });
      setCurrentPreference('');
    }
  };

  const handleRemovePreference = (pref) => {
    setProfile({
      ...profile,
      preferences: profile.preferences.filter((p) => p !== pref),
    });
  };

  const handleGetRecommendations = async () => {
    // Validation
    if (!profile.age || !profile.nationalite || profile.preferences.length === 0 || !profile.budget) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await AISalhiService.getRecommendations({
        age: parseInt(profile.age),
        nationalite: profile.nationalite,
        preferences: profile.preferences,
        budget: parseFloat(profile.budget),
      });

      setRecommendations(response);
      
      if (onRecommendationsReceived) {
        onRecommendationsReceived(response);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setProfile({
      age: '',
      nationalite: '',
      preferences: [],
      budget: '',
    });
    setRecommendations(null);
    setError(null);
  };

  return (
    <Card className="w-full">
      <CardHeader
        color="green"
        className="relative h-16 flex items-center px-6"
      >
        <div className="flex items-center gap-2">
          <SparklesIcon className="h-6 w-6 text-white" />
          <Typography variant="h5" color="white">
            Recommandations Personnalisées
          </Typography>
        </div>
      </CardHeader>

      <CardBody className="space-y-6">
        {/* Profile Form */}
        {!recommendations && (
          <div className="space-y-4">
            <div>
              <Typography variant="small" color="gray" className="mb-2">
                Âge
              </Typography>
              <Input
                type="number"
                placeholder="Votre âge"
                value={profile.age}
                onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                icon={<Typography>ans</Typography>}
              />
            </div>

            <div>
              <Typography variant="small" color="gray" className="mb-2">
                Nationalité
              </Typography>
              <Select
                label="Sélectionnez votre pays"
                value={profile.nationalite}
                onChange={(value) => setProfile({ ...profile, nationalite: value })}
              >
                <Option value="TN">Tunisie</Option>
                <Option value="FR">France</Option>
                <Option value="DZ">Algérie</Option>
                <Option value="MA">Maroc</Option>
                <Option value="IT">Italie</Option>
                <Option value="ES">Espagne</Option>
                <Option value="DE">Allemagne</Option>
                <Option value="GB">Royaume-Uni</Option>
                <Option value="US">États-Unis</Option>
              </Select>
            </div>

            <div>
              <Typography variant="small" color="gray" className="mb-2">
                Budget (€/jour)
              </Typography>
              <Input
                type="number"
                placeholder="Budget quotidien"
                value={profile.budget}
                onChange={(e) => setProfile({ ...profile, budget: e.target.value })}
                icon={<CurrencyDollarIcon className="h-5 w-5" />}
              />
            </div>

            <div>
              <Typography variant="small" color="gray" className="mb-2">
                Préférences
              </Typography>
              <div className="flex gap-2 mb-3">
                <Input
                  placeholder="Ajoutez une préférence"
                  value={currentPreference}
                  onChange={(e) => setCurrentPreference(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddPreference()}
                />
                <Button
                  size="sm"
                  color="green"
                  onClick={handleAddPreference}
                  disabled={!currentPreference}
                >
                  Ajouter
                </Button>
              </div>

              {/* Selected Preferences */}
              {profile.preferences.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {profile.preferences.map((pref, index) => (
                    <Chip
                      key={index}
                      value={pref}
                      onClose={() => handleRemovePreference(pref)}
                      color="green"
                      icon={<HeartIcon />}
                    />
                  ))}
                </div>
              )}

              {/* Popular Preferences */}
              <Typography variant="small" color="gray" className="mb-2">
                Suggestions populaires :
              </Typography>
              <div className="flex flex-wrap gap-2">
                {popularPreferences.map((pref) => (
                  <Chip
                    key={pref}
                    value={pref}
                    onClick={() => {
                      if (!profile.preferences.includes(pref)) {
                        setProfile({
                          ...profile,
                          preferences: [...profile.preferences, pref],
                        });
                      }
                    }}
                    variant="outlined"
                    className="cursor-pointer hover:bg-green-50"
                  />
                ))}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <Alert color="red" className="text-sm">
                {error}
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                color="green"
                onClick={handleGetRecommendations}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Spinner className="h-4 w-4" />
                    Génération...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="h-5 w-5" />
                    Obtenir des Recommandations
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Recommendations Display */}
        {recommendations && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <SparklesIcon className="h-6 w-6" />
              <Typography variant="h6" color="green">
                Recommandations d'AISalhi
              </Typography>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              {(() => {
                // Fonction helper pour extraire du texte d'un objet
                const extractText = (obj) => {
                  if (typeof obj === 'string') return obj;
                  if (typeof obj !== 'object' || obj === null) return String(obj);
                  return obj.explanation || obj.name || obj.text || obj.description || JSON.stringify(obj, null, 2);
                };

                // Si recommendations est un tableau
                if (Array.isArray(recommendations)) {
                  return (
                    <div className="space-y-3">
                      {recommendations.map((rec, idx) => (
                        <div key={idx} className="bg-white p-3 rounded border border-green-200">
                          <Typography className="whitespace-pre-wrap">
                            {extractText(rec)}
                          </Typography>
                        </div>
                      ))}
                    </div>
                  );
                }

                // Si c'est un objet avec une propriété 'recommendations' qui est un tableau
                if (recommendations.recommendations && Array.isArray(recommendations.recommendations)) {
                  return (
                    <div className="space-y-3">
                      {recommendations.recommendations.map((rec, idx) => (
                        <div key={idx} className="bg-white p-3 rounded border border-green-200">
                          <Typography className="whitespace-pre-wrap">
                            {extractText(rec)}
                          </Typography>
                        </div>
                      ))}
                    </div>
                  );
                }

                // Si c'est un objet simple
                if (typeof recommendations === 'object') {
                  return (
                    <Typography className="whitespace-pre-wrap">
                      {extractText(recommendations)}
                    </Typography>
                  );
                }

                // Sinon, convertir en string
                return (
                  <Typography className="whitespace-pre-wrap">
                    {String(recommendations)}
                  </Typography>
                );
              })()}
            </div>

            {/* User Profile Summary */}
            <div className="border-t pt-4">
              <Typography variant="small" color="gray" className="mb-2">
                Votre profil :
              </Typography>
              <div className="flex flex-wrap gap-2">
                <Chip value={`${profile.age} ans`} size="sm" />
                <Chip value={profile.nationalite} size="sm" />
                <Chip value={`${profile.budget}€/jour`} size="sm" color="green" />
                {profile.preferences.map((pref, idx) => (
                  <Chip key={idx} value={pref} size="sm" color="blue" />
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button variant="outlined" onClick={handleReset} className="flex-1">
                Nouvelle Recherche
              </Button>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

export default AISalhiRecommendations;
