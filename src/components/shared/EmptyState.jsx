import React from "react";
import { Button } from "@/components/ui/button";

export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center bg-card rounded-3xl border border-border">
      {Icon && (
        <div className="w-20 h-20 rounded-3xl tile-violet flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
          <Icon className="w-9 h-9 text-white" />
        </div>
      )}
      <h3 className="font-heading font-extrabold text-lg text-foreground mb-1">{title}</h3>
      {description && <p className="text-sm text-muted-foreground max-w-sm mb-5">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction} size="lg">{actionLabel}</Button>
      )}
    </div>
  );
}
