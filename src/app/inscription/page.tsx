import RegisterForm from '@/components/auth/RegisterForm';
import Image from 'next/image';
import styles from '../page.module.css';

export default function RegisterPage() {
  return (
    <main className={styles.mainContainer}>
      <div className={styles.logoBackground}>
        <Image
          src="/img/Logotuathavide.png"
          alt="Tutha Logo"
          fill
          style={{ objectFit: 'contain' }}
          priority
        />
      </div>
      <div className={styles.glassContainer}>
        <RegisterForm />
      </div>
    </main>
  );
}
