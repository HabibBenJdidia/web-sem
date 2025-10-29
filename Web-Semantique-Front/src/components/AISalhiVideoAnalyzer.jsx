import { useState, useRef, useEffect } from 'react';
import {
  Card,
  CardBody,
  Button,
  Typography,
  Progress,
  Alert,
  Chip,
} from '@material-tailwind/react';
import {
  VideoCameraIcon,
  StopIcon,
  ArrowUpTrayIcon,
  XMarkIcon,
  SparklesIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/solid';

/**
 * AISalhi Video Analyzer Component
 * Allows users to record video with audio and get AI-powered event recommendations
 */
export function AISalhiVideoAnalyzer() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [videoURL, setVideoURL] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      stopCamera();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError(`Erreur d'accès à la caméra: ${err.message}`);
      console.error('Camera access error:', err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const startRecording = async () => {
    try {
      await startCamera();
      
      if (!streamRef.current) {
        setError("Impossible de démarrer la caméra");
        return;
      }

      chunksRef.current = [];
      
      const options = {
        mimeType: 'video/webm;codecs=vp8,opus',
        videoBitsPerSecond: 2500000
      };

      mediaRecorderRef.current = new MediaRecorder(streamRef.current, options);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setRecordedBlob(blob);
        setVideoURL(URL.createObjectURL(blob));
        stopCamera();
      };

      mediaRecorderRef.current.start(100);
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      setError(`Erreur d'enregistrement: ${err.message}`);
      console.error('Recording error:', err);
    }
  };

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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetRecording = () => {
    setRecordedBlob(null);
    setVideoURL(null);
    setAnalysis(null);
    setError(null);
    setUploadProgress(0);
    setRecordingTime(0);
  };

  const uploadAndAnalyze = async () => {
    if (!recordedBlob) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('video', recordedBlob, 'recording.webm');

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('http://localhost:8000/ai/analyze-video', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      console.log('[VideoAnalyzer] Raw API response:', result);
      
      // If vibe_analysis is a string (JSON inside), parse it
      let vibeAnalysis = result.vibe_analysis || result.vibe;
      
      // Check if vibeAnalysis itself contains the full JSON structure
      if (vibeAnalysis && typeof vibeAnalysis === 'object' && vibeAnalysis.vibe_analysis) {
        // It's nested, extract the inner vibe_analysis
        vibeAnalysis = vibeAnalysis.vibe_analysis;
      }
      
      if (typeof vibeAnalysis === 'string') {
        try {
          // Remove markdown code blocks if present
          let cleanedString = vibeAnalysis.trim();
          if (cleanedString.startsWith('```json')) {
            cleanedString = cleanedString.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
          } else if (cleanedString.startsWith('```')) {
            cleanedString = cleanedString.replace(/```\n?/g, '');
          }
          
          // Try to parse
          const parsed = JSON.parse(cleanedString);
          
          // If parsed contains vibe_analysis, extract it
          if (parsed.vibe_analysis) {
            vibeAnalysis = parsed.vibe_analysis;
          } else {
            vibeAnalysis = parsed;
          }
        } catch (e) {
          console.warn('Could not parse vibe_analysis string:', e);
          // Keep it as string, will be displayed in full_analysis
        }
      }
      
      console.log('[VideoAnalyzer] Processed vibe:', vibeAnalysis);
      
      // Map API response to expected format
      const mappedResult = {
        ...result,
        vibe: vibeAnalysis,
        recommendations: result.event_recommendations || result.recommendations || []
      };
      
      console.log('[VideoAnalyzer] Final mapped result:', mappedResult);
      
      setAnalysis(mappedResult);

    } catch (err) {
      setError(`Erreur d'analyse: ${err.message}`);
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardBody>
        <div className="flex items-center gap-3 mb-6">
          <VideoCameraIcon className="h-8 w-8 text-purple-500" />
          <div>
            <Typography variant="h5" color="blue-gray">
              Analyse Vidéo AISalhi
            </Typography>
            <Typography variant="small" color="gray">
              Enregistrez une vidéo pour obtenir des recommandations d'événements
            </Typography>
          </div>
        </div>

        {error && (
          <Alert color="red" className="mb-4" icon={<XMarkIcon className="h-5 w-5" />}>
            {error}
          </Alert>
        )}

        {/* Video Preview/Recording Area */}
        <div className="relative bg-gray-900 rounded-lg overflow-hidden mb-4" style={{ minHeight: '300px' }}>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ maxHeight: '500px' }}
          />
          
          {videoURL && !isRecording && (
            <video
              src={videoURL}
              controls
              className="w-full h-full object-cover"
              style={{ maxHeight: '500px' }}
            />
          )}

          {isRecording && (
            <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full flex items-center gap-2 animate-pulse">
              <div className="w-3 h-3 bg-white rounded-full"></div>
              <Typography variant="small" className="font-bold">
                REC {formatTime(recordingTime)}
              </Typography>
            </div>
          )}

          {!isRecording && !videoURL && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <VideoCameraIcon className="h-16 w-16 mx-auto mb-2 opacity-50" />
                <Typography variant="small">
                  Appuyez sur "Démarrer l'enregistrement"
                </Typography>
              </div>
            </div>
          )}
        </div>

        {/* Recording Controls */}
        <div className="flex gap-2 mb-4">
          {!isRecording && !videoURL && (
            <Button
              color="purple"
              size="lg"
              className="flex-1"
              onClick={startRecording}
              disabled={isUploading}
            >
              <VideoCameraIcon className="h-5 w-5 mr-2" />
              Démarrer l'enregistrement
            </Button>
          )}

          {isRecording && (
            <Button
              color="red"
              size="lg"
              className="flex-1"
              onClick={stopRecording}
            >
              <StopIcon className="h-5 w-5 mr-2" />
              Arrêter l'enregistrement
            </Button>
          )}

          {videoURL && !isUploading && (
            <>
              <Button
                color="green"
                size="lg"
                className="flex-1"
                onClick={uploadAndAnalyze}
              >
                <SparklesIcon className="h-5 w-5 mr-2" />
                Analyser avec AISalhi
              </Button>
              <Button
                variant="outlined"
                size="lg"
                onClick={resetRecording}
              >
                <XMarkIcon className="h-5 w-5 mr-2" />
                Recommencer
              </Button>
            </>
          )}
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <Typography variant="small" color="blue-gray">
                Envoi et analyse en cours...
              </Typography>
              <Typography variant="small" color="blue-gray">
                {uploadProgress}%
              </Typography>
            </div>
            <Progress value={uploadProgress} color="purple" />
          </div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-4">
            <Alert color="green" icon={<CheckCircleIcon className="h-5 w-5" />}>
              Analyse terminée avec succès !
            </Alert>

            {/* Detected Vibe */}
            {analysis.vibe && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <Typography variant="h6" color="purple" className="mb-3">
                  🎭 Ambiance Détectée
                </Typography>
                
                {/* Mood and Energy */}
                <div className="mb-3">
                  {analysis.vibe.mood && (
                    <Chip value={`Ambiance: ${analysis.vibe.mood}`} color="purple" size="sm" className="mr-2 mb-2" />
                  )}
                  {analysis.vibe.energy_level && (
                    <Chip value={`Énergie: ${analysis.vibe.energy_level}`} color="deep-purple" size="sm" className="mb-2" />
                  )}
                </div>
                
                {/* Visual Description */}
                {analysis.vibe.visual_description && typeof analysis.vibe.visual_description === 'string' && !analysis.vibe.visual_description.includes('{') && (
                  <div className="mb-3 p-3 bg-white rounded border border-purple-200">
                    <Typography variant="small" className="font-bold text-purple-700 mb-1">
                      👁️ Description Visuelle
                    </Typography>
                    <Typography className="text-sm text-gray-700">
                      {analysis.vibe.visual_description}
                    </Typography>
                  </div>
                )}
                
                {/* Audio Description */}
                {analysis.vibe.audio_description && (
                  <div className="mb-3 p-3 bg-white rounded border border-purple-200">
                    <Typography variant="small" className="font-bold text-purple-700 mb-1">
                      🔊 Description Audio
                    </Typography>
                    <Typography className="text-sm text-gray-700">
                      {analysis.vibe.audio_description}
                    </Typography>
                  </div>
                )}
                
                {/* Atmosphere */}
                {analysis.vibe.atmosphere && (
                  <div className="mb-3 p-3 bg-white rounded border border-purple-200">
                    <Typography variant="small" className="font-bold text-purple-700 mb-1">
                      🌟 Atmosphère
                    </Typography>
                    <Typography className="text-sm text-gray-700">
                      {analysis.vibe.atmosphere}
                    </Typography>
                  </div>
                )}
                
                {/* Keywords */}
                {analysis.vibe.keywords && analysis.vibe.keywords.length > 0 && (
                  <div>
                    <Typography variant="small" className="font-bold text-purple-700 mb-2 block">
                      🏷️ Mots-clés détectés
                    </Typography>
                    <div className="flex flex-wrap gap-2">
                      {analysis.vibe.keywords.map((keyword, idx) => (
                        <Chip key={idx} value={keyword} color="blue" size="sm" variant="outlined" />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Emotions */}
                {analysis.vibe.emotions && analysis.vibe.emotions.length > 0 && (
                  <div className="mt-3">
                    <Typography variant="small" className="font-bold text-purple-700 mb-2 block">
                      😊 Émotions détectées
                    </Typography>
                    <div className="flex flex-wrap gap-2">
                      {analysis.vibe.emotions.map((emotion, idx) => (
                        <Chip key={idx} value={emotion} color="purple" size="sm" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Recommended Events */}
            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <div className="bg-green-50 p-4 rounded-lg">
                <Typography variant="h6" color="green" className="mb-3">
                  ✨ Événements Recommandés
                </Typography>
                <div className="space-y-3">
                  {analysis.recommendations.map((event, idx) => (
                    <div key={idx} className="bg-white p-3 rounded border border-green-200">
                      <Typography variant="h6" color="blue-gray">
                        {event.name || event.title}
                      </Typography>
                      {event.match_score && (
                        <Typography variant="small" color="green" className="font-bold">
                          Correspondance: {event.match_score}%
                        </Typography>
                      )}
                      {event.description && (
                        <Typography variant="small" className="mt-1">
                          {event.description}
                        </Typography>
                      )}
                      {event.reason && (
                        <Typography variant="small" color="gray" className="mt-1 italic">
                          💡 {event.reason}
                        </Typography>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Full Analysis */}
            {analysis.full_analysis && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <Typography variant="h6" color="blue" className="mb-2">
                  📊 Analyse Complète d'AISalhi
                </Typography>
                <Typography className="whitespace-pre-wrap text-sm">
                  {analysis.full_analysis}
                </Typography>
              </div>
            )}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <Typography variant="small" color="blue-gray" className="font-bold mb-2">
            💡 Comment ça marche ?
          </Typography>
          <ul className="text-sm space-y-1 text-gray-700">
            <li>• Enregistrez une vidéo de 10-60 secondes montrant votre ambiance/activité</li>
            <li>• AISalhi analyse les émotions, l'environnement et l'audio</li>
            <li>• Recevez des recommandations d'événements écologiques personnalisées</li>
            <li>• Plus la vidéo est expressive, plus les recommandations sont précises !</li>
          </ul>
        </div>
      </CardBody>
    </Card>
  );
}

export default AISalhiVideoAnalyzer;
