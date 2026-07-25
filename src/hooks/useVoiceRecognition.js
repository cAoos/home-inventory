import { useCallback, useEffect, useRef, useState } from "react";

const SpeechRecognitionAPI =
  typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

export function useVoiceRecognition({ lang = "es-CO" } = {}) {
  const [listening, setListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const onResultRef = useRef(null);
  const finalTranscriptRef = useRef("");

  const isSupported = !!SpeechRecognitionAPI;

  useEffect(() => {
    if (!isSupported) return;
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = lang;
    // continuous keeps the mic open across natural pauses in a spoken
    // command; without it, recognition ends after the first short pause
    // and cuts the rest of the sentence off.
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
      setError(event.error);
    };

    recognition.onend = () => {
      setListening(false);
      setInterimTranscript("");
      const finalText = finalTranscriptRef.current.trim();
      finalTranscriptRef.current = "";
      if (finalText) onResultRef.current?.(finalText);
    };

    recognitionRef.current = recognition;
    return () => recognition.abort();
  }, [isSupported, lang]);

  const start = useCallback((onResult) => {
    if (!recognitionRef.current || listening) return;
    onResultRef.current = onResult;
    finalTranscriptRef.current = "";
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
