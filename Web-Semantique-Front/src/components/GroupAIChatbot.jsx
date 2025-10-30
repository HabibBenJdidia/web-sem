import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardBody,
  Button,
  Typography,
  IconButton,
  Spinner,
} from "@material-tailwind/react";
import {
  PaperAirplaneIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/solid";
import api from "@/services/api";

export function GroupAIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Bonjour! Je suis **GroupAI**, votre assistant écotourisme. Je peux vous aider à chercher:\n\n• Destinations et Hébergements\n• Restaurants et Produits Locaux\n• Transports et Utilisateurs\n• Événements et Certifications\n• Activités et Zones Naturelles\n• Empreinte Carbone et Énergies Renouvelables\n\nPosez-moi une question!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const response = await api.groupAIChat(userMessage);
      
      if (response.success) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: response.response },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Désolé, une erreur s'est produite: ${response.error || "Erreur inconnue"}`,
          },
        ]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Désolé, je n'ai pas pu traiter votre demande. Veuillez réessayer.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      await api.groupAIReset();
      setMessages([
        {
          role: "assistant",
          content: "Conversation réinitialisée. Comment puis-je vous aider?",
        },
      ]);
    } catch (error) {
      console.error("Error resetting chat:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessage = (content) => {
    // Simple markdown formatting
    let formatted = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
    
    return <div dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          color="purple"
          className="rounded-full shadow-lg flex items-center gap-2"
          onClick={() => setIsOpen(true)}
        >
          <ChatBubbleLeftRightIcon className="h-6 w-6" />
          GroupAI
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96">
      <Card className="shadow-2xl">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-t-xl flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
            <Typography variant="h6" color="white">
              GroupAI
            </Typography>
          </div>
          <div className="flex gap-2">
            <IconButton
              size="sm"
              variant="text"
              color="white"
              onClick={handleReset}
            >
              <ArrowPathIcon className="h-5 w-5" />
            </IconButton>
            <IconButton
              size="sm"
              variant="text"
              color="white"
              onClick={() => setIsOpen(false)}
            >
              <XMarkIcon className="h-5 w-5" />
            </IconButton>
          </div>
        </div>

        <CardBody className="p-4 h-96 overflow-y-auto flex flex-col gap-3">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  msg.role === "user"
                    ? "bg-purple-500 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <Typography variant="small" className="whitespace-pre-wrap">
                  {formatMessage(msg.content)}
                </Typography>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-lg">
                <Spinner className="h-4 w-4" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardBody>

        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Posez votre question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <IconButton
              color="purple"
              onClick={handleSend}
              disabled={loading || !input.trim()}
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </IconButton>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default GroupAIChatbot;

