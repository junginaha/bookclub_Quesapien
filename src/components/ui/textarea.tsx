import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-xl border border-warm-200 bg-white px-4 py-3 text-sm",
          "text-warm-900 placeholder:text-warm-400 focus-visible:outline-none",
          "focus-visible:ring-2 focus-visible:ring-warm-300 focus-visible:border-warm-500",
          "disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all duration-200",
          "leading-relaxed",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
