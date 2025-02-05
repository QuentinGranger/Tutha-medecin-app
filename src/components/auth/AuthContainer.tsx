'use client';

import Image from 'next/image';
import styles from './AuthContainer.module.css';

export default function AuthContainer({ children }: { children: React.ReactNode }) {
  return (
    <main className={styles.container}>
      <div className={styles.logoSection}>
        <Image
          src="/img/Logotuathavide.png"
          alt="Tutha Logo"
          fill
          style={{ objectFit: 'contain' }}
          priority
        />
      </div>
      
      <div className={styles.glassContainer}>
        {children}
      </div>
    </main>
  );
}
