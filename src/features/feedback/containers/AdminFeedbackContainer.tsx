'use client';

import { useState, useEffect } from 'react';
import { useToastStore } from '@/store/toast.store';
import {
  useAdminFeedback,
  useDeleteFeedback,
  useUpdateFeedback,
} from '../queries/feedback.queries';
import { AdminFeedbackTable } from '../components/AdminFeedbackTable';
import { FeedbackDetailsModal } from '../components/FeedbackDetailsModal';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';
import type {
  FeedbackCategory,
  FeedbackItem,
  FeedbackTriageStatus,
  UpdateFeedbackPayload,
} from '../types/feedback.types';

const EMPTY_COUNTS: Record<FeedbackTriageStatus, number> = {
  unresolved: 0,
  pending: 0,
  resolved: 0,
};

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

  const { data, isLoading, isError } = useAdminFeedback({
    page,
    limit,
    status: selectedStatusFilter === 'all' ? undefined : selectedStatusFilter,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const updateMutation = useUpdateFeedback();
  const deleteMutation = useDeleteFeedback();
  const addToast = useToastStore((s) => s.addToast);

  const items = data?.data ?? [];
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  // Step back if the current page no longer exists (e.g. after deleting its last item).
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const handleStatusFilterChange = (status: FeedbackTriageStatus | 'all') => {
    setSelectedStatusFilter(status);
    setPage(1);
  };

  const applyUpdate = (
    id: string,
    payload: UpdateFeedbackPayload,
    successMessage: string,
  ) => {
    updateMutation.mutate(
      { id, payload },
      {
        onSuccess: (updated) => {
          setActiveFeedback((current) =>
            current?.id === updated.id ? updated : current,
          );
          addToast(successMessage, 'success');
        },
        onError: (err) => {
          addToast(
            err instanceof Error ? err.message : 'Failed to update feedback',
            'error',
          );
        },
      },
    );
  };

  const handleStatusChange = (id: string, status: FeedbackTriageStatus) =>
    applyUpdate(id, { status }, `Status updated to ${status}`);

  const handleCategoryChange = (id: string, category: FeedbackCategory) =>
    applyUpdate(id, { category }, 'Feedback type updated');

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
        items={items}
        isLoading={isLoading}
        isError={isError}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        selectedStatusFilter={selectedStatusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        statusCounts={data?.statusCounts ?? EMPTY_COUNTS}
        getStatus={(id) => items.find((i) => i.id === id)?.status ?? 'unresolved'}
        getCategory={(item) => item.category}
        onOpenDetails={setActiveFeedback}
        onRequestDelete={setDeleteTarget}
      />

      <FeedbackDetailsModal
        feedback={activeFeedback}
        status={activeFeedback?.status ?? 'unresolved'}
        categoryOverride={activeFeedback?.category}
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
