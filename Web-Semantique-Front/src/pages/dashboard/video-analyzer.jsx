import React, { useState, useRef, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Typography,
  Button,
  Spinner,
  Progress,
  Alert,
  Chip,
  IconButton
} from "@material-tailwind/react";
import {
  VideoCameraIcon,
  StopIcon,
  ArrowUpTrayIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon
} from "@heroicons/react/24/solid";
import { PlayIcon } from "@heroicons/react/24/outline";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function VideoAnalyzer() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [videoURL, setVideoURL] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);
  const [userMessage, setUserMessage] = useState('');

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Request camera and microphone permissions
  const requestPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setHasPermission(true);
      setError(null);
    } catch (err) {
      console.error('Error accessing media devices:', err);
      setError('Impossible d\'accéder à la caméra/microphone. Veuillez autoriser l\'accès.');
      setHasPermission(false);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setHasPermission(false);
  };

  // Start recording
  const startRecording = async () => {
    if (!streamRef.current) {
      await requestPermissions();
      if (!streamRef.current) return;
    }

    chunksRef.current = [];
    setRecordedBlob(null);
    setVideoURL(null);
    setAnalysisResult(null);
    setRecordingTime(0);

    try {
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setVideoURL(url);
        
        // Stop camera after recording
        stopCamera();
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setError(null);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Erreur lors du démarrage de l\'enregistrement');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // Upload and analyze video
  const analyzeVideo = async () => {
    if (!recordedBlob) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('video', recordedBlob, 'recording.webm');
      if (userMessage.trim()) {
        formData.append('message', userMessage.trim());
      }

      const response = await fetch(`${API_BASE_URL}/ai/analyze-video`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Analysis result received:', data);
      console.log('Has error?', !!data.error);
      console.log('Has vibe_analysis?', !!data.vibe_analysis);
      console.log('Has event_recommendations?', !!data.event_recommendations);
      setAnalysisResult(data);
    } catch (err) {
      console.error('Error analyzing video:', err);
      setError(`Erreur lors de l'analyse: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Reset everything
  const reset = () => {
    setRecordedBlob(null);
    setVideoURL(null);
    setAnalysisResult(null);
    setError(null);
    setRecordingTime(0);
    setUserMessage('');
    stopCamera();
  };

  // Format recording time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="mt-12">
      <Card>
        <CardHeader color="blue-gray" className="relative h-16 flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <SparklesIcon className="h-6 w-6 text-white" />
            <Typography variant="h5" color="white">
              Analyseur Vidéo AI - Détection d'Ambiance
            </Typography>
          </div>
        </CardHeader>
        <CardBody>
          <Typography color="gray" className="mb-6">
            Enregistrez une vidéo avec audio pour que l'IA Aisalhi analyse l'ambiance et vous recommande des événements similaires.
          </Typography>

          {/* Error Alert */}
          {error && (
            <Alert color="red" icon={<ExclamationTriangleIcon className="h-6 w-6" />} className="mb-4">
              {error}
            </Alert>
          )}

          {/* Video Preview / Recording */}
          <div className="mb-6">
            <Card className="bg-gray-900 overflow-hidden">
              <CardBody className="p-0">
                {!videoURL ? (
                  <div className="relative aspect-video bg-black">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    {!hasPermission && !isRecording && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <Typography color="white" className="text-center">
                          Cliquez sur "Démarrer l'enregistrement" pour commencer
                        </Typography>
                      </div>
                    )}
                    {isRecording && (
                      <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500 px-3 py-1 rounded-full animate-pulse">
                        <div className="w-3 h-3 bg-white rounded-full" />
                        <Typography color="white" className="font-bold">
                          REC {formatTime(recordingTime)}
                        </Typography>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative aspect-video">
                    <video
                      src={videoURL}
                      controls
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Recording Controls */}
          <div className="flex flex-wrap gap-3 mb-6">
            {!isRecording && !recordedBlob && (
              <Button
                color="green"
                size="lg"
                className="flex items-center gap-2"
                onClick={startRecording}
              >
                <VideoCameraIcon className="h-5 w-5" />
                Démarrer l'enregistrement
              </Button>
            )}

            {isRecording && (
              <Button
                color="red"
                size="lg"
                className="flex items-center gap-2"
                onClick={stopRecording}
              >
                <StopIcon className="h-5 w-5" />
                Arrêter ({formatTime(recordingTime)})
              </Button>
            )}

            {recordedBlob && !isAnalyzing && (
              <>
                <Button
                  color="blue"
                  size="lg"
                  className="flex items-center gap-2"
                  onClick={analyzeVideo}
                >
                  <SparklesIcon className="h-5 w-5" />
                  Analyser avec l'IA
                </Button>
                <Button
                  color="gray"
                  size="lg"
                  variant="outlined"
                  className="flex items-center gap-2"
                  onClick={reset}
                >
                  <XMarkIcon className="h-5 w-5" />
                  Recommencer
                </Button>
              </>
            )}
          </div>

          {/* Optional User Message */}
          {recordedBlob && !isAnalyzing && !analysisResult && (
            <div className="mb-6">
              <Typography color="gray" className="mb-2 font-medium">
                Message optionnel (décrivez ce que vous recherchez) :
              </Typography>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Ex: Je cherche des événements festifs en pleine nature avec de la musique..."
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
              />
            </div>
          )}

          {/* Analysis Progress */}
          {isAnalyzing && (
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <Spinner className="h-6 w-6" />
                <Typography color="blue" className="font-medium">
                  Analyse en cours avec l'IA Aisalhi...
                </Typography>
              </div>
              <Progress value={100} color="blue" className="animate-pulse" />
              <Typography color="gray" className="text-sm mt-2">
                L'IA analyse la vidéo et l'audio pour détecter l'ambiance et recommander des événements...
              </Typography>
            </div>
          )}

          {/* Analysis Results */}
          {analysisResult && (
            <div className="space-y-6">
              {/* Error in Results */}
              {analysisResult.error && (
                <Alert color="amber" className="mb-4">
                  <div>
                    <Typography variant="h6" className="mb-2">Information</Typography>
                    <Typography>{analysisResult.error}</Typography>
                    {analysisResult.technical_details && (
                      <Typography className="text-xs mt-2 opacity-70">
                        {analysisResult.technical_details}
                      </Typography>
                    )}
                  </div>
                </Alert>
              )}

              {/* Vibe Analysis */}
              {analysisResult.vibe_analysis && (
                <Card className="border border-blue-100 bg-blue-50">
                  <CardBody>
                    <Typography variant="h6" color="blue-gray" className="mb-4 flex items-center gap-2">
                      <CheckCircleIcon className="h-6 w-6 text-blue-500" />
                      Analyse de l'ambiance
                    </Typography>

                    {analysisResult.vibe_analysis.mood && (
                      <div className="mb-4">
                        <Typography color="gray" className="text-sm font-medium mb-2">
                          Ambiance détectée :
                        </Typography>
                        <Chip
                          value={analysisResult.vibe_analysis.mood}
                          color="blue"
                          size="lg"
                          className="capitalize"
                        />
                      </div>
                    )}

                    {analysisResult.vibe_analysis.keywords && analysisResult.vibe_analysis.keywords.length > 0 && (
                      <div className="mb-4">
                        <Typography color="gray" className="text-sm font-medium mb-2">
                          Mots-clés :
                        </Typography>
                        <div className="flex flex-wrap gap-2">
                          {analysisResult.vibe_analysis.keywords.map((keyword, idx) => (
                            <Chip key={idx} value={keyword} variant="outlined" color="blue" />
                          ))}
                        </div>
                      </div>
                    )}

                    {analysisResult.vibe_analysis.visual_description && (
                      <div className="mb-4">
                        <Typography color="gray" className="text-sm font-medium mb-2">
                          Description visuelle :
                        </Typography>
                        <Typography color="blue-gray">
                          {analysisResult.vibe_analysis.visual_description}
                        </Typography>
                      </div>
                    )}

                    {analysisResult.vibe_analysis.audio_description && (
                      <div className="mb-4">
                        <Typography color="gray" className="text-sm font-medium mb-2">
                          Description audio :
                        </Typography>
                        <Typography color="blue-gray">
                          {analysisResult.vibe_analysis.audio_description}
                        </Typography>
                      </div>
                    )}

                    {analysisResult.vibe_analysis.atmosphere && (
                      <div>
                        <Typography color="gray" className="text-sm font-medium mb-2">
                          Atmosphère générale :
                        </Typography>
                        <Typography color="blue-gray">
                          {analysisResult.vibe_analysis.atmosphere}
                        </Typography>
                      </div>
                    )}
                  </CardBody>
                </Card>
              )}

              {/* Event Recommendations */}
              {analysisResult.event_recommendations && analysisResult.event_recommendations.length > 0 && (
                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-4 flex items-center gap-2">
                    <SparklesIcon className="h-6 w-6 text-green-500" />
                    Événements recommandés ({analysisResult.event_recommendations.length})
                  </Typography>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysisResult.event_recommendations.map((event, idx) => (
                      <Card key={idx} className="border border-green-100 hover:shadow-lg transition-shadow">
                        <CardBody>
                          <div className="flex justify-between items-start mb-3">
                            <Typography variant="h6" color="blue-gray" className="flex-1">
                              {event.event_name || event.name}
                            </Typography>
                            {event.match_score && (
                              <Chip
                                value={`${event.match_score}%`}
                                color={event.match_score >= 80 ? 'green' : event.match_score >= 60 ? 'yellow' : 'orange'}
                                size="sm"
                              />
                            )}
                          </div>

                          {event.event_type && (
                            <Typography color="gray" className="text-sm mb-2">
                              Type : <span className="font-medium">{event.event_type}</span>
                            </Typography>
                          )}

                          {event.description && (
                            <Typography color="blue-gray" className="text-sm mb-3">
                              {event.description}
                            </Typography>
                          )}

                          {event.why_similar && (
                            <div className="bg-green-50 p-3 rounded-lg">
                              <Typography color="green" className="text-xs font-medium mb-1">
                                Pourquoi cette recommandation :
                              </Typography>
                              <Typography color="blue-gray" className="text-sm">
                                {event.why_similar || event.reason}
                              </Typography>
                            </div>
                          )}

                          {(event.date || event.location) && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              {event.date && (
                                <Typography color="gray" className="text-xs">
                                  📅 {event.date}
                                </Typography>
                              )}
                              {event.location && (
                                <Typography color="gray" className="text-xs">
                                  📍 {event.location}
                                </Typography>
                              )}
                            </div>
                          )}
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Confidence Score */}
              {analysisResult.confidence_score && (
                <div className="mt-4">
                  <Typography color="gray" className="text-sm mb-2">
                    Niveau de confiance de l'analyse :
                  </Typography>
                  <Progress
                    value={analysisResult.confidence_score}
                    color={analysisResult.confidence_score >= 80 ? 'green' : 'orange'}
                    label={`${analysisResult.confidence_score}%`}
                  />
                </div>
              )}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default VideoAnalyzer;
