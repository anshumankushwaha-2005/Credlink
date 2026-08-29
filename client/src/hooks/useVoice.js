import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Custom hook that records audio via browser MediaRecorder.
 * The output blob can then be uploaded to the backend server
 * to get transcribed via Groq Speech-to-Text Whisper API.
 */
export function useVoice() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const streamRef = useRef(null);

  // Check support for audio capturing
  useEffect(() => {
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      setIsSupported(false);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const startListening = useCallback(async () => {
    setError(null);
    setTranscript('');
    setAudioBlob(null);
    setDuration(0);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Determine supported mime type
      let options = { mimeType: 'audio/webm' };
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        options = { mimeType: 'audio/ogg' };
      }
      if (!MediaRecorder.isTypeSupported('audio/ogg')) {
        options = { mimeType: '' }; // fallback to default browser format
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mime = options.mimeType || mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mime });
        setAudioBlob(blob);
        setIsListening(false);
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        
        // Stop all track streams to release microphone hardware immediately
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(250); // collect data every 250ms chunks
      setIsListening(true);

      // Start elapsed duration timer
      timerIntervalRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Microphone access failed:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Microphone permission was denied. Please allow microphone access in settings.');
      } else {
        setError('Could not access microphone. Ensure recording device is connected.');
      }
      setIsListening(false);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setAudioBlob(null);
    setDuration(0);
    setError(null);
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    error,
    duration,
    audioBlob,
    startListening,
    stopListening,
    resetTranscript,
    setTranscript,
  };
}
