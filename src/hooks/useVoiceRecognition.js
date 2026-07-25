import { useCallback, useEffect, useRef, useState } from "react";

const SpeechRecognitionAPI =
  typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

const FATAL_ERRORS = new Set(["not-allowed", "audio-capture", "service-not-allowed"]);

export function useVoiceRecognition({ lang = "es-CO" } = {}) {
  const [listening, setListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const onResultRef = useRef(null);
  const finalTranscriptRef = useRef("");
  const manualStopRef = useRef(true);

  const isSupported = !!SpeechRecognitionAPI;

  const createRecognition = useCallback(() => {
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscriptRef.current = `${finalTranscriptRef.current} ${result[0].transcript}`.trim();
        } else {
          interimText += result[0].transcript;
        }
      }
      setInterimTranscript(interimText);
    };

    recognition.onerror = (event) => {
      if (FATAL_ERRORS.has(event.error)) {
        // Don't auto-restart on permission/hardware errors — surface and stop.
        manualStopRef.current = true;
        setError(event.error);
      } else if (event.error !== "no-speech" && event.error !== "aborted") {
        setError(event.error);
      }
    };

    recognition.onend = () => {
      if (!manualStopRef.current) {
        // Chrome frequently ends the session on its own after a few seconds
        // even with continuous:true. Restart transparently so the mic stays
        // "on" from the user's perspective until they press stop themselves.
        try {
          recognition.start();
          return;
        } catch {
          // fall through and finalize below
        }
      }
      setListening(false);
      setInterimTranscript("");
      const finalText = finalTranscriptRef.current.trim();
      finalTranscriptRef.current = "";
      if (finalText) onResultRef.current?.(finalText);
    };

    return recognition;
  }, [lang]);

  const start = useCallback((onResult) => {
    if (!isSupported || listening) return;
    onResultRef.current = onResult;
    finalTranscriptRef.current = "";
    manualStopRef.current = false;
    setError(null);
    setInterimTranscript("");
    const recognition = createRecognition();
    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }, [isSupported, listening, createRecognition]);

  const stop = useCallback(() => {
    manualStopRef.current = true;
    recognitionRef.current?.stop();
  }, []);

  useEffect(() => () => {
    manualStopRef.current = true;
    recognitionRef.current?.abort();
  }, []);

  return { isSupported, listening, interimTranscript, error, start, stop };
}
