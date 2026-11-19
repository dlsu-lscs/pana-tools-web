import type {
  AdminFeedbackQueryParams,
  FeedbackItem,
  FeedbackListResponse,
  SubmitFeedbackPayload,
  UpdateFeedbackPayload,
} from '../types/feedback.types';

const getBaseUrl = () => `${process.env.NEXT_PUBLIC_API_URL}/api/feedback`;

export class FeedbackApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
  ) {
    super(message);
    this.name = 'FeedbackApiError';
  }
}

async function parseErrorResponse(
  response: Response,
  fallbackMessage: string,
): Promise<FeedbackApiError> {
  const body = await response.json().catch(() => ({}));
  const message =
    body?.error?.message ?? body?.message ?? fallbackMessage;
  const code = body?.error?.code;
  return new FeedbackApiError(message, response.status, code);
}

export async function submitFeedback(
  payload: SubmitFeedbackPayload,
): Promise<FeedbackItem> {
  const response = await fetch(getBaseUrl(), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await parseErrorResponse(
      response,
      response.status === 429
        ? 'Submission limit reached. Please wait before submitting another feedback form.'
        : 'Failed to submit feedback. Please try again.',
    );
  }

  return response.json();
}

export async function getAdminFeedback(
  params: AdminFeedbackQueryParams = {},
): Promise<FeedbackListResponse> {
  const query = new URLSearchParams();

  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.category) query.set('category', params.category);
  if (params.status) query.set('status', params.status);
  if (params.search) query.set('search', params.search);
  if (params.userId) query.set('userId', params.userId);
  if (params.sortBy) query.set('sortBy', params.sortBy);
  if (params.sortOrder) query.set('sortOrder', params.sortOrder);

  const queryString = query.toString();
  const url = queryString
    ? `${getBaseUrl()}/admin?${queryString}`
    : `${getBaseUrl()}/admin`;

  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    throw await parseErrorResponse(response, 'Failed to fetch feedback submissions.');
  }

  return response.json();
}

export async function updateFeedback(
  id: string,
  payload: UpdateFeedbackPayload,
): Promise<FeedbackItem> {
  const response = await fetch(
    `${getBaseUrl()}/admin/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    throw await parseErrorResponse(response, 'Failed to update feedback.');
  }

  return response.json();
}

export async function deleteFeedback(
  id: string,
): Promise<{ message: string }> {
  const response = await fetch(
    `${getBaseUrl()}/admin/${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
      credentials: 'include',
    },
  );

  if (!response.ok) {
    throw await parseErrorResponse(response, 'Failed to delete feedback.');
  }

  return response.json();
}