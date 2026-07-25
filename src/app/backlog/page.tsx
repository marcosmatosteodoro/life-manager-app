import { AdminOnly } from '@/components/app/AdminOnly';
import { BacklogManager } from '@/components/app/BacklogManager';

export default function BacklogPage() {
  return (
    <AdminOnly>
      <BacklogManager />
    </AdminOnly>
  );
}
