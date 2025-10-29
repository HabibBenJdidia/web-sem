import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Typography,
  Button,
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
  Alert,
  Chip,
} from '@material-tailwind/react';
import {
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  LightBulbIcon,
  ChartBarIcon,
  InformationCircleIcon,
  VideoCameraIcon,
} from '@heroicons/react/24/solid';
import AISalhiChat from '@/components/AISalhiChat';
import AISalhiRecommendations from '@/components/AISalhiRecommendations';
import AISalhiVideoAnalyzer from '@/components/AISalhiVideoAnalyzer';
import AISalhiService from '@/services/aisalhi.service';

/**
 * AISalhi Dashboard Page
 * Main interface for interacting with AISalhi AI Assistant
 */
export function AISalhiDashboard() {
  const [activeTab, setActiveTab] = useState("chat");
  const [helpInfo, setHelpInfo] = useState(null);
  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalRecommendations: 0,
  });

  useEffect(() => {
    loadHelpInfo();
    loadStats();
  }, []);

  const loadHelpInfo = async () => {
    try {
      const info = await AISalhiService.getHelp();
      setHelpInfo(info);
    } catch (error) {
      console.error('Error loading help info:', error);
    }
  };

  const loadStats = () => {
    // Load from localStorage
    const questions = parseInt(localStorage.getItem('aisalhi_questions') || '0');
    const recommendations = parseInt(localStorage.getItem('aisalhi_recommendations') || '0');
    setStats({
      totalQuestions: questions,
      totalRecommendations: recommendations,
    });
  };

  const handleRecommendationsReceived = () => {
    const newCount = stats.totalRecommendations + 1;
    localStorage.setItem('aisalhi_recommendations', newCount.toString());
    setStats({ ...stats, totalRecommendations: newCount });
  };

  const tabs = [
    {
      label: 'Chat',
      value: 'chat',
      icon: ChatBubbleLeftRightIcon,
      desc: 'Conversation interactive avec AISalhi',
    },
    {
      label: 'Vidéo',
      value: 'video',
      icon: VideoCameraIcon,
      desc: 'Analysez des vidéos pour des recommandations',
    },
    {
      label: 'Recommandations',
      value: 'recommendations',
      icon: SparklesIcon,
      desc: 'Obtenez des recommandations personnalisées',
    },
    {
      label: 'Insights',
      value: 'insights',
      icon: LightBulbIcon,
      desc: 'Analyse et statistiques',
    },
    {
      label: 'À Propos',
      value: 'about',
      icon: InformationCircleIcon,
      desc: 'Capacités et fonctionnalités',
    },
  ];

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <SparklesIcon className="h-10 w-10 text-green-500" />
          <div>
            <Typography variant="h3" color="blue-gray">
              AISalhi - Assistant IA
            </Typography>
            <Typography variant="small" color="gray">
              Votre guide intelligent pour l'éco-tourisme
            </Typography>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Card>
            <CardBody className="flex items-center gap-3">
              <div className="rounded-full bg-green-50 p-3">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <Typography variant="small" color="gray">
                  Questions Posées
                </Typography>
                <Typography variant="h5" color="blue-gray">
                  {stats.totalQuestions}
                </Typography>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-center gap-3">
              <div className="rounded-full bg-blue-50 p-3">
                <SparklesIcon className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <Typography variant="small" color="gray">
                  Recommandations
                </Typography>
                <Typography variant="h5" color="blue-gray">
                  {stats.totalRecommendations}
                </Typography>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-center gap-3">
              <div className="rounded-full bg-purple-50 p-3">
                <LightBulbIcon className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <Typography variant="small" color="gray">
                  Capacités IA
                </Typography>
                <Typography variant="h5" color="blue-gray">
                  {helpInfo?.capabilities?.length || 6}
                </Typography>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-center gap-3">
              <div className="rounded-full bg-orange-50 p-3">
                <ChartBarIcon className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <Typography variant="small" color="gray">
                  Statut
                </Typography>
                <Chip value="En Ligne" color="green" size="sm" />
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Main Content - Tabs */}
      <Card>
        <Tabs value={String(activeTab)} onChange={(val) => setActiveTab(String(val))}>
          <TabsHeader>
            {tabs.map(({ label, value, icon: Icon }) => (
              <Tab key={value} value={value}>
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5" />
                  <span className="hidden md:inline">{label}</span>
                </div>
              </Tab>
            ))}
          </TabsHeader>

          <TabsBody>
            {/* Chat Tab */}
            <TabPanel value="chat" className="p-4">
              <AISalhiChat />
            </TabPanel>

            {/* Video Analyzer Tab */}
            <TabPanel value="video" className="p-4">
              <AISalhiVideoAnalyzer />
            </TabPanel>

            {/* Recommendations Tab */}
            <TabPanel value="recommendations" className="p-4">
              <AISalhiRecommendations 
                onRecommendationsReceived={handleRecommendationsReceived}
              />
            </TabPanel>

            {/* Insights Tab */}
            <TabPanel value="insights" className="p-4">
              <div className="space-y-6">
                <Typography variant="h5" color="blue-gray">
                  Insights & Analyse
                </Typography>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardBody>
                      <Typography variant="h6" color="blue-gray" className="mb-3">
                        Questions Fréquentes
                      </Typography>
                      <div className="space-y-2">
                        <Button 
                          variant="text" 
                          size="sm" 
                          fullWidth 
                          className="justify-start"
                          onClick={() => setActiveTab('chat')}
                        >
                          Combien de certifications disponibles ?
                        </Button>
                        <Button 
                          variant="text" 
                          size="sm" 
                          fullWidth 
                          className="justify-start"
                          onClick={() => setActiveTab('chat')}
                        >
                          Quels sont les événements à venir ?
                        </Button>
                        <Button 
                          variant="text" 
                          size="sm" 
                          fullWidth 
                          className="justify-start"
                          onClick={() => setActiveTab('chat')}
                        >
                          Activités écologiques recommandées
                        </Button>
                      </div>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardBody>
                      <Typography variant="h6" color="blue-gray" className="mb-3">
                        Utilisation
                      </Typography>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <Typography variant="small" color="gray">
                            Chat Messages
                          </Typography>
                          <Chip value={stats.totalQuestions} size="sm" color="blue" />
                        </div>
                        <div className="flex justify-between items-center">
                          <Typography variant="small" color="gray">
                            Recommandations
                          </Typography>
                          <Chip value={stats.totalRecommendations} size="sm" color="green" />
                        </div>
                        <div className="flex justify-between items-center">
                          <Typography variant="small" color="gray">
                            Taux de Satisfaction
                          </Typography>
                          <Chip value="98%" size="sm" color="green" />
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </div>

                <Alert color="blue" icon={<LightBulbIcon className="h-5 w-5" />}>
                  <Typography variant="small">
                    <strong>Astuce :</strong> Utilisez le chat pour poser des questions en langage naturel. 
                    AISalhi peut comprendre et répondre à des requêtes complexes sur l'éco-tourisme.
                  </Typography>
                </Alert>
              </div>
            </TabPanel>

            {/* About Tab */}
            <TabPanel value="about" className="p-4">
              <div className="space-y-6">
                <div>
                  <Typography variant="h5" color="blue-gray" className="mb-2">
                    {helpInfo?.name || 'AISalhi - Assistant IA'}
                  </Typography>
                  <Typography color="gray">
                    {helpInfo?.description || 'Assistant intelligent pour l\'éco-tourisme'}
                  </Typography>
                </div>

                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-3">
                    Capacités
                  </Typography>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(helpInfo?.capabilities || []).map((capability, index) => (
                      <div key={index} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                        <SparklesIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <Typography variant="small">{capability}</Typography>
                      </div>
                    ))}
                  </div>
                </div>

                <Alert color="green" icon={<InformationCircleIcon className="h-5 w-5" />}>
                  <Typography variant="small">
                    AISalhi utilise une technologie d'IA avancée pour fournir des recommandations personnalisées 
                    et des réponses intelligentes basées sur notre base de connaissances sémantique d'éco-tourisme.
                  </Typography>
                </Alert>

                <Card className="bg-green-50">
                  <CardBody>
                    <Typography variant="h6" color="green" className="mb-2">
                      Comment utiliser AISalhi ?
                    </Typography>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• <strong>Chat :</strong> Posez des questions en langage naturel</li>
                      <li>• <strong>Recommandations :</strong> Obtenez des suggestions personnalisées</li>
                      <li>• <strong>Recherche :</strong> Trouvez des informations spécifiques</li>
                      <li>• <strong>Comparaison :</strong> Comparez des options d'éco-tourisme</li>
                    </ul>
                  </CardBody>
                </Card>
              </div>
            </TabPanel>
          </TabsBody>
        </Tabs>
      </Card>
    </div>
  );
}

export default AISalhiDashboard;
