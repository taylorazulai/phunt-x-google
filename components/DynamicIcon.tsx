"use client";

import React from "react";
import {
  CreditCard,
  Wrench,
  Users,
  ShieldAlert,
  Zap,
  DollarSign,
  Wifi,
  Sparkles,
  Building2,
  Clock,
  Flame,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HeartPulse,
  Lock,
  HelpCircle,
  Smile,
  Star,
  Activity,
  Award,
  Layers,
  LucideProps,
} from "lucide-react";

interface DynamicIconProps extends LucideProps {
  name: string;
  fallback?: React.ComponentType<LucideProps>;
}

// Explicit map of supported icons for reliable tree-shaking and runtime safety
const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  CreditCard,
  Wrench,
  Users,
  ShieldAlert,
  Zap,
  DollarSign,
  Wifi,
  Sparkles,
  Building2,
  Clock,
  Flame,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HeartPulse,
  Lock,
  HelpCircle,
  Smile,
  Star,
  Activity,
  Award,
  Layers,
};

export function DynamicIcon({
  name,
  fallback = ShieldAlert,
  className = "w-5 h-5",
  ...props
}: DynamicIconProps) {
  // Normalize lookup (case insensitive match if exact not found)
  let IconComponent = ICON_MAP[name];

  if (!IconComponent) {
    const normalizedKey = Object.keys(ICON_MAP).find(
      (k) => k.toLowerCase() === name.toLowerCase().replace(/[-_\s]/g, "")
    );
    if (normalizedKey) {
      IconComponent = ICON_MAP[normalizedKey];
    }
  }

  const FinalComponent = IconComponent || fallback;
  return <FinalComponent className={className} {...props} />;
}
