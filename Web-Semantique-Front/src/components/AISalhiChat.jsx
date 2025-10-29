import React, { useState, useRef, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Typography,
  Avatar,
  IconButton,
  Spinner,
} from '@material-tailwind/react';
import {
  PaperAirplaneIcon,
  TrashIcon,
  SparklesIcon,
} from '@heroicons/react/24/solid';
import AISalhiService from '@/services/aisalhi.service';

/**
 * AISalhi Chat Component
 * Interactive chat interface with AISalhi AI Assistant
 */
export function AISalhiChat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'aisalhi',
      text: "Bonjour ! Je suis AISalhi, votre assistant d'éco-tourisme intelligent. Comment puis-je vous aider aujourd'hui ?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send message to AISalhi
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await AISalhiService.chat(inputMessage);
      
      const aiMessage = {
        id: Date.now() + 1,
        sender: 'aisalhi',
        text: response.response || response.answer || 'Désolé, je n\'ai pas pu traiter votre demande.',
        timestamp: new Date(),
        data: response.data,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      setError(err.message);
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'aisalhi',
        text: `Désolé, une erreur s'est produite : ${err.message}`,
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear chat history
  const handleClearChat = async () => {
    try {
      await AISalhiService.resetChat();
      setMessages([
        {
          id: 1,
          sender: 'aisalhi',
          text: "Session réinitialisée. Comment puis-je vous aider ?",
          timestamp: new Date(),
        },
      ]);
      setError(null);
    } catch (err) {
      setError('Impossible de réinitialiser la session');
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Quick action buttons
  const quickActions = [
    { label: 'Certifications disponibles', query: 'Quelles sont les certifications écologiques disponibles ?' },
    { label: 'Événements à venir', query: 'Quels sont les événements écologiques prévus ?' },
    { label: 'Activités nature', query: 'Recommande-moi des activités en pleine nature' },
    { label: 'Hébergements écologiques', query: 'Trouve-moi des hébergements écologiques' },
  ];

  return (
    <Card className="w-full h-[600px] flex flex-col">
      <CardHeader
        color="green"
        className="relative h-16 flex items-center justify-between px-6"
      >
        <div className="flex items-center gap-3">
          <Avatar
            src="https://ui-avatars.com/api/?name=AISalhi&background=4ade80&color=fff"
            alt="AISalhi"
            size="sm"
          />
          <div>
            <Typography variant="h6" color="white">
              AISalhi
            </Typography>
            <Typography variant="small" color="white" className="opacity-80">
              Assistant IA Éco-Tourisme
            </Typography>
          </div>
        </div>
        <IconButton
          variant="text"
          color="white"
          onClick={handleClearChat}
          title="Réinitialiser la conversation"
        >
          <TrashIcon className="h-5 w-5" />
        </IconButton>
      </CardHeader>

      <CardBody className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : message.isError
                    ? 'bg-red-100 text-red-800'
                    : 'bg-white text-gray-800 shadow-sm'
                }`}
              >
                {message.sender === 'aisalhi' && (
                  <div className="flex items-center gap-2 mb-1">
                    <SparklesIcon className="h-4 w-4 text-green-500" />
                    <Typography variant="small" className="font-semibold">
                      AISalhi
                    </Typography>
                  </div>
                )}
                <Typography variant="small" className="whitespace-pre-wrap">
                  {message.text}
                </Typography>
                <Typography variant="small" className="text-xs opacity-60 mt-1">
                  {message.timestamp.toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Typography>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <Spinner className="h-4 w-4" />
                  <Typography variant="small" color="gray">
                    AISalhi réfléchit...
                  </Typography>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {messages.length === 1 && !isLoading && (
          <div className="mt-6">
            <Typography variant="small" color="gray" className="mb-3">
              Questions rapides :
            </Typography>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outlined"
                  size="sm"
                  onClick={() => {
                    setInputMessage(action.query);
                  }}
                  className="text-xs"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardBody>

      {/* Error Display */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200">
          <Typography variant="small" color="red">
            ⚠️ {error}
          </Typography>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Posez votre question à AISalhi..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="flex-1"
            containerProps={{ className: 'min-w-0' }}
          />
          <Button
            color="green"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="flex items-center gap-2"
          >
            <PaperAirplaneIcon className="h-4 w-4" />
            Envoyer
          </Button>
        </div>
        <Typography variant="small" color="gray" className="mt-2 text-xs">
          💡 Astuce : Demandez des recommandations, des informations ou des comparaisons
        </Typography>
      </div>
    </Card>
  );
}

export default AISalhiChat;
