import React from "react";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVoiceRecognition } from "@/hooks/useVoiceRecognition";

export default function VoiceButton({ onResult, onError, lang = "es-CO" }) {
  const { isSupported, listening, interimTranscript, start, stop } = useVoiceRecognition({ lang });

  if (!isSupported) {
    return (
      <Button variant="outline" size="icon" disabled title="Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.">
        <MicOff className="w-4 h-4" />
      </Button>
    );
  }

  const handleClick = () => {
    if (listening) {
      stop();
      return;
    }
    start((transcript) => {
      try {
        onResult(transcript);
      } catch (e) {
        onError?.(e);
      }
    });
  };

  return (
    <div className="relative inline-flex items-center">
      <Button
        type="button"
        variant={listening ? "default" : "outline"}
        size="icon"
        onClick={handleClick}
        className={listening ? "animate-pulse" : ""}
        title={listening ? "Escuchando... clic para detener" : "Agregar por voz"}
      >
        <Mic className="w-4 h-4" />
      </Button>
      {listening && (
        <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-xs text-muted-foreground whitespace-nowrap bg-card border border-border rounded px-2 py-1 shadow-sm z-10">
          {interimTranscript || "Escuchando..."}
        </span>
      )}
    </div>
  );
}
