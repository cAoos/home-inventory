import React from "react";

// On mobile the title lives in the layout's hero header, so only the actions show here.
export default function PageHeader({ title, description, children }) {
  return (
    <div className={`${children ? "flex" : "hidden lg:flex"} flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 lg:mb-6`}>
      <div className="hidden lg:block">
        <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-foreground">{title}</h1>
        {description && <p className="text-muted-foreground text-sm mt-1">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-2 flex-wrap justify-end">{children}</div>}
    </div>
  );
}
