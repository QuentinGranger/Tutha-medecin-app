'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './page.module.css';
import { signOut } from 'next-auth/react';

export default function ChoixProfil() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedProfile, setSelectedProfile] = useState<'MEDECIN' | 'ATHLETE' | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/api/user/profile', {
          credentials: 'include'
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur lors de la récupération du profil');
        }
        const data = await response.json();
        if (data.profile_type) {
          setSelectedProfile(data.profile_type as 'MEDECIN' | 'ATHLETE');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        setError(error instanceof Error ? error.message : 'Une erreur est survenue');
      }
    };

    if (status === 'authenticated') {
      fetchUserProfile();
    }
  }, [status]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  const handleProfileChoice = async () => {
    if (!selectedProfile) return;
    setError(null);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ profileType: selectedProfile }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour du profil');
      }

      if (selectedProfile === 'MEDECIN') {
        router.push('/onboarding/professionnel');
      } else {
        router.push('/dashboard'); // ou une autre page pour les athlètes
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    }
  };

  if (status === 'loading') {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Chargement...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <button 
        onClick={() => signOut({ callbackUrl: '/' })}
        style={{ position: 'absolute', top: 10, right: 10, padding: '8px 16px', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer' }}
      >
        Déconnexion (Test)
      </button>
      <div className={styles.header}>
        <h1 className={styles.title}>
          Avant tout, parlons un peu de{' '}
          <span className={styles.highlight}>vous</span> !
        </h1>
        <h2 className={styles.subtitle}>
          Vous êtes (cliquez sur l'un des deux profils) :
        </h2>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.profileGrid}>
        <div
          className={`${styles.profileCard} ${selectedProfile === 'MEDECIN' ? styles.selected : ''}`}
          onClick={() => setSelectedProfile('MEDECIN')}
        >
          <div className={styles.imageContainer}>
            <Image
              src="/img/medecin-v2.png"
              alt="Profil Médecin"
              width={400}
              height={500}
              style={{ 
                objectFit: 'cover',
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0
              }}
              priority
            />
          </div>
          <h3 className={styles.profileTitle}>Médecin</h3>
        </div>

        <div
          className={`${styles.profileCard} ${selectedProfile === 'ATHLETE' ? styles.selected : ''}`}
          onClick={() => setSelectedProfile('ATHLETE')}
        >
          <div className={styles.imageContainer}>
            <Image
              src="/img/athlete.png"
              alt="Profil Athlète"
              width={400}
              height={500}
              style={{ 
                objectFit: 'cover',
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0
              }}
              priority
            />
          </div>
          <h3 className={styles.profileTitle}>Athlète</h3>
        </div>
      </div>

      <button
        className={styles.button}
        onClick={handleProfileChoice}
        disabled={!selectedProfile}
      >
        Continuer
      </button>
    </div>
  );
}
