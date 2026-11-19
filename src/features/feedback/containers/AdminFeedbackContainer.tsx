'use client';

import { useState, useEffect, useMemo } from 'react';
import { useToastStore } from '@/store/toast.store';
import {
  useAdminFeedback,
  useDeleteFeedback,
} from '../queries/feedback.queries';
import { AdminFeedbackTable } from '../components/AdminFeedbackTable';
import { FeedbackDetailsModal } from '../components/FeedbackDetailsModal';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';
import type {
  FeedbackCategory,
  FeedbackItem,
  FeedbackTriageStatus,
} from '../types/feedback.types';

const STORAGE_KEY = 'pana-admin-feedback-triage-v1';

interface TriageMap {
  status: Record<string, FeedbackTriageStatus>;
  category: Record<string, FeedbackCategory>;
}

export function AdminFeedbackContainer() {
  const [page, setPage] = useState(1);
  const limit = 18;
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<
    FeedbackTriageStatus | 'all'
  >('all');
  const [activeFeedback, setActiveFeedback] = useState<FeedbackItem | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<FeedbackItem | null>(null);
  const [triage, setTriage] = useState<TriageMap>({ status: {}, category: {} });

  const { data, isLoading, isError } = useAdminFeedback({
    page,
    limit,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const deleteMutation = useDeleteFeedback();
  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setTriage(JSON.parse(saved));
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const persistTriage = (next: TriageMap) => {
    setTriage(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore storage errors
    }
  };

  const getStatus = (id: string): FeedbackTriageStatus =>
    triage.status[id] ?? 'unresolved';

  const getCategory = (item: FeedbackItem): FeedbackCategory =>
    triage.category[item.id] ?? item.category;

  const handleStatusChange = (id: string, status: FeedbackTriageStatus) => {
    persistTriage({
      ...triage,
      status: { ...triage.status, [id]: status },
    });
    addToast(`Status updated to ${status}`, 'success');
  };

  const handleCategoryChange = (id: string, category: FeedbackCategory) => {
    persistTriage({
      ...triage,
      category: { ...triage.category, [id]: category },
    });
    addToast('Feedback type updated', 'success');
  };

  const allItems = data?.data ?? [];
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  const statusCounts = useMemo(() => {
    const counts: Record<FeedbackTriageStatus, number> = {
      unresolved: 0,
      pending: 0,
      resolved: 0,
    };
    for (const item of allItems) {
      counts[getStatus(item.id)] += 1;
    }
    return counts;
  }, [allItems, triage.status]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredItems = useMemo(() => {
    if (selectedStatusFilter === 'all') return allItems;
    return allItems.filter(
      (item) => getStatus(item.id) === selectedStatusFilter,
    );
  }, [allItems, selectedStatusFilter, triage.status]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        addToast('Feedback deleted successfully', 'success');
        if (activeFeedback?.id === deleteTarget.id) {
          setActiveFeedback(null);
        }
        setDeleteTarget(null);
      },
      onError: (err) => {
        addToast(
          err instanceof Error ? err.message : 'Failed to delete feedback',
          'error',
        );
      },
    });
  };

  return (
    <>
      <AdminFeedbackTable
        items={filteredItems}
        isLoading={isLoading}
        isError={isError}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        selectedStatusFilter={selectedStatusFilter}
        onStatusFilterChange={setSelectedStatusFilter}
        statusCounts={statusCounts}
        getStatus={getStatus}
        getCategory={getCategory}
        onOpenDetails={setActiveFeedback}
        onRequestDelete={setDeleteTarget}
      />

      <FeedbackDetailsModal
        feedback={activeFeedback}
        status={activeFeedback ? getStatus(activeFeedback.id) : 'unresolved'}
        categoryOverride={
          activeFeedback ? getCategory(activeFeedback) : undefined
        }
        onClose={() => setActiveFeedback(null)}
        onStatusChange={handleStatusChange}
        onCategoryChange={handleCategoryChange}
      />

      <DeleteConfirmationModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteMutation.isPending}
      />
    </>
  );
}