"use client";
import React, { useState, useRef, useEffect } from "react";
import { User, Bot, Volume2, VolumeX } from "lucide-react";
import ReactMarkdown from "react-markdown";
// --- NEW: Import the libraries ---
import { remark } from 'remark';
import strip from 'strip-markdown';

interface ChatMessageProps {
  message: {
    id: number;
    content: string;
    role: "user" | "assistant";
    createdAt: string;
  };
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === "user";
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (speechUtteranceRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (!isUser && message.content && message.content.trim() !== '') {
      const timer = setTimeout(() => {
        speakMessage();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [message.id, message.content, isUser, voices]);

  const speakMessage = () => {
    if (!message.content || isUser) return;
    window.speechSynthesis.cancel();
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsSpeaking(true);
      return;
    }

    // --- MODIFIED: Create a plain-text version of the message ---
    const plainText = String(remark().use(strip).processSync(message.content)).trim();
    
    // Pass the clean, plain text to the speech engine
    const utterance = new SpeechSynthesisUtterance(plainText);
    speechUtteranceRef.current = utterance;

    if (voices.length > 0) {
      let selectedVoice = voices.find(voice => voice.name === 'Microsoft Ravi - English (India)');
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => voice.lang === 'en-IN');
      }
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }
    
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    utterance.onpause = () => {
      setIsPaused(true);
    };
    utterance.onresume = () => {
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const pauseSpeaking = () => {
    if (isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
    }
  };

  // The rest of your component's JSX remains the same
  return (
    <div className={`flex gap-3 p-4 ${isUser ? "bg-gray-50" : "bg-white"}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? "bg-blue-500" : "bg-green-500"
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm text-gray-700">
            {isUser ? "You" : "Carex Ai"}
          </span>
          <span className="text-xs text-gray-500">
            {new Date(message.createdAt).toLocaleTimeString()}
          </span>
          {!isUser && (
            <div className="flex items-center gap-1 ml-auto">
              <button
                onClick={isSpeaking ? (isPaused ? speakMessage : pauseSpeaking) : speakMessage}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                title={isSpeaking ? (isPaused ? "Resume" : "Pause") : "Speak"}
              >
                {isSpeaking ? (
                  isPaused ? <Volume2 className="w-3 h-3 text-gray-500" /> : <VolumeX className="w-3 h-3 text-gray-500" />
                ) : (
                  <Volume2 className="w-3 h-3 text-gray-500" />
                )}
              </button>
              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                  title="Stop"
                >
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                </button>
              )}
            </div>
          )}
        </div>
        
        <div className="text-gray-800 whitespace-pre-wrap">
          <ReactMarkdown>
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;