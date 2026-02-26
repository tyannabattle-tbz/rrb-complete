/**
 * Futuristic Design System Component
 * 
 * Provides reusable futuristic UI components with:
 * - Glassmorphism effects
 * - Neon glows and gradients
 * - Holographic animations
 * - AI-forward aesthetic
 */

import React from "react";
import { cn } from "@/lib/utils";

interface FuturisticCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: "cyan" | "magenta" | "none";
  holographic?: boolean;
}

export const FuturisticCard: React.FC<FuturisticCardProps> = ({
  children,
  className,
  glow = "cyan",
  holographic = false,
}) => {
  return (
    <div
      className={cn(
        "card-elegant",
        holographic && "holographic",
        glow === "cyan" && "neon-glow",
        glow === "magenta" && "neon-glow-magenta",
        className
      )}
    >
      {children}
    </div>
  );
};

interface FuturisticButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  glow?: boolean;
}

export const FuturisticButton: React.FC<FuturisticButtonProps> = ({
  variant = "primary",
  size = "md",
  glow = false,
  className,
  children,
  ...props
}) => {
  const baseClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const variantClasses = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    ghost: "btn-ghost",
  };

  return (
    <button
      className={cn(
        baseClasses[size],
        variantClasses[variant],
        glow && "animate-glow-pulse",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

interface FuturisticBadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "success" | "warning" | "error";
  className?: string;
  glow?: boolean;
}

export const FuturisticBadge: React.FC<FuturisticBadgeProps> = ({
  children,
  variant = "primary",
  className,
  glow = false,
}) => {
  const variantClasses = {
    primary: "badge-primary",
    success: "badge-success",
    warning: "badge-warning",
    error: "badge-error",
  };

  return (
    <span
      className={cn(
        variantClasses[variant],
        glow && "animate-glow-pulse",
        className
      )}
    >
      {children}
    </span>
  );
};

interface FuturisticHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const FuturisticHeader: React.FC<FuturisticHeaderProps> = ({
  title,
  subtitle,
  icon,
  className,
}) => {
  return (
    <div className={cn("mb-6 space-y-2", className)}>
      <div className="flex items-center gap-3">
        {icon && <div className="text-2xl animate-float">{icon}</div>}
        <h1 className="gradient-text text-3xl font-bold">{title}</h1>
      </div>
      {subtitle && (
        <p className="text-muted-foreground text-lg">{subtitle}</p>
      )}
    </div>
  );
};

interface FuturisticGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: "sm" | "md" | "lg";
  className?: string;
}

export const FuturisticGrid: React.FC<FuturisticGridProps> = ({
  children,
  columns = 2,
  gap = "md",
  className,
}) => {
  const colClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  const gapClasses = {
    sm: "gap-3",
    md: "gap-4",
    lg: "gap-6",
  };

  return (
    <div
      className={cn(
        "grid",
        colClasses[columns],
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
};

interface FuturisticMetricProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export const FuturisticMetric: React.FC<FuturisticMetricProps> = ({
  label,
  value,
  unit,
  icon,
  trend,
  className,
}) => {
  const trendColor = {
    up: "text-green-400",
    down: "text-red-400",
    neutral: "text-cyan-400",
  };

  return (
    <FuturisticCard glow="cyan" className={className}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {icon && <div className="text-cyan-400">{icon}</div>}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-cyan-400">{value}</span>
          {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
        </div>
        {trend && (
          <div className={cn("text-xs font-medium", trendColor[trend])}>
            {trend === "up" && "↑ Increasing"}
            {trend === "down" && "↓ Decreasing"}
            {trend === "neutral" && "→ Stable"}
          </div>
        )}
      </div>
    </FuturisticCard>
  );
};

interface FuturisticSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const FuturisticSection: React.FC<FuturisticSectionProps> = ({
  title,
  description,
  children,
  className,
}) => {
  return (
    <section className={cn("space-y-4", className)}>
      <div>
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <div className="glass-neon rounded-xl p-6">{children}</div>
    </section>
  );
};

interface FuturisticDividerProps {
  className?: string;
  animated?: boolean;
}

export const FuturisticDivider: React.FC<FuturisticDividerProps> = ({
  className,
  animated = false,
}) => {
  return (
    <div
      className={cn(
        "h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent",
        className
      )}
      style={animated ? { animation: "shimmer 3s infinite" } : undefined}
    />
  );
};

interface FuturisticLoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

export const FuturisticLoading: React.FC<FuturisticLoadingProps> = ({
  size = "md",
  text = "Loading...",
}) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={cn("relative", sizeClasses[size])}>
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-magenta-500 rounded-full animate-spin" />
        <div className="absolute inset-1 bg-background rounded-full" />
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 to-magenta-500/30 rounded-full animate-pulse" />
      </div>
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      )}
    </div>
  );
};

interface FuturisticStatProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
}

export const FuturisticStat: React.FC<FuturisticStatProps> = ({
  label,
  value,
  change,
  changeType = "neutral",
}) => {
  const changeColor = {
    positive: "text-green-400",
    negative: "text-red-400",
    neutral: "text-cyan-400",
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <p className="text-2xl font-bold text-cyan-400">{value}</p>
      {change && (
        <p className={cn("text-xs font-medium", changeColor[changeType])}>
          {change}
        </p>
      )}
    </div>
  );
};
