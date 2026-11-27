import React, { useEffect, useRef, useState } from 'react';
import {
  AlertOctagon,
  BookOpen,
  Mic,
  MicOff,
  RotateCcw,
  Send,
  ShieldCheck,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type {
  ChatMessage,
  HouseholdProfile,
  LocalityAirData,
  SafetyRuleResult,
} from '../types/vayu';
import { evaluateSafetyRules } from '../utils/aqiEngine';

interface VayuChatViewProps {
  locality: LocalityAirData;
  profile: HouseholdProfile;
  safety: SafetyRuleResult;
}

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<ArrayLike<SpeechRecognitionAlternativeLike>>;
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

const STARTER_PROMPTS = [
  {
    label: 'Safe window to open bedroom windows today?',
    hi: 'आज बेडरूम की खिड़कियाँ खोलने का सबसे सुरक्षित समय क्या है?',
  },
  {
    label: 'How do I make a ₹2,000 DIY air filter for my child?',
    hi: 'बच्चे के कमरे के लिए कम खर्च में DIY एयर फ़िल्टर कैसे बनाएँ?',
  },
  {
    label: 'Do snake plants purify winter smog indoors?',
    hi: 'क्या स्नेक प्लांट्स घर के अंदर स्मॉग साफ कर सकते हैं?',
  },
  {
    label: 'My child is wheezing and breathless right now',
    hi: 'मेरे बच्चे की सांस फूल रही है और घरघराहट हो रही है',
  },
];

function renderInlineFormatting(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={idx} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

function FormattedReply({ content }: { content: string }) {
  const lines = content.split('\n');
  return (
    <div className="space-y-1.5">
      {lines.map((rawLine, idx) => {
        const line = rawLine.trim();
        if (!line) return <div key={idx} className="h-1" />;
        const bulletMatch = line.match(/^[-*•]\s+(.*)$/);
        if (bulletMatch) {
          return (
            <div key={idx} className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#357249] dark:bg-[#B9E45A] shrink-0" />
              <span>{renderInlineFormatting(bulletMatch[1])}</span>
            </div>
          );
        }
        return <p key={idx}>{renderInlineFormatting(line)}</p>;
      })}
    </div>
  );
}

function buildWelcomeMessage(locality: LocalityAirData, isHi: boolean): ChatMessage {
  return {
    id: 'welcome',
    role: 'assistant',
    timestamp: 'Now',
    content: isHi
      ? `नमस्ते! मैं Vayu Pulse सहायक हूँ। ${locality.localityHi} में अभी बाहरी PM2.5 ${locality.outdoorPm25} µg/m³ है। आप वेंटिलेशन समय, कम-खर्च इनडोर हैक्स, मास्क या स्कूल सुरक्षा के बारे में पूछ सकते हैं।`
      : `Hi! I’m Vayu Pulse. Outdoor PM2.5 in ${locality.locality} is currently ${locality.outdoorPm25} µg/m³ (Indoor ${locality.indoorPm25} µg/m³). Ask me about safe ventilation windows, low-cost filtration, mask sizing, or cleaner commutes — every tip is grounded in WHO/CPCB/EPA guidelines and deterministic safety thresholds.`,
    citations: ['CPCB NAQI India', 'WHO 2021 AQG'],
    confidence: 'Deterministic Context Loaded',
  };
}

export const VayuChatView: React.FC<VayuChatViewProps> = ({
  locality,
  profile,
  safety,
}) => {
  const isHi = profile.language === 'hi';
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    buildWelcomeMessage(locality, isHi),
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [activeRedFlagBanner, setActiveRedFlagBanner] = useState<string | null>(null);
  const [lastUserPrompt, setLastUserPrompt] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const feedEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMessages((prev) =>
      prev.map((m) => (m.id === 'welcome' ? buildWelcomeMessage(locality, isHi) : m))
    );
  }, [locality, isHi]);

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: profile.lowBandwidth ? 'auto' : 'smooth' });
  }, [messages, loading, profile.lowBandwidth]);

  const toggleVoiceInput = () => {
    const win = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRec) {
      setMessages((prev) => [
        ...prev,
        {
          id: `voice-err-${Date.now()}`,
          role: 'assistant',
          timestamp: 'Just now',
          content:
            'Browser Speech-to-Text is unavailable in this browser. You can type your question directly in English or Hindi.',
          isError: true,
        },
      ]);
      return;
    }

    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRec();
    recognition.lang = isHi ? 'hi-IN' : 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      const transcript = event.results?.[0]?.[0]?.transcript ?? '';
      if (transcript) {
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      }
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  };

  const toggleReadAloud = (msg: ChatMessage) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (speakingId === msg.id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(msg.content.replace(/\*\*/g, ''));
    utterance.lang = isHi ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.98;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    setSpeakingId(msg.id);
    window.speechSynthesis.speak(utterance);
  };

  const sendMessage = async (textOverride?: string, isRetry = false) => {
    const trimmed = (textOverride ?? input).trim();
    if (!trimmed || loading) return;

    setLastUserPrompt(trimmed);

    // Immediate 0ms client-side deterministic clinical red-flag check before LLM call
    const localSafety = evaluateSafetyRules(locality, profile, trimmed);
    if (localSafety.redFlagMessage) {
      setActiveRedFlagBanner(localSafety.redFlagMessage);
    }

    let nextHistory: ChatMessage[];
    if (isRetry) {
      // Remove trailing error bubble before retrying
      nextHistory = messages.filter((m, idx) => !(idx === messages.length - 1 && m.isError));
      setMessages(nextHistory);
    } else {
      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: trimmed,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      nextHistory = [...messages, userMsg];
      setMessages(nextHistory);
      setInput('');
    }
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          cityId: locality.id,
          profile,
          history: nextHistory
            .filter((m) => !m.isError)
            .slice(-6)
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const rawText = await res.text();
      let data: {
        reply?: string;
        error?: string;
        citations?: string[];
        confidence?: string;
        safety?: {
          redFlagMessage?: string | null;
          deterministicRulesApplied?: string[];
        };
      } = {};

      if (rawText) {
        try {
          data = JSON.parse(rawText);
        } catch {
          data = {
            error:
              res.status === 504
                ? 'The AI service timed out. Please tap Retry in a moment.'
                : `Vayu AI server returned an unexpected response (HTTP ${res.status}). Please tap Retry.`,
          };
        }
      }

      if (!res.ok || !data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            content:
              data.error ||
              'Unable to reach Vayu AI service right now. Deterministic safety guidance remains active above.',
            safetyNotice: data.safety?.redFlagMessage ?? localSafety.redFlagMessage,
            deterministicSummary: localSafety.deterministicRulesApplied,
            isError: true,
          },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: data.reply!,
          citations: data.citations ?? ['CPCB NAQI India', 'WHO 2021 AQG'],
          safetyNotice: data.safety?.redFlagMessage ?? localSafety.redFlagMessage,
          deterministicSummary:
            data.safety?.deterministicRulesApplied ?? localSafety.deterministicRulesApplied,
          confidence: data.confidence ?? 'High (Rules + Verified RAG)',
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `net-err-${Date.now()}`,
          role: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content:
            'Network request failed (offline or server unreachable). Your deterministic local safety rules remain active.',
          safetyNotice: localSafety.redFlagMessage,
          deterministicSummary: localSafety.deterministicRulesApplied,
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-[#121F17] dark:text-[#F2F7F3]">
            {isHi ? 'Vayu AI सहायक (टेक्स्ट + वॉइस)' : 'Vayu AI Assistant (Text & Voice)'}
          </h2>
          <p className="mt-1 text-sm text-[#58635B] dark:text-[#96A299]">
            Grounded in WHO/CPCB/EPA guidelines · Deterministic safety rules run before every AI reply.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 text-xs text-[#245A32] dark:text-[#B9E45A] font-medium">
          <ShieldCheck className="w-4 h-4" />
          <span>Not a medical diagnostic tool · Emergency India: 108 / 112</span>
        </div>
      </div>

      {/* Deterministic Context Strip */}
      <div className="rounded-[20px] bg-white dark:bg-[#142019] border border-[#DCE4D7] dark:border-[#24372C] px-4 py-3 text-xs text-[#3C4B41] dark:text-[#B6C7BC] flex flex-wrap items-center justify-between gap-2">
        <span>
          <strong>Active Rules:</strong> {safety.maskGuidance}
        </span>
        <span className="font-mono tabular-nums text-[#245A32] dark:text-[#B9E45A] font-medium">
          Ventilation: {locality.safeVentilationWindow}
        </span>
      </div>

      {/* Immediate 0ms Deterministic Clinical Escalation Banner */}
      {activeRedFlagBanner && (
        <div
          role="alert"
          className="rounded-[20px] bg-[#6C317A] text-white p-4 flex items-start gap-3 text-xs sm:text-sm leading-relaxed"
        >
          <AlertOctagon className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold">Immediate Clinical Safety Escalation (Rule Triggered)</div>
            <p className="text-white/95">{activeRedFlagBanner}</p>
          </div>
        </div>
      )}

      {/* Chat Container */}
      <div className="rounded-[26px] bg-white dark:bg-[#142019] border border-[#DCE4D7] dark:border-[#24372C] flex flex-col min-h-[480px] max-h-[640px] shadow-sm">
        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg, idx) => {
            const isLastError = msg.isError && idx === messages.length - 1 && !!lastUserPrompt;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                {/* Un-overridable Deterministic Medical Escalation Banner */}
                {msg.safetyNotice && (
                  <div
                    role="alert"
                    className="mb-2 max-w-2xl rounded-2xl bg-[#6C317A] text-white p-3.5 flex items-start gap-2.5 text-xs leading-relaxed"
                  >
                    <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold">Deterministic Clinical Safety Escalation</div>
                      <p className="mt-0.5 text-white/95">{msg.safetyNotice}</p>
                    </div>
                  </div>
                )}

                <div
                  data-role={msg.role}
                  className={`max-w-2xl rounded-[20px] px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#112018] text-white dark:bg-[#B9E45A] dark:text-[#101D15] font-medium'
                      : msg.isError
                      ? 'bg-[#FDF2F2] dark:bg-[#2A171A] border border-[#E5B4B4] dark:border-[#5C2B31] text-[#7A1D1D] dark:text-[#F4B8B8]'
                      : 'bg-[#F2F6EE] dark:bg-[#1B2C22] text-[#142119] dark:text-[#ECF2EE]'
                  }`}
                >
                  {msg.role === 'assistant' && !msg.isError ? (
                    <FormattedReply content={msg.content} />
                  ) : (
                    <span className="whitespace-pre-wrap">{msg.content}</span>
                  )}

                  {isLastError && (
                    <div className="mt-2.5">
                      <button
                        type="button"
                        onClick={() => sendMessage(lastUserPrompt!, true)}
                        disabled={loading}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#112018] text-[#B9E45A] px-3 py-1.5 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        {isHi ? 'पुनः प्रयास करें' : 'Retry'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Citations + TTS Audio Readback */}
                <div className="mt-1.5 flex flex-wrap items-center gap-3 px-1 text-[11px] text-[#647067] dark:text-[#8A968D]">
                  <span>{msg.timestamp}</span>
                  {msg.citations && msg.citations.length > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {msg.citations.join(' · ')}
                    </span>
                  )}
                  {msg.confidence && <span>{msg.confidence}</span>}
                  {msg.role === 'assistant' && !msg.isError && (
                    <button
                      type="button"
                      onClick={() => toggleReadAloud(msg)}
                      aria-label={speakingId === msg.id ? 'Stop reading message aloud' : 'Read message aloud'}
                      className="inline-flex items-center gap-1 text-[#245A32] dark:text-[#B9E45A] hover:underline cursor-pointer"
                    >
                      {speakingId === msg.id ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5" /> Stop
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" /> Listen
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-[#5E6A61] dark:text-[#8E9B92] px-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[#7BB54B] animate-pulse" />
              Checking deterministic safety thresholds & grounding answer...
            </div>
          )}
          <div ref={feedEndRef} />
        </div>

        {/* Starter Prompts */}
        <div className="px-4 py-2.5 border-t border-[#E6ECE2] dark:border-[#24372C] flex items-center gap-2 overflow-x-auto">
          {STARTER_PROMPTS.map((sp) => (
            <button
              key={sp.label}
              type="button"
              onClick={() => sendMessage(isHi ? sp.hi : sp.label)}
              disabled={loading}
              className="rounded-full border border-[#D4DDD1] dark:border-[#2C4134] px-3 py-1.5 text-xs text-[#2B3B31] dark:text-[#C5D5CA] hover:bg-[#EFF5EA] dark:hover:bg-[#1E3126] whitespace-nowrap shrink-0 cursor-pointer transition-colors disabled:opacity-50"
            >
              {isHi ? sp.hi : sp.label}
            </button>
          ))}
        </div>

        {/* Composer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="p-3.5 border-t border-[#E6ECE2] dark:border-[#24372C] flex items-center gap-2.5"
        >
          <button
            type="button"
            onClick={toggleVoiceInput}
            aria-label={listening ? 'Stop voice input' : 'Start voice input'}
            className={`min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
              listening
                ? 'bg-[#6C317A] text-white'
                : 'bg-[#EFF4EB] dark:bg-[#1C2D23] text-[#1D2D22] dark:text-[#DCE7DF] hover:bg-[#E1ECE0] dark:hover:bg-[#253A2E]'
            }`}
          >
            {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <label htmlFor="vayu-chat-input" className="sr-only">
            Ask Vayu Pulse a question
          </label>
          <input
            id="vayu-chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isHi
                ? 'हवा, मास्क, वेंटिलेशन या कम-खर्च उपाय पूछें...'
                : 'Ask about ventilation timing, DIY filters, masks, or school safety...'
            }
            className="flex-1 min-h-[44px] rounded-full bg-[#F4F7F1] dark:bg-[#0F1913] border border-[#D7E0D3] dark:border-[#24372C] px-4 text-sm text-[#121F17] dark:text-[#F2F7F3] placeholder:text-[#76837A] focus:outline-none focus:border-[#7BB54B]"
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Send question"
            className="min-h-[44px] px-5 rounded-full bg-[#B9E45A] text-[#101D15] text-xs font-bold inline-flex items-center gap-1.5 hover:bg-[#C6EC72] disabled:opacity-45 transition-colors cursor-pointer shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isHi ? 'भेजें' : 'Send'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
