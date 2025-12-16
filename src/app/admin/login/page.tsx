import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/auth';
import AdminLoginForm from './login-form';

export default async function AdminLoginPage() {
  const session = await verifySession();

  if (session) {
    redirect('/admin');
  }

  return <AdminLoginForm />;
}
