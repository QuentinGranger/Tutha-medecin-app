'use client';

import { useState, useEffect } from 'react';
import styles from './topbar.module.css';
import { Bell, Search, Settings, ChevronDown, User } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';

export default function TopBar() {
  const { data: session, status } = useSession();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Construction du nom complet
  const userFullName = session?.user 
    ? `${session.user.first_name || ''} ${session.user.last_name || ''}`.trim() || 
      session.user.email?.split('@')[0] || 
      'Utilisateur'
    : 'Utilisateur';

  // Formatage du type professionnel
  const formatProfessionalType = (type: string | null | undefined): string => {
    if (!type) return 'Professionnel de Santé';
    
    const types: { [key: string]: string } = {
      'MEDECIN': 'Médecin',
      'KINESITHERAPEUTE': 'Kinésithérapeute',
      'NUTRITIONNISTE': 'Nutritionniste',
      'COACH': 'Coach Sportif',
      'AUTRE': 'Professionnel de Santé'
    };
    
    return types[type] || type;
  };

  // Construction du rôle avec la spécialité
  const userRole = session?.user?.professional_type 
    ? session.user.speciality
      ? `${formatProfessionalType(session.user.professional_type)} - ${session.user.speciality}`
      : formatProfessionalType(session.user.professional_type)
    : 'Professionnel de Santé';

  // Debug
  console.log('Session:', session?.user);
  console.log('Full Name:', userFullName);
  console.log('Role:', userRole);

  // Utilisation de l'avatar avec gestion des erreurs
  const defaultAvatar = '/images/default-avatar.png';
  const avatarUrl = !imageError && session?.user?.avatar_url ? session.user.avatar_url : defaultAvatar;

  // Reset l'erreur d'image quand l'URL change
  useEffect(() => {
    setImageError(false);
  }, [session?.user?.avatar_url]);

  const notifications = [
    { id: 1, message: "Nouveau message de Dr. Martin", time: "Il y a 5 min" },
    { id: 2, message: "Rendez-vous confirmé avec Sarah", time: "Il y a 30 min" },
    { id: 3, message: "Mise à jour du dossier patient", time: "Il y a 1h" },
  ];

  return (
    <div className={styles.topBar}>
      <div className={styles.searchSection}>
        <div className={styles.searchContainer}>
          <Search className={styles.searchIcon} size={20} />
          <input
            type="text"
            placeholder="Rechercher..."
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.rightSection}>
        <div className={styles.notificationContainer}>
          <button 
            className={styles.iconButton}
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            <span className={styles.notificationBadge}>3</span>
          </button>

          {showNotifications && (
            <div className={styles.notificationDropdown}>
              <div className={styles.notificationHeader}>
                <h3>Notifications</h3>
                <button className={styles.markAllRead}>Tout marquer comme lu</button>
              </div>
              {notifications.map(notif => (
                <div key={notif.id} className={styles.notificationItem}>
                  <div className={styles.notificationContent}>
                    <p>{notif.message}</p>
                    <span>{notif.time}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button className={styles.iconButton}>
          <Settings size={20} />
        </button>

        <div className={styles.profileSection}>
          <button 
            className={styles.profileButton}
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className={styles.profileImage}>
              {imageError ? (
                <div className={styles.fallbackAvatar}>
                  <User size={24} />
                </div>
              ) : (
                <Image
                  src={avatarUrl}
                  alt={`Photo de profil de ${userFullName}`}
                  width={36}
                  height={36}
                  quality={90}
                  priority
                  className={styles.avatarImage}
                  onError={() => setImageError(true)}
                />
              )}
            </div>
            <div className={styles.profileInfo}>
              <span className={styles.profileName}>{userFullName}</span>
              <span className={styles.profileRole}>{userRole}</span>
            </div>
            <ChevronDown size={16} className={styles.chevronIcon} />
          </button>

          {showProfileMenu && (
            <div className={styles.profileDropdown}>
              <a href="/profile" className={styles.dropdownItem}>Mon Profil</a>
              <a href="/settings" className={styles.dropdownItem}>Paramètres</a>
              <a href="/help" className={styles.dropdownItem}>Aide & Support</a>
              <div className={styles.dropdownDivider} />
              <button 
                onClick={() => signOut({ callbackUrl: '/' })}
                className={styles.dropdownItem}
              >
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
