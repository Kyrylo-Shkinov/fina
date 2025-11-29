import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

