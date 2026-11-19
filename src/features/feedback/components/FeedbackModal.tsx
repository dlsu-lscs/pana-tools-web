'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { FiChevronLeft, FiChevronDown, FiCheck } from 'react-icons/fi';
import { Modal } from '@/components/atoms/Modal';
import {
  FEEDBACK_CATEGORY_OPTIONS,
  type FeedbackCategory,
  type SubmitFeedbackPayload,
} from '../types/feedback.types';

export interface FeedbackFormViewProps {
  userEmail?: string | null;
  isSubmitting: boolean;
  isRateLimited: boolean;
  errorMessage?: string | null;
  isSuccess: boolean;
  onSubmit: (payload: SubmitFeedbackPayload) => void;
  onReset: () => void;
  onBack?: () => void;
  backHref?: string;
}

export function FeedbackFormView({
  userEmail,
  isSubmitting,
  isRateLimited,
  errorMessage,
  isSuccess,
  onSubmit,
  onReset,
  onBack,
  backHref = '/',
}: FeedbackFormViewProps) {
  const [category, setCategory] = useState<FeedbackCategory | ''>('');
  const [message, setMessage] = useState('');
  const [contactEmail, setContactEmail] = useState(userEmail ?? '');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (userEmail) {
      setContactEmail(userEmail);
    }
  }, [userEmail]);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCategoryMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const trimmedLength = message.trim().length;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!category) {
      setValidationError('Please select a type of feedback.');
      return;
    }

    if (trimmedLength < 10) {
      setValidationError('Minimum character count is 10 characters.');
      return;
    }

    if (trimmedLength > 1000) {
      setValidationError('Message cannot exceed 1,000 characters.');
      return;
    }

    const emailToSend = (userEmail || contactEmail.trim()) || null;

    onSubmit({
      category,
      message: message.trim(),
      email: emailToSend,
    });
  };

  const selectedCategoryLabel =
    FEEDBACK_CATEGORY_OPTIONS.find((opt) => opt.value === category)?.label ?? '—';

  return (
    <div className="relative w-full max-w-5xl mx-auto">

      {/* Main Dark Liquid Glass Card */}
      <div className="relative bg-black/60 backdrop-blur-lg border border-white/10 shadow-[var(--shadow-glass)] rounded-2xl px-6 py-8 sm:px-14 sm:py-12 min-h-[540px] flex flex-col justify-between">
        {/* 429 Rate Limit Floating Banner */}
        {isRateLimited && (
          <div
            role="alert"
            className="mb-6 sm:mb-0 sm:absolute sm:top-6 sm:right-6 z-30 bg-white text-black rounded-xl px-5 py-3 shadow-xl max-w-xs text-center text-xs leading-snug"
          >
            <p className="font-bold">Submission limit reached</p>
            <p className="text-black/80 mt-0.5">
              Please wait before submitting another feedback form.
            </p>
          </div>
        )}

        {isSuccess ? (
          /* Success State (Feedback Success Page) */
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-4">
            <svg
              className="w-28 h-28 sm:w-32 sm:h-32 text-white mb-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>

            <h1 className="font-display font-bold text-2xl sm:text-3xl text-white mb-3">
              Thank you!
            </h1>

            <p className="text-sm sm:text-base text-white/80 max-w-md leading-relaxed mb-10">
              Thank you for submitting your feedback. This will help us to improve
              the platform. Please note that updates may take a while to process.
            </p>

            {onBack ? (
              <button
                type="button"
                onClick={() => {
                  onReset();
                  onBack();
                }}
                className="inline-flex items-center justify-center px-12 py-3 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors cursor-pointer"
              >
                Back to Home
              </button>
            ) : (
              <Link
                href={backHref}
                onClick={onReset}
                className="inline-flex items-center justify-center px-12 py-3 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors"
              >
                Back to Home
              </Link>
            )}
          </div>
        ) : (
          /* Form State (Feedback Page) */
          <>
            <div>
              {/* Back to Home pill */}
              <div className="mb-6">
                {onBack ? (
                  <button
                    type="button"
                    onClick={onBack}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/40 border border-white/15 text-xs text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <FiChevronLeft className="w-3.5 h-3.5" />
                    Back to Home
                  </button>
                ) : (
                  <Link
                    href={backHref}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/40 border border-white/15 text-xs text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <FiChevronLeft className="w-3.5 h-3.5" />
                    Back to Home
                  </Link>
                )}
              </div>

              <h1 className="font-display font-bold text-xl sm:text-2xl text-white mb-6 sm:pl-6">
                Feedback Form
              </h1>

              <form onSubmit={handleFormSubmit} className="space-y-5 max-w-3xl mx-auto">
                {/* User Row (shown when signed in or optional email when guest) */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-6">
                  <label
                    htmlFor="feedback-email"
                    className="text-xs sm:text-sm font-medium text-white/90 sm:w-36 sm:text-right shrink-0"
                  >
                    User
                  </label>
                  {userEmail ? (
                    <span className="text-xs sm:text-sm text-white/85 truncate">
                      {userEmail}
                    </span>
                  ) : (
                    <input
                      id="feedback-email"
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="Optional contact email (e.g. juan_dela_cruz@dlsu.edu.ph)"
                      className="w-full sm:max-w-xs px-3 py-1.5 rounded-md bg-white/15 border border-white/15 text-xs sm:text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                    />
                  )}
                </div>

                {/* type of feedback row (pop-up menu per designer notes) */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-6">
                  <label
                    id="feedback-category-label"
                    className="text-xs sm:text-sm font-medium text-white/90 sm:w-36 sm:text-right shrink-0"
                  >
                    Type of Feedback
                  </label>

                  <div className="relative w-full sm:w-64" ref={dropdownRef}>
                    <button
                      type="button"
                      aria-labelledby="feedback-category-label"
                      aria-haspopup="listbox"
                      aria-expanded={categoryMenuOpen}
                      onClick={() => setCategoryMenuOpen((o) => !o)}
                      className="w-full flex items-center justify-between px-3 py-1.5 rounded-md bg-white/15 border border-white/15 text-xs sm:text-sm text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors cursor-pointer"
                    >
                      <span>{selectedCategoryLabel}</span>
                      <FiChevronDown className="w-4 h-4 text-white/70" />
                    </button>

                    {categoryMenuOpen && (
                      <ul
                        role="listbox"
                        aria-labelledby="feedback-category-label"
                        className="absolute left-0 mt-1.5 w-full rounded-xl bg-neutral-900/95 backdrop-blur-xl border border-white/15 shadow-2xl py-1 z-30 overflow-hidden"
                      >
                        {FEEDBACK_CATEGORY_OPTIONS.map((option) => {
                          const isSelected = category === option.value;
                          return (
                            <li key={option.value} role="option" aria-selected={isSelected}>
                              <button
                                type="button"
                                onClick={() => {
                                  setCategory(option.value);
                                  setCategoryMenuOpen(false);
                                  setValidationError(null);
                                }}
                                className={`w-full flex items-center justify-between px-3.5 py-2 text-left text-xs sm:text-sm transition-colors cursor-pointer ${
                                  isSelected
                                    ? 'bg-white/15 text-white font-semibold'
                                    : 'text-white/75 hover:bg-white/10 hover:text-white'
                                }`}
                              >
                                <span>{option.label}</span>
                                {isSelected && <FiCheck className="w-3.5 h-3.5 text-primary-400" />}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Message Row */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-6">
                  <label
                    htmlFor="feedback-message"
                    className="text-xs sm:text-sm font-medium text-white/90 sm:w-36 sm:text-right shrink-0 sm:pt-2"
                  >
                    Message
                  </label>

                  <div className="flex-1 w-full">
                    {/* Mobile helper row above textarea (1 _ M. Feedback Page.png) */}
                    <div className="flex sm:hidden items-center justify-between text-[11px] text-white/75 mb-1">
                      <span>Minimum character count: 10</span>
                      <span className="tabular-nums">
                        Character Count: {message.length}/1000
                      </span>
                    </div>

                    <div className="relative">
                      <textarea
                        id="feedback-message"
                        value={message}
                        onChange={(e) => {
                          setMessage(e.target.value.slice(0, 1000));
                          if (validationError) setValidationError(null);
                        }}
                        rows={7}
                        maxLength={1000}
                        placeholder="Enter message here..."
                        className="w-full px-4 py-3 pb-7 rounded-md bg-white/15 border border-white/15 text-xs sm:text-sm text-white placeholder:text-white/45 focus:outline-none focus:ring-2 focus:ring-white/30 resize-none leading-relaxed"
                      />

                      {/* Desktop counter inside bottom-right of textarea (Feedback Page) */}
                      <span className="hidden sm:block absolute bottom-2 right-3 text-[11px] text-white/65 tabular-nums pointer-events-none">
                        Character Count: {message.length}/1000
                      </span>
                    </div>

                    {/* Desktop helper note below textarea */}
                    <p className="hidden sm:block text-[11px] text-white/75 mt-1">
                      Note: The minimum character count is 10.
                    </p>

                    {/* Inline validation or API error message */}
                    {(validationError || (errorMessage && !isRateLimited)) && (
                      <p role="alert" className="text-xs text-red-400 mt-1.5 font-medium">
                        {validationError ?? errorMessage}
                      </p>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4 flex justify-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-56 py-3 px-8 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50 transition-all cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? '...' : 'Submit Form'}
                  </button>
                </div>
              </form>
            </div>

            {/* Footer Contact Note */}
            <div className="mt-10 text-center text-xs text-white/80 leading-relaxed">
              <p>Want to contact us?</p>
              <p>
                Send a message to{' '}
                <a
                  href="mailto:lscs@dlsu.edu.ph"
                  className="underline underline-offset-2 hover:text-white transition-colors"
                >
                  lscs@dlsu.edu.ph
                </a>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string | null;
  isSubmitting: boolean;
  isRateLimited: boolean;
  errorMessage?: string | null;
  isSuccess: boolean;
  onSubmit: (payload: SubmitFeedbackPayload) => void;
  onReset: () => void;
}

export function FeedbackModal({
  isOpen,
  onClose,
  ...formProps
}: FeedbackModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Feedback Form">
      <FeedbackFormView {...formProps} onBack={onClose} />
    </Modal>
  );
}