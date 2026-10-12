"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Lock,
  ArrowRight,
  Loader2,
  X,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  pageId?: string;
  sourceAction?: "share_link" | "copy_html" | "copy_markdown" | "email_share";
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LeadCaptureModal({
  isOpen,
  onClose,
  onSuccess,
  pageId,
  sourceAction = "copy_html",
}: LeadCaptureModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedFirst) {
      setErrorMsg("Please enter your first name.");
      return;
    }

    if (!trimmedLast) {
      setErrorMsg("Please enter your last name.");
      return;
    }

    if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
      setErrorMsg("Please enter a valid work email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: trimmedFirst,
          lastName: trimmedLast,
          email: trimmedEmail,
          pageId,
          sourceAction,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit details.");
      }

      // Mark user as unlocked in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("challenger_unlocked", "true");
        localStorage.setItem("challenger_lead_name", `${trimmedFirst} ${trimmedLast}`);
        localStorage.setItem("challenger_lead_email", trimmedEmail);
      }

      // Automatically trigger the original export action and close modal
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Network error. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/95 p-6 sm:p-8 shadow-2xl shadow-indigo-950/80 animate-in zoom-in-95 duration-200">
        {/* Dismiss Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors p-1"
          title="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 mb-4 shadow-sm">
            <Sparkles className="h-6 w-6 text-indigo-400" />
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Unlock Your Counter-Page Assets
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            Enter your name and work email once to copy the standalone code, markdown, and public share link.
          </p>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mt-5 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 animate-in fade-in duration-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Split Name Fields (First Name & Last Name) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                First Name
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Sarah"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Last Name
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Connor"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Work Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Work Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sarah@company.com"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-rose-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-xl shadow-indigo-600/30 hover:from-indigo-500 hover:to-rose-500 hover:shadow-indigo-500/40 disabled:opacity-50 transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Unlocking Assets...</span>
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 text-amber-300" />
                <span>Unlock &amp; Complete Export</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          {/* Trust & Legal Disclaimers */}
          <div className="pt-2 text-center space-y-2">
            <p className="text-[11px] text-slate-400">
              By unlocking, you agree to our{" "}
              <Link
                href="/terms"
                target="_blank"
                className="text-indigo-400 font-semibold underline hover:text-indigo-300"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                target="_blank"
                className="text-indigo-400 font-semibold underline hover:text-indigo-300"
              >
                Privacy Policy
              </Link>
              .
            </p>
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Zero spam • 1-click unsubscribe anytime • No credit card</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
