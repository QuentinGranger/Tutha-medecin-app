'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './topbar.module.css';
import { Bell, Search, ChevronDown, User } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';

// Types pour les notifications
type NotificationType = 'message' | 'appointment' | 'update' | 'alert' | 'prescription';

interface Notification {
  id: number;
  title: string;
  time: string;
  type: NotificationType;
  read: boolean;
  priority?: 'high' | 'normal';
}

export default function TopBar() {
  const { data: session } = useSession();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('/default-avatar.png');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Simuler l'arrivée de nouvelles notifications
  useEffect(() => {
    const initialNotifications: Notification[] = [
      {
        id: 1,
        title: "Nouveau message urgent du Dr. Sophie Martin",
        time: "À l'instant",
        type: "message",
        read: false,
        priority: "high"
      },
      {
        id: 2,
        title: "RDV confirmé - Patient: Jean Dupont, 14:30",
        time: "Il y a 5 min",
        type: "appointment",
        read: false
      },
      {
        id: 3,
        title: "Nouvelle prescription à valider",
        time: "Il y a 15 min",
        type: "prescription",
        read: false
      },
      {
        id: 4,
        title: "Mise à jour du dossier médical - Sarah Bernard",
        time: "Il y a 30 min",
        type: "update",
        read: true
      }
    ];

    setNotifications(initialNotifications);
    updateUnreadCount(initialNotifications);

    // Simuler l'arrivée de nouvelles notifications
    const interval = setInterval(() => {
      const newNotification: Notification = {
        id: Date.now(),
        title: getRandomNotification(),
        time: "À l'instant",
        type: getRandomType(),
        read: false,
        priority: Math.random() > 0.8 ? "high" : "normal"
      };

      setNotifications(prev => {
        const updated = [newNotification, ...prev.slice(0, 8)]; // Garder max 9 notifications
        updateUnreadCount(updated);
        return updated;
      });
    }, 45000); // Nouvelle notification toutes les 45 secondes

    return () => clearInterval(interval);
  }, []);

  const updateUnreadCount = (notifs: Notification[]) => {
    setUnreadCount(notifs.filter(n => !n.read).length);
  };

  const getRandomType = (): NotificationType => {
    const types: NotificationType[] = ['message', 'appointment', 'update', 'alert', 'prescription'];
    return types[Math.floor(Math.random() * types.length)];
  };

  const getRandomNotification = (): string => {
    const notifications = [
      "Nouveau message du Dr. Thomas concernant un patient",
      "Demande de consultation urgente - Patient: Marie Martin",
      "Rappel: Réunion d'équipe dans 30 minutes",
      "Nouveau résultat d'analyse disponible",
      "Mise à jour du protocole de traitement",
      "Demande d'avis médical du Dr. Laurent",
      "Nouvelle note ajoutée au dossier patient #2847",
      "Modification d'horaire pour le RDV de 15h"
    ];
    return notifications[Math.floor(Math.random() * notifications.length)];
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch(type) {
      case 'message':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'appointment':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'prescription':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 16H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 2H19C20.1046 2 21 2.89543 21 4V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V4C3 2.89543 3.89543 2 5 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
    }
  };

  const toggleNotifications = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      setShowProfileMenu(false);
    }
  };

  const toggleProfileMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowProfileMenu(!showProfileMenu);
    if (!showProfileMenu) {
      setShowNotifications(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current && 
        profileRef.current && 
        !notificationRef.current.contains(event.target as Node) && 
        !profileRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (session?.user?.avatar_url) {
      setAvatarUrl(session.user.avatar_url);
    }
  }, [session?.user?.avatar_url]);

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

  // Reset l'erreur d'image quand l'URL change
  useEffect(() => {
    setImageError(false);
  }, [session?.user?.avatar_url]);

  return (
    <div className={styles.topBar}>
      <div className={styles.searchSection}>
        <div className={styles.searchContainer}>
          <div className={styles.searchBar}>
            <Search className={styles.searchIcon} size={20} />
            <input 
              type="text" 
              className={styles.searchInput}
              placeholder="Rechercher..." 
            />
          </div>
        </div>
      </div>

      <div className={styles.rightSection}>
        <div className={styles.notificationSection} ref={notificationRef}>
          {notifications.length > 0 && (
            <div className={styles.lastNotification}>
              {notifications[0].title}
            </div>
          )}
          <button 
            className={`${styles.iconButton} ${showNotifications ? styles.active : ''}`}
            onClick={toggleNotifications}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className={styles.notificationBadge}>{unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className={styles.notificationDropdown} onClick={e => e.stopPropagation()}>
              <div className={styles.notificationHeader}>
                <h3>
                  Notifications
                  {unreadCount > 0 && (
                    <span className={styles.notificationCount}>{unreadCount} nouvelle{unreadCount > 1 ? 's' : ''}</span>
                  )}
                </h3>
                {unreadCount > 0 && (
                  <button className={styles.markAllRead} onClick={markAllAsRead}>
                    Tout marquer comme lu
                  </button>
                )}
              </div>
              <div className={styles.notificationList}>
                {notifications.length > 0 ? (
                  notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      className={`${styles.notificationItem} ${notif.priority === 'high' ? styles.highPriority : ''}`}
                    >
                      <div className={styles.notificationIcon}>
                        {getNotificationIcon(notif.type)}
                      </div>
                      <div className={styles.notificationContent}>
                        <p className={styles.notificationTitle}>{notif.title}</p>
                        <span className={styles.notificationTime}>
                          {notif.time}
                          {!notif.read && <span className={styles.notificationDot} />}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyNotifications}>
                    <div className={styles.emptyNotificationsIcon}>
                      <Bell size={48} />
                    </div>
                    <p>Aucune notification</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className={styles.profileSection} ref={profileRef}>
          <button 
            className={styles.profileButton}
            onClick={toggleProfileMenu}
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
              <div className={styles.dropdownHeader}>
                <div className={styles.dropdownUserInfo}>
                  <div className={styles.dropdownAvatar}>
                    {imageError ? (
                      <div className={styles.fallbackAvatar}>
                        <User size={24} />
                      </div>
                    ) : (
                      <Image
                        src={avatarUrl}
                        alt={`Photo de profil de ${userFullName}`}
                        width={48}
                        height={48}
                        quality={90}
                        className={styles.avatarImage}
                        onError={() => setImageError(true)}
                      />
                    )}
                  </div>
                  <div>
                    <p className={styles.dropdownUserName}>{userFullName}</p>
                    <p className={styles.dropdownUserRole}>{userRole}</p>
                  </div>
                </div>
              </div>
              <a href="/profile" className={styles.dropdownItem}>
                <User size={18} />
                Mon Profil
              </a>
              <a href="/help" className={styles.dropdownItem}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 17H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Aide & Support
              </a>
              <div className={styles.dropdownDivider} />
              <button 
                onClick={() => signOut({ callbackUrl: '/' })}
                className={`${styles.dropdownItem} ${styles.logoutItem}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
