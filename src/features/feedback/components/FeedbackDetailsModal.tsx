'use client';

import { useState, useRef, useEffect } from 'react';
import { FiChevronLeft, FiCheck } from 'react-icons/fi';
import {
  FEEDBACK_CATEGORY_LABELS,
  FEEDBACK_CATEGORY_OPTIONS,
  FEEDBACK_STATUS_OPTIONS,
  type FeedbackCategory,
  type FeedbackItem,
  type FeedbackTriageStatus,
} from '../types/feedback.types';

export interface FeedbackDetailsModalProps {
  feedback: FeedbackItem | null;
  status: FeedbackTriageStatus;
  categoryOverride?: FeedbackCategory;
  onClose: () => void;
  onStatusChange: (id: string, status: FeedbackTriageStatus) => void;
  onCategoryChange: (id: string, category: FeedbackCategory) => void;
}

const STATUS_TEXT_COLOR: Record<FeedbackTriageStatus, string> = {
  unresolved: 'text-red-500',
  pending: 'text-amber-400',
  resolved: 'text-green-400',
};

const STATUS_LABEL: Record<FeedbackTriageStatus, string> = {
  unresolved: 'Unresolved',
  pending: 'Pending',
  resolved: 'Resolved',
};

export function FeedbackDetailsModal({
  feedback,
  status,
  categoryOverride,
  onClose,
  onStatusChange,
  onCategoryChange,
}: FeedbackDetailsModalProps) {
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);

  const statusMenuRef = useRef<HTMLDivElement>(null);
  const categoryMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!feedback) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [feedback, onClose]);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (statusMenuRef.current && !statusMenuRef.current.contains(e.target as Node)) {
        setStatusMenuOpen(false);
      }
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(e.target as Node)) {
        setCategoryMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  if (!feedback) return null;

  const activeCategory = categoryOverride ?? feedback.category;
  const displayUser = feedback.email || feedback.userId || 'Anonymous';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-[#070a08] border border-white/15 rounded-3xl p-6 sm:p-8 text-white shadow-[var(--shadow-modal)] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Back to Admin Button */}
        <div className="mb-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/20 text-xs text-white/90 hover:bg-white/25 transition-colors cursor-pointer"
          >
            <FiChevronLeft className="w-3.5 h-3.5" />
            Back to Admin
          </button>
        </div>

        {/* Title */}
        <h2 className="font-display font-bold text-lg sm:text-xl text-center text-white mb-6">
          Feedback Details
        </h2>

        {/* Metadata Grid */}
        <div className="space-y-3 text-xs sm:text-sm max-w-md mx-auto mb-7">
          <div className="grid grid-cols-[130px_1fr] sm:grid-cols-[150px_1fr] gap-4 items-center">
            <span className="font-bold text-white text-right">User</span>
            <span className="text-white/90 truncate">{displayUser}</span>
          </div>

          <div className="grid grid-cols-[130px_1fr] sm:grid-cols-[150px_1fr] gap-4 items-center">
            <span className="font-bold text-white text-right">Type of Feedback</span>
            <span className="text-white/90">
              {FEEDBACK_CATEGORY_LABELS[activeCategory] ?? activeCategory}
            </span>
          </div>

          <div className="grid grid-cols-[130px_1fr] sm:grid-cols-[150px_1fr] gap-4 items-center">
            <span className="font-bold text-white text-right">Status</span>
            <span className={`font-semibold ${STATUS_TEXT_COLOR[status]}`}>
              {STATUS_LABEL[status]}
            </span>
          </div>
        </div>

        {/* Message Section */}
        <div className="mb-8">
          <h3 className="text-xs sm:text-sm font-bold text-center text-white mb-3">
            Message
          </h3>
          <div className="max-h-60 overflow-y-auto px-2 sm:px-6 text-center text-xs sm:text-sm text-white/85 leading-relaxed whitespace-pre-wrap break-words">
            {feedback.message}
          </div>
        </div>

        {/* Options Section with Pop-up Menus (Designer Note #4) */}
        <div className="flex flex-col items-center gap-2.5">
          <p className="text-xs sm:text-sm font-bold text-white mb-1">Options</p>

          {/* Edit Status Pop-up Menu */}
          <div className="relative w-56" ref={statusMenuRef}>
            <button
              type="button"
              onClick={() => {
                setStatusMenuOpen((o) => !o);
                setCategoryMenuOpen(false);
              }}
              className="w-full py-2 px-4 rounded-full bg-white text-black text-xs sm:text-sm font-medium hover:bg-white/90 transition-colors cursor-pointer"
            >
              Edit <span className="font-bold">Status</span>
            </button>

            {statusMenuOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-full rounded-2xl bg-neutral-900 border border-white/15 shadow-2xl py-1.5 z-30 overflow-hidden">
                {FEEDBACK_STATUS_OPTIONS.map((opt) => {
                  const active = status === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onStatusChange(feedback.id, opt.value);
                        setStatusMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2 text-xs sm:text-sm text-left transition-colors cursor-pointer ${
                        active
                          ? 'bg-white/15 text-white font-semibold'
                          : 'text-white/75 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {active && <FiCheck className="w-3.5 h-3.5 text-primary-400" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Edit Type of Feedback Pop-up Menu */}
          <div className="relative w-56" ref={categoryMenuRef}>
            <button
              type="button"
              onClick={() => {
                setCategoryMenuOpen((o) => !o);
                setStatusMenuOpen(false);
              }}
              className="w-full py-2 px-4 rounded-full bg-white text-black text-xs sm:text-sm font-medium hover:bg-white/90 transition-colors cursor-pointer"
            >
              Edit <span className="font-bold">Type of Feedback</span>
            </button>

            {categoryMenuOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-full rounded-2xl bg-neutral-900 border border-white/15 shadow-2xl py-1.5 z-30 overflow-hidden">
                {FEEDBACK_CATEGORY_OPTIONS.map((opt) => {
                  const active = activeCategory === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onCategoryChange(feedback.id, opt.value);
                        setCategoryMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2 text-xs sm:text-sm text-left transition-colors cursor-pointer ${
                        active
                          ? 'bg-white/15 text-white font-semibold'
                          : 'text-white/75 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {active && <FiCheck className="w-3.5 h-3.5 text-primary-400" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}