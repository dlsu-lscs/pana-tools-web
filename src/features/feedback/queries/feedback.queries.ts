import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteFeedback,
  getAdminFeedback,
  submitFeedback,
} from '../services/feedback.service';
import type {
  AdminFeedbackQueryParams,
  SubmitFeedbackPayload,
} from '../types/feedback.types';

export const ADMIN_FEEDBACK_KEY = ['admin', 'feedback'] as const;

export function useAdminFeedback(params: AdminFeedbackQueryParams = {}) {
  return useQuery({
    queryKey: [...ADMIN_FEEDBACK_KEY, params],
    queryFn: () => getAdminFeedback(params),
    retry: 1,
  });
}

export function useSubmitFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmitFeedbackPayload) => submitFeedback(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_FEEDBACK_KEY });
    },
  });
}

export function useDeleteFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteFeedback(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_FEEDBACK_KEY });
    },
  });
}