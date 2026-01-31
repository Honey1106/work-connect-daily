import { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useLanguage, Language } from '@/contexts/LanguageContext';

// Language codes for Web Speech API
const speechLanguageCodes: Record<Language, string> = {
  en: 'en-IN',
  te: 'te-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
};

interface VoiceInputProps {
  onResult: (text: string) => void;
  placeholder?: string;
  className?: string;
}

export function VoiceInput({ onResult, placeholder, className = '' }: VoiceInputProps) {
  const { language } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    // Check if Web Speech API is supported
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsSupported(false);
    }
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('Speech recognition not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = speechLanguageCodes[language];
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };

    recognition.onresult = (event: any) => {
      const result = event.results[0];
      const text = result[0].transcript;
      setTranscript(text);
      
      if (result.isFinal) {
        onResult(text);
        setIsListening(false);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, [language, onResult]);

  if (!isSupported) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={startListening}
      disabled={isListening}
      className={`flex items-center justify-center p-3 rounded-xl transition-all ${
        isListening 
          ? 'bg-destructive text-destructive-foreground animate-pulse' 
          : 'bg-primary text-primary-foreground hover:bg-primary/90'
      } ${className}`}
      title={placeholder}
    >
      {isListening ? (
        <Loader2 className="w-6 h-6 animate-spin" />
      ) : (
        <Mic className="w-6 h-6" />
      )}
    </button>
  );
}

// Larger voice button for main actions
interface VoiceButtonProps {
  onResult: (text: string) => void;
  label: string;
  sublabel?: string;
}

export function VoiceButton({ onResult, label, sublabel }: VoiceButtonProps) {
  const { language } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsSupported(false);
    }
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = speechLanguageCodes[language];
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };

    recognition.onresult = (event: any) => {
      const result = event.results[0];
      const text = result[0].transcript;
      setTranscript(text);
      
      if (result.isFinal) {
        onResult(text);
        setIsListening(false);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, [language, onResult]);

  if (!isSupported) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={startListening}
      disabled={isListening}
      className={`w-full flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all ${
        isListening 
          ? 'bg-destructive/10 border-destructive' 
          : 'bg-card border-border hover:border-primary'
      }`}
    >
      <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
        isListening 
          ? 'bg-destructive animate-pulse' 
          : 'bg-primary'
      }`}>
        {isListening ? (
          <MicOff className="w-8 h-8 text-destructive-foreground" />
        ) : (
          <Mic className="w-8 h-8 text-primary-foreground" />
        )}
      </div>
      
      <div className="text-center">
        <p className="font-semibold text-foreground">
          {isListening ? transcript || '...' : label}
        </p>
        {sublabel && !isListening && (
          <p className="text-sm text-muted-foreground">{sublabel}</p>
        )}
      </div>
    </button>
  );
}
