import { useCallback, useEffect, useRef, useState } from "react";

const SpeechRecognitionAPI =
  typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

export function useVoiceRecognition({ lang = "es-CO" } = {}) {
  const [listening, setListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const onResultRef = useRef(null);

  const isSupported = !!SpeechRecognitionAPI;

  useEffect(() => {
    if (!isSupported) return;
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) finalText += result[0].transcript;
        else interimText += result[0].transcript;
      }
      setInterimTranscript(interimText);
      if (finalText.trim()) onResultRef.current?.(finalText.trim());
    };

    recognition.onerror = (event) => {
      setError(event.error);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
      setInterimTranscript("");
    };

    recognitionRef.current = recognition;
    return () => recognition.abort();
  }, [isSupported, lang]);

  const start = useCallback((onResult) => {
    if (!recognitionRef.current || listening) return;
    onResultRef.current = onResult;
    setError(null);
    setInterimTranscript("");
    try {
      recognitionRef.current.start();
      setListening(true);
    } catch {
      // start() throws if already started; ignore
    }
  }, [listening]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  return { isSupported, listening, interimTranscript, error, start, stop };
}
