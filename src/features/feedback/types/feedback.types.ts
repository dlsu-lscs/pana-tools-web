export type FeedbackCategory = 'bug' | 'feature_request' | 'improvement' | 'general';

export type FeedbackTriageStatus = 'unresolved' | 'pending' | 'resolved';

export interface FeedbackItem {
  id: string;
  userId: string | null;
  email?: string | null;
  category: FeedbackCategory;
  status: FeedbackTriageStatus;
  message: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SubmitFeedbackPayload {
  category: FeedbackCategory;
  message: string;
  email?: string | null;
}

export interface AdminFeedbackQueryParams {
  page?: number;
  limit?: number;
  category?: FeedbackCategory;
  status?: FeedbackTriageStatus;
  search?: string;
  userId?: string;
  sortBy?: 'createdAt' | 'category' | 'email';
  sortOrder?: 'asc' | 'desc';
}

export interface FeedbackListResponse {
  data: FeedbackItem[];
  total: number;
  page: number;
  limit: number;
  statusCounts: Record<FeedbackTriageStatus, number>;
}

export interface UpdateFeedbackPayload {
  status?: FeedbackTriageStatus;
  category?: FeedbackCategory;
}

export const FEEDBACK_CATEGORY_OPTIONS: ReadonlyArray<{
  value: FeedbackCategory;
  label: string;
}> = [
  { value: 'bug', label: 'Bug Report' },
  { value: 'feature_request', label: 'Feature Request' },
  { value: 'improvement', label: 'User Experience' },
] as const;

export const FEEDBACK_CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  bug: 'Bug Report',
  feature_request: 'Feature Request',
  improvement: 'User Experience',
  general: 'General',
};

export const FEEDBACK_STATUS_OPTIONS: ReadonlyArray<{
  value: FeedbackTriageStatus;
  label: string;
}> = [
  { value: 'unresolved', label: 'Unresolved' },
  { value: 'pending', label: 'Pending' },
  { value: 'resolved', label: 'Resolved' },
] as const;