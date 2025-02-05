'use client';

import { useState } from 'react';
import styles from './page.module.css';
import { useRouter } from 'next/navigation';

export default function SignUp() {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    rpps: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue');
      }

      router.push('/auth/signin?registered=true');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Inscription</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              Email *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="votre@email.com"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="firstName" className={styles.label}>
              Prénom *
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="Prénom"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="lastName" className={styles.label}>
              Nom *
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="Nom"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="phoneNumber" className={styles.label}>
              Téléphone
            </label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleChange}
              className={styles.input}
              placeholder="06 12 34 56 78"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="rpps" className={styles.label}>
              Numéro RPPS
            </label>
            <input
              id="rpps"
              name="rpps"
              type="text"
              value={formData.rpps}
              onChange={handleChange}
              className={styles.input}
              placeholder="Numéro RPPS"
            />
          </div>

          <button type="submit" disabled={isLoading} className={styles.button}>
            {isLoading ? 'Inscription...' : 'S\'inscrire'}
          </button>
        </form>

        <div className={styles.linkContainer}>
          <a href="/auth/signin" className={styles.link}>
            Déjà un compte ? Se connecter
          </a>
        </div>
      </div>
    </div>
  );
}
