import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';
import Image from 'next/image';
import { authOptions } from './api/auth/[...nextauth]/route';
import styles from './page.module.css';

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    // @ts-ignore
    if (!session.user.onboarding_completed) {
      redirect('/choix-profil');
    } else {
      redirect('/dashboard');
    }
  }

  return (
    <main className={styles.mainContainer}>
      <div className={styles.logoBackground}>
        <Image
          src="/images/logo.svg"
          alt="Logo"
          width={200}
          height={200}
          priority
        />
      </div>
      <div className={styles.formContainer}>
        <LoginForm />
      </div>
    </main>
  );
}
