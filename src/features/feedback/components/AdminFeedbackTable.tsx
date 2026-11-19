'use client';

import {
  FiClock,
  FiCheck,
  FiMoreHorizontal,
  FiTrash2,
  FiUser,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import {
  FEEDBACK_CATEGORY_LABELS,
  type FeedbackCategory,
  type FeedbackItem,
  type FeedbackTriageStatus,
} from '../types/feedback.types';

export interface AdminFeedbackTableProps {
  items: FeedbackItem[];
  isLoading: boolean;
  isError: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  selectedStatusFilter: FeedbackTriageStatus | 'all';
  onStatusFilterChange: (status: FeedbackTriageStatus | 'all') => void;
  statusCounts: Record<FeedbackTriageStatus, number>;
  getStatus: (id: string) => FeedbackTriageStatus;
  getCategory: (item: FeedbackItem) => FeedbackCategory;
  onOpenDetails: (item: FeedbackItem) => void;
  onRequestDelete: (item: FeedbackItem) => void;
}

function StatusIcon({ status }: { status: FeedbackTriageStatus }) {
  if (status === 'unresolved') {
    return (
      <div
        title="Unresolved"
        className="w-8 h-8 flex items-center justify-center shrink-0 text-red-500 font-display font-extrabold text-2xl leading-none select-none"
      >
        !
      </div>
    );
  }
  if (status === 'pending') {
    return (
      <div
        title="Pending"
        className="w-8 h-8 flex items-center justify-center shrink-0 text-amber-400"
      >
        <FiClock className="w-6 h-6" />
      </div>
    );
  }
  return (
    <div
      title="Resolved"
      className="w-8 h-8 flex items-center justify-center shrink-0 text-green-400"
    >
      <FiCheck className="w-6 h-6" strokeWidth={3} />
    </div>
  );
}

function buildPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 3) {
    return [1, 2, 3, 'ellipsis', total];
  }
  if (current >= total - 2) {
    return [1, 'ellipsis', total - 2, total - 1, total];
  }
  return [1, 'ellipsis', current, 'ellipsis', total];
}

export function AdminFeedbackTable({
  items,
  isLoading,
  isError,
  page,
  totalPages,
  onPageChange,
  selectedStatusFilter,
  onStatusFilterChange,
  statusCounts,
  getStatus,
  getCategory,
  onOpenDetails,
  onRequestDelete,
}: AdminFeedbackTableProps) {
  const filterTabs: { label: string; value: FeedbackTriageStatus; count: number }[] = [
    { label: 'Unresolved', value: 'unresolved', count: statusCounts.unresolved },
    { label: 'Pending', value: 'pending', count: statusCounts.pending },
    { label: 'Resolved', value: 'resolved', count: statusCounts.resolved },
  ];

  const pageNumbers = buildPageNumbers(page, Math.max(1, totalPages));

  return (
    <div>
      {/* Status Filter Pills (Unresolved / Pending / Resolved) */}
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-4">
        {filterTabs.map((tab) => {
          const isActive = selectedStatusFilter === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() =>
                onStatusFilterChange(isActive ? 'all' : tab.value)
              }
              className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors flex items-center gap-2 border cursor-pointer ${
                isActive
                  ? 'bg-white/20 text-white border-white/40'
                  : 'bg-white/[0.06] text-white/75 border-white/20 hover:bg-white/12 hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              <span className="font-bold">{tab.count}</span>
            </button>
          );
        })}
      </div>

      {/* Numbered Pagination Bar (< 1 2 ... 10 >) */}
      <div className="flex items-center justify-center sm:justify-start gap-2 mb-6">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="w-7 h-7 rounded-md bg-white/10 border border-white/20 flex items-center justify-center text-white/80 hover:bg-white/20 disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <FiChevronLeft className="w-4 h-4" />
        </button>

        {pageNumbers.map((num, idx) =>
          num === 'ellipsis' ? (
            <span key={`ellipsis-${idx}`} className="px-1 text-white/60 text-xs">
              ...
            </span>
          ) : (
            <button
              key={num}
              type="button"
              onClick={() => onPageChange(num)}
              className={`min-w-[28px] h-7 px-2 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
                page === num
                  ? 'bg-white/25 text-white border-white/50'
                  : 'bg-white/8 text-white/70 border-white/15 hover:bg-white/15 hover:text-white'
              }`}
            >
              {num}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className="w-7 h-7 rounded-md bg-white/10 border border-white/20 flex items-center justify-center text-white/80 hover:bg-white/20 disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <FiChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* States: Loading / Error / Empty / 2-Column Card Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-white/40 text-sm">
          Loading feedback submissions…
        </div>
      ) : isError ? (
        <div className="text-center py-12 text-red-400 text-sm">
          Unable to load feedback submissions right now.
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg font-medium text-white/80">No feedback submissions found</p>
          <p className="text-white/40 text-sm mt-1">
            Submitted user feedback and bug reports will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((item) => {
            const itemStatus = getStatus(item.id);
            const itemCategory = getCategory(item);
            const categoryTitle =
              FEEDBACK_CATEGORY_LABELS[itemCategory] ?? itemCategory;
            const authorLabel = item.email || item.userId || 'Anonymous';
            const formattedDate = new Date(item.createdAt).toLocaleDateString(
              'en-US',
              {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              },
            );

            return (
              <div
                key={item.id}
                className="bg-[#050806] border border-white/10 rounded-2xl px-4 py-3.5 flex items-center justify-between gap-3 hover:border-white/20 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <StatusIcon status={itemStatus} />

                  <div className="min-w-0">
                    <p className="text-white font-bold text-sm sm:text-base leading-tight truncate">
                      {categoryTitle}
                    </p>
                    <div className="flex items-center gap-1.5 text-white/75 text-xs mt-0.5">
                      <FiUser className="w-3 h-3 text-white/60 shrink-0" />
                      <span className="truncate">{authorLabel}</span>
                    </div>
                    <p className="text-white/50 text-[11px] mt-0.5">
                      {formattedDate}
                    </p>
                  </div>
                </div>

                {/* Actions: "..." Details Popup Trigger + Delete Trash Icon */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onOpenDetails(item)}
                    title="View feedback details"
                    aria-label="View feedback details"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <FiMoreHorizontal className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onRequestDelete(item)}
                    title="Delete feedback"
                    aria-label="Delete feedback"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-red-400 hover:bg-red-500/15 transition-colors cursor-pointer"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}