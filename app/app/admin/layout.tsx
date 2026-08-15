import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  
  if (!session || !session.user || !session.user.isAdmin) {
    redirect('/app');
  }

  return (
    <div className="space-y-6">
      {children}
    </div>
  );
}
