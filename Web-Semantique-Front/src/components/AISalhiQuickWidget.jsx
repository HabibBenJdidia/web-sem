import React, { useState } from 'react';
import {
  Card,
  CardBody,
  Input,
  Button,
  Typography,
  Avatar,
} from '@material-tailwind/react';
import {
  SparklesIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import AISalhiService from '@/services/aisalhi.service';

/**
 * AISalhi Quick Widget
 * Compact widget for quick questions - perfect for home/landing pages
 */
export function AISalhiQuickWidget() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAsk = async () => {
    if (!question.trim()) return;

    setIsLoading(true);
    try {
      const response = await AISalhiService.ask(question);
      setAnswer(response.response);
    } catch (error) {
      setAnswer(`Erreur: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    'Combien de certifications disponibles?',
    'Événements à venir?',
    'Activités écologiques?',
  ];

  return (
    <Card className="w-full">
      <CardBody className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar
              src="https://ui-avatars.com/api/?name=AISalhi&background=4ade80&color=fff"
              alt="AISalhi"
              size="sm"
            />
            <div>
              <Typography variant="h6" color="blue-gray">
                AISalhi
              </Typography>
              <Typography variant="small" color="gray">
                Posez-moi une question
              </Typography>
            </div>
          </div>
          <Link to="/dashboard/aisalhi">
            <Button size="sm" variant="text" color="green">
              Ouvrir
            </Button>
          </Link>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Votre question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAsk()}
            disabled={isLoading}
          />
          <Button
            color="green"
            onClick={handleAsk}
            disabled={!question.trim() || isLoading}
            className="flex items-center gap-1"
          >
            {isLoading ? (
              <SparklesIcon className="h-4 w-4 animate-spin" />
            ) : (
              <PaperAirplaneIcon className="h-4 w-4" />
            )}
          </Button>
        </div>

        {answer && (
          <div className="bg-green-50 p-3 rounded-lg">
            <Typography variant="small" className="text-gray-700">
              {answer}
            </Typography>
          </div>
        )}

        {!answer && (
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((q, idx) => (
              <Button
                key={idx}
                size="sm"
                variant="outlined"
                onClick={() => setQuestion(q)}
                className="text-xs"
              >
                {q}
              </Button>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

export default AISalhiQuickWidget;
