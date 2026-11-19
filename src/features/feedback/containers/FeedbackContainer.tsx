'use client';

import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { useToastStore } from '@/store/toast.store';
import { useSubmitFeedback } from '../queries/feedback.queries';
import { FeedbackApiError } from '../services/feedback.service';
import { FeedbackFormView } from '../components/FeedbackModal';
import type { SubmitFeedbackPayload } from '../types/feedback.types';

export function FeedbackContainer() {
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const submitMutation = useSubmitFeedback();
  const addToast = useToastStore((s) => s.addToast);

  const [isSuccess, setIsSuccess] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (payload: SubmitFeedbackPayload) => {
    setErrorMessage(null);
    setIsRateLimited(false);

    submitMutation.mutate(payload, {
      onSuccess: () => {
        setIsSuccess(true);
        addToast('Feedback submitted successfully!', 'success');
      },
      onError: (err) => {
        if (err instanceof FeedbackApiError && err.statusCode === 429) {
          setIsRateLimited(true);
          return;
        }
        setErrorMessage(
          err instanceof Error
            ? err.message
            : 'Failed to submit feedback. Please try again.',
        );
      },
    });
  };

  const handleReset = () => {
    setIsSuccess(false);
    setIsRateLimited(false);
    setErrorMessage(null);
    submitMutation.reset();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <FeedbackFormView
        userEmail={session?.user?.email ?? null}
        isSubmitting={submitMutation.isPending}
        isRateLimited={isRateLimited}
        errorMessage={errorMessage}
        isSuccess={isSuccess}
        onSubmit={handleSubmit}
        onReset={handleReset}
      />
    </div>
  );
}