import { AdminOnly } from '@/components/app/AdminOnly';
import { UserManager } from '@/components/app/UserManager';

export default function UsersPage() {
  return (
    <AdminOnly>
      <UserManager />
    </AdminOnly>
  );
}
