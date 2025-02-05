'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import PersonalInfoEdit from './components/PersonalInfoEdit';
import ProfessionalInfoEdit from './components/ProfessionalInfoEdit';
import toast from 'react-hot-toast';

interface UserInfo {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  professional_type: string;
  speciality: string;
  rpps_number: string;
  adeli_number: string;
  certification_number: string;
  diploma: string;
  years_of_experience: number;
  practice_address: string;
  practice_city: string;
  practice_postal_code: string;
  services: Array<{
    id: string;
    name: string;
    description: string;
    duration: number;
    price: number;
    is_custom: boolean;
  }>;
  businessHours: Array<{
    id: string;
    day: number;
    open_time: string;
    close_time: string;
    is_closed: boolean;
  }>;
}

const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export default function ResumePage() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingProfessional, setIsEditingProfessional] = useState(false);

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/user/info');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur lors du chargement des données');
        }
        const data = await response.json();
        console.log('Données utilisateur chargées:', data);
        setUserInfo(data);
      } catch (error) {
        console.error('Error loading user info:', error);
        setError(error instanceof Error ? error.message : 'Erreur inconnue');
        toast.error('Erreur lors du chargement des informations');
      } finally {
        setLoading(false);
      }
    };

    loadUserInfo();
  }, []);

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  if (loading) {
    return <div className={styles.loading}>Chargement...</div>;
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>Erreur : {error}</p>
        <button 
          className={styles.retryButton}
          onClick={() => window.location.reload()}
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!userInfo) {
    return <div className={styles.error}>Aucune information utilisateur trouvée</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        <span className={styles.gradientText}>Résumé de vos informations</span>
      </h1>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Informations personnelles</h2>
          {!isEditingPersonal && (
            <button 
              className={styles.editButton}
              onClick={() => setIsEditingPersonal(true)}
            >
              Modifier
            </button>
          )}
        </div>
        {isEditingPersonal ? (
          <PersonalInfoEdit
            info={{
              firstName: userInfo.first_name,
              lastName: userInfo.last_name,
              email: userInfo.email,
              phone: userInfo.phone || ''
            }}
            onCancel={() => setIsEditingPersonal(false)}
            onSave={() => {
              setIsEditingPersonal(false);
              window.location.reload();
            }}
          />
        ) : (
          <div className={styles.infoGrid}>
            <div>
              <strong>Nom complet</strong>
              <p>{userInfo.first_name} {userInfo.last_name}</p>
            </div>
            <div>
              <strong>Email</strong>
              <p>{userInfo.email}</p>
            </div>
            <div>
              <strong>Téléphone</strong>
              <p>{userInfo.phone || 'Non renseigné'}</p>
            </div>
          </div>
        )}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Informations professionnelles</h2>
          {!isEditingProfessional && (
            <button 
              className={styles.editButton}
              onClick={() => setIsEditingProfessional(true)}
            >
              Modifier
            </button>
          )}
        </div>
        {isEditingProfessional ? (
          <ProfessionalInfoEdit
            info={userInfo}
            onCancel={() => setIsEditingProfessional(false)}
            onSave={() => {
              setIsEditingProfessional(false);
              window.location.reload();
            }}
          />
        ) : (
          <div className={styles.infoGrid}>
            <div>
              <strong>Type de professionnel</strong>
              <p>{userInfo.professional_type || 'Non renseigné'}</p>
            </div>
            <div>
              <strong>Spécialité</strong>
              <p>{userInfo.speciality || 'Non renseigné'}</p>
            </div>
            <div>
              <strong>Numéro RPPS</strong>
              <p>{userInfo.rpps_number || 'Non renseigné'}</p>
            </div>
            <div>
              <strong>Numéro ADELI</strong>
              <p>{userInfo.adeli_number || 'Non renseigné'}</p>
            </div>
            <div>
              <strong>Numéro de certification</strong>
              <p>{userInfo.certification_number || 'Non renseigné'}</p>
            </div>
            <div>
              <strong>Diplôme</strong>
              <p>{userInfo.diploma || 'Non renseigné'}</p>
            </div>
            <div>
              <strong>Années d'expérience</strong>
              <p>{userInfo.years_of_experience || 'Non renseigné'}</p>
            </div>
            <div>
              <strong>Adresse du cabinet</strong>
              <p>
                {userInfo.practice_address ? (
                  <>
                    {userInfo.practice_address}<br />
                    {userInfo.practice_postal_code} {userInfo.practice_city}
                  </>
                ) : (
                  'Non renseigné'
                )}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Services proposés</h2>
        {userInfo.services && userInfo.services.length > 0 ? (
          <div className={styles.servicesGrid}>
            {userInfo.services.map((service) => (
              <div key={service.id} className={styles.serviceCard}>
                <h3>{service.name}</h3>
                <p>{service.description}</p>
                <div className={styles.serviceDetails}>
                  <span>Durée: {service.duration} min</span>
                  <span>Prix: {service.price}€</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>Aucun service n'a été ajouté</p>
        )}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Horaires d'ouverture</h2>
        {userInfo.businessHours && userInfo.businessHours.length > 0 ? (
          <div className={styles.businessHours}>
            {userInfo.businessHours
              .sort((a, b) => a.day - b.day)
              .map((schedule) => (
                <div key={schedule.id} className={styles.daySchedule}>
                  <strong>{days[schedule.day]}</strong>
                  {schedule.is_closed ? (
                    <span>Fermé</span>
                  ) : (
                    <span>
                      {formatTime(schedule.open_time)} - {formatTime(schedule.close_time)}
                    </span>
                  )}
                </div>
              ))}
          </div>
        ) : (
          <p>Aucun horaire n'a été défini</p>
        )}
      </div>

      <div className={styles.actions}>
        <button
          className={styles.submitButton}
          onClick={() => {
            // Marquer l'onboarding comme terminé
            fetch('/api/user/complete-onboarding', {
              method: 'POST',
            }).then(() => {
              router.push('/dashboard');
            });
          }}
        >
          Terminer l'inscription
        </button>
      </div>
    </div>
  );
}
