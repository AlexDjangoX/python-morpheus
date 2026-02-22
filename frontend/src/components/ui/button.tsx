"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "border border-red-500/50 bg-gradient-to-r from-red-500 to-blue-500 text-white shadow-md hover:from-red-600 hover:to-blue-600 hover:shadow-lg active:scale-[0.98] dark:border-red-500/50 dark:from-red-600 dark:to-blue-600 dark:hover:from-red-500 dark:hover:to-blue-500",
        secondary:
          "border-2 border-border bg-muted/60 text-foreground hover:bg-muted hover:border-purple-300 dark:hover:border-purple-600",
        outline:
          "border-2 border-border bg-background hover:bg-muted dark:border-slate-700 dark:hover:bg-slate-800",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
