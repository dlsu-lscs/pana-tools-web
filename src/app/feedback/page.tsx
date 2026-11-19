import type { Metadata } from 'next';
import { FeedbackContainer } from '@/features/feedback/containers/FeedbackContainer';

export const metadata: Metadata = { title: 'Feedback' };

export default function FeedbackPage() {
  return <FeedbackContainer />;
}