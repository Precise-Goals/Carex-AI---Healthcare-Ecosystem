"use client"
import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import axios from 'axios';

interface TextToSpeechProps {
  text: string;
  voiceId?: string;
  doctorId?: number;
  onSpeakingStart: () => void;
  onSpeakingEnd: () => void;
  onError: (error: string) => void;
}

export interface TextToSpeechRef {
  stopSpeaking: () => void;
}

const TextToSpeech = forwardRef<TextToSpeechRef, TextToSpeechProps>(({
  text,
  voiceId = 'will',
  doctorId,
  onSpeakingStart,
  onSpeakingEnd,
  onError
}, ref) => {
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const currentAudioUrlRef = useRef<string | null>(null);
  const [pendingText, setPendingText] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const previousTextRef = useRef<string>("");
  const speechSynthesisUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [murfApiCalls, setMurfApiCalls] = useState<number>(0);
  const [browserTtsFallbacks, setBrowserTtsFallbacks] = useState<number>(0);
  const [lastApiError, setLastApiError] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    stopSpeaking: () => {
      stopSpeaking();
    }
  }));

  useEffect(() => {
    if (!audioElementRef.current) {
      audioElementRef.current = new Audio();

      audioElementRef.current.addEventListener('ended', handleAudioEnded);
      audioElementRef.current.addEventListener('error', handleAudioError);
    }

    return () => {
      stopSpeaking();

      // Clean up any remaining audio URL
      if (currentAudioUrlRef.current) {
        URL.revokeObjectURL(currentAudioUrlRef.current);
        currentAudioUrlRef.current = null;
      }

      if (audioElementRef.current) {
        audioElementRef.current.removeEventListener('ended', handleAudioEnded);
        audioElementRef.current.removeEventListener('error', handleAudioError);
        audioElementRef.current = null;
      }
    };
  }, []);


  useEffect(() => {
    if (text && text.trim() !== '' && text !== previousTextRef.current) {
      previousTextRef.current = text;

      if (isProcessing) {

        setPendingText(text);
      } else {
        processText(text);
      }
    }
  }, [text]);


  useEffect(() => {
    if (!isProcessing && pendingText) {
      const textToProcess = pendingText;
      setPendingText("");
      processText(textToProcess);
    }
  }, [isProcessing, pendingText]);


  useEffect(() => {
    console.log(`TTS Stats - Murf API calls: ${murfApiCalls}, Browser TTS fallbacks: ${browserTtsFallbacks}`);
    if (lastApiError) {
      console.error(`Last API error: ${lastApiError}`);
    }
  }, [murfApiCalls, browserTtsFallbacks, lastApiError]);

  const handleAudioEnded = () => {
    setIsProcessing(false);
    onSpeakingEnd();
  };

  const handleAudioError = (e: Event) => {
    const error = e as ErrorEvent;
    console.error("Audio playback error occurred", {
      error: error.error,
      message: error.message,
      filename: error.filename,
      lineno: error.lineno,
      colno: error.colno,
      audioSrc: audioElementRef.current?.src
    });
    
    // Clean up the audio URL on error
    if (currentAudioUrlRef.current) {
      URL.revokeObjectURL(currentAudioUrlRef.current);
      currentAudioUrlRef.current = null;
    }
    
    setIsProcessing(false);
    onSpeakingEnd();
  };


  const stopSpeaking = () => {
    console.log("TextToSpeech: stopSpeaking called");

    // Clean up the current audio URL
    if (currentAudioUrlRef.current) {
      URL.revokeObjectURL(currentAudioUrlRef.current);
      currentAudioUrlRef.current = null;
    }

    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.src = '';
    }


    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }


    if (speechSynthesisUtteranceRef.current) {
      speechSynthesisUtteranceRef.current = null;
    }


    setIsProcessing(false);
    setPendingText("");
  };

  const processText = async (textToSpeak: string) => {
    if (!textToSpeak || textToSpeak.trim() === '') return;


    stopSpeaking();

    setIsProcessing(true);
    onSpeakingStart();

    try {
      console.log(`Calling Murf AI TTS API with doctorId: ${doctorId}, voiceId: ${voiceId}`);


      const response = await axios.post('/api/tts', {
        text: textToSpeak,
        voiceId: voiceId,
        doctorId: doctorId
      }, {
        responseType: 'blob',
        validateStatus: function (status) {
          return status < 500; 
        }
      });


      const contentType = response.headers['content-type'];

      if (contentType && contentType.includes('audio')) {

        console.log("Murf AI TTS successful - received audio data");
        setMurfApiCalls(prev => prev + 1);
        setLastApiError(null);

        const audioUrl = URL.createObjectURL(response.data);

        // Clean up previous URL if it exists
        if (currentAudioUrlRef.current) {
          URL.revokeObjectURL(currentAudioUrlRef.current);
        }
        currentAudioUrlRef.current = audioUrl;

        if (audioElementRef.current) {
          audioElementRef.current.src = audioUrl;

          try {
            await audioElementRef.current.play();

          } catch (error) {
            console.error("Error playing Murf AI audio:", error);
            setIsProcessing(false);
            onSpeakingEnd();


            await playBrowserTTS(textToSpeak);
          }
        }
      } else {

        console.log("Murf AI TTS returned JSON response - likely fallback to browser TTS");

        try {

          const jsonData = await response.data.text();
          const jsonResponse = JSON.parse(jsonData);


          if (jsonResponse.error) {
            setLastApiError(jsonResponse.error);
            if (jsonResponse.errorDetails) {
              console.error("Detailed Murf API error:", jsonResponse.errorDetails);
            }
          }

          if (jsonResponse.useBrowserTTS) {
            console.log("Murf API requested browser TTS fallback");
            setBrowserTtsFallbacks(prev => prev + 1);
            await playBrowserTTS(jsonResponse.text || textToSpeak);
          } else {
            throw new Error("Invalid TTS response");
          }
        } catch (error) {
          console.error("Error parsing TTS response:", error);
          setBrowserTtsFallbacks(prev => prev + 1);
          await playBrowserTTS(textToSpeak);
        }
      }
    } catch (error) {
      console.error("Failed to generate speech with Murf AI:", error);
      setIsProcessing(false);
      onError("Failed to generate speech. Using browser TTS instead.");
      setBrowserTtsFallbacks(prev => prev + 1);


      await playBrowserTTS(textToSpeak);
    }
  };


  const playBrowserTTS = (textToSpeak: string): Promise<void> => {
    console.log("Using browser's built-in TTS as fallback");

    return new Promise((resolve) => {
      try {
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(textToSpeak);
          speechSynthesisUtteranceRef.current = utterance;

          utterance.rate = 1.0;
          utterance.pitch = 1.0;
          utterance.volume = 1.0;

          utterance.onend = () => {
            console.log("Browser TTS speech ended");
            setIsProcessing(false);
            onSpeakingEnd();
            resolve();
          };

          utterance.onerror = (event) => {
            console.error("Browser TTS error:", event);
            setIsProcessing(false);
            onSpeakingEnd();
            resolve();
          };

          window.speechSynthesis.speak(utterance);
        } else {
          console.warn("SpeechSynthesis not supported in this browser");
          setIsProcessing(false);
          onSpeakingEnd();
          resolve();
        }
      } catch (error) {
        console.error("Error with browser TTS:", error);
        setIsProcessing(false);
        onSpeakingEnd();
        resolve();
      }
    });
  };

  return null; 
});

TextToSpeech.displayName = 'TextToSpeech';

export default TextToSpeech; 