'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useIsAdmin } from '@/features/auth/hooks/useIsAdmin';
import { SidebarLayout } from '@/components/organisms/SidebarLayout';
import { ApprovalContainer } from './ApprovalContainer';
import { MembersContainer } from './MembersContainer';
import { ClaimApprovalContainer } from './ClaimApprovalContainer';
import { AdminFeedbackContainer } from '@/features/feedback/containers/AdminFeedbackContainer';
import { useAdminApplicationsQuery, useAdminClaimRequestsQuery } from '../queries/admin.queries';
import { useAdminFeedback } from '@/features/feedback/queries/feedback.queries';
import type { AdminTab } from '../types/admin.types';
import { FiGrid, FiUsers, FiFlag, FiFileText } from 'react-icons/fi';

export interface AdminTabRegistryItem {
  id: AdminTab;
  label: string;
  section: 'Content' | 'Management';
  icon: React.ReactNode;
  badge?: number;
  render: () => React.ReactNode;
}

export function AdminDashboardContainer() {
  const router = useRouter();
  const { isAdmin, isPending } = useIsAdmin();
  const [activeTab, setActiveTab] = useState<AdminTab>('apps');
  const [hasMounted, setHasMounted] = useState(false);

  const { data: pendingApps } = useAdminApplicationsQuery(1, 'PENDING', 1);
  const { data: pendingClaims } = useAdminClaimRequestsQuery(1, 'PENDING', 1);
  const { data: feedbackMeta } = useAdminFeedback({ page: 1, limit: 1 });

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!isPending && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, isPending, router]);

  if (!hasMounted || isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/40">
        Loading…
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const tabRegistry: AdminTabRegistryItem[] = [
    {
      id: 'apps',
      label: 'Apps',
      section: 'Content',
      icon: <FiGrid />,
      badge: pendingApps?.meta.total,
      render: () => <ApprovalContainer />,
    },
    {
      id: 'claims',
      label: 'Claim Requests',
      section: 'Content',
      icon: <FiFlag />,
      badge: pendingClaims?.meta.total,
      render: () => <ClaimApprovalContainer />,
    },
    {
      id: 'feedback',
      label: 'Feedback Submissions',
      section: 'Content',
      icon: <FiFileText />,
      badge: feedbackMeta?.statusCounts.unresolved,
      render: () => <AdminFeedbackContainer />,
    },
    {
      id: 'members',
      label: 'Members',
      section: 'Management',
      icon: <FiUsers />,
      render: () => <MembersContainer />,
    },
  ];

  const sidebarSections = (['Content', 'Management'] as const).map((sectionLabel) => ({
    label: sectionLabel,
    items: tabRegistry
      .filter((t) => t.section === sectionLabel)
      .map(({ id, label, icon, badge }) => ({ id, label, icon, badge })),
  }));

  const activeEntry = tabRegistry.find((t) => t.id === activeTab) ?? tabRegistry[0];

  return (
    <div className="min-h-screen flex items-start justify-center px-4 py-10">
      <div
        className="glass-lg rounded-2xl overflow-hidden w-full max-w-7xl flex flex-col"
        style={{ minHeight: 'calc(100vh - 5rem)' }}
      >
        <SidebarLayout
          title="Admin"
          sidebarWidth="w-60"
          sections={sidebarSections}
          activeId={activeTab}
          onSelect={setActiveTab}
        >
          {activeEntry.render()}
        </SidebarLayout>
      </div>
    </div>
  );
}