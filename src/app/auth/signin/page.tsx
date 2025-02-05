'use client';

import { useState } from 'react';
import styles from './page.module.css';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/choix-profil');
      }
    } catch (error) {
      setError('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Connexion</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.input}
              placeholder="exemple@email.com"
            />
          </div>
          {error && <div className={styles.error}>{error}</div>}
          <button type="submit" disabled={isLoading} className={styles.button}>
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        <a href="/auth/signup" className={styles.link}>
          Pas encore inscrit ? Créer un compte
        </a>
      </div>
    </div>
  );
}
