'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { useSession } from 'next-auth/react';

interface Service {
  name: string;
  isCustom: boolean;
}

export default function PratiquePage() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth/signin');
    },
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [showNewServiceForm, setShowNewServiceForm] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [editingService, setEditingService] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');
  const [professionalType, setProfessionalType] = useState<string>('');
  const [businessHours, setBusinessHours] = useState([
    { day: 1, open_time: "09:00", close_time: "17:00", is_closed: false }, // Lundi
    { day: 2, open_time: "09:00", close_time: "17:00", is_closed: false }, // Mardi
    { day: 3, open_time: "09:00", close_time: "17:00", is_closed: false }, // Mercredi
    { day: 4, open_time: "09:00", close_time: "17:00", is_closed: false }, // Jeudi
    { day: 5, open_time: "09:00", close_time: "17:00", is_closed: false }, // Vendredi
    { day: 6, open_time: "09:00", close_time: "17:00", is_closed: true },  // Samedi
    { day: 0, open_time: "09:00", close_time: "17:00", is_closed: true }   // Dimanche
  ]);

  const [address, setAddress] = useState({
    practice_address: '',
    practice_city: '',
    practice_postal_code: ''
  });

  const dayNames = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      loadUserInfo();
    }
  }, [status, session]);

  const loadUserInfo = async () => {
    try {
      setLoading(true);
      
      // Essayer d'abord de récupérer le type professionnel du localStorage
      const savedType = localStorage.getItem('professional_type');
      
      // Charger les infos utilisateur
      const response = await fetch('/api/user/info');
      if (!response.ok) throw new Error('Erreur lors du chargement des informations');
      
      const data = await response.json();
      const professionalType = data.professional_type || savedType;
      
      setProfessionalType(professionalType || '');
      setAddress({
        practice_address: data.practice_address || '',
        practice_city: data.practice_city || '',
        practice_postal_code: data.practice_postal_code || ''
      });
      
      if (professionalType) {
        // Charger les services par défaut
        const defaultServicesResponse = await fetch(`/api/services/default?type=${professionalType}`);
        if (!defaultServicesResponse.ok) throw new Error('Erreur lors du chargement des services par défaut');
        const defaultServices = await defaultServicesResponse.json();
        
        console.log('Services par défaut chargés:', defaultServices);
        
        // Combiner les services existants et par défaut
        const existingServices = data.services?.map((s: any) => ({
          ...s,
          isCustom: true
        })) || [];
        
        const defaultServicesList = defaultServices.map((s: any) => ({
          id: s.id,
          name: s.name,
          description: s.description,
          duration: s.duration,
          price: s.default_price,
          isCustom: false
        }));
        
        setServices([...defaultServicesList, ...existingServices]);
      }
      
      // Charger les horaires d'ouverture s'ils existent
      if (data.businessHours && Array.isArray(data.businessHours) && data.businessHours.length > 0) {
        // Trier les horaires par jour
        const sortedHours = data.businessHours
          .sort((a: any, b: any) => (a.day === 0 ? 7 : a.day) - (b.day === 0 ? 7 : b.day))
          .map((hours: any) => ({
            day: hours.day,
            open_time: hours.open_time || "09:00",
            close_time: hours.close_time || "17:00",
            is_closed: hours.is_closed || false
          }));
        setBusinessHours(sortedHours);
      }

    } catch (error) {
      console.error('Erreur lors du chargement des informations:', error);
      setError('Une erreur est survenue lors du chargement des informations');
    } finally {
      setLoading(false);
    }
  };

  const handleHoursChange = (day: number, field: 'open_time' | 'close_time' | 'is_closed', value: string | boolean) => {
    setBusinessHours(prev => prev.map(hours => {
      if (hours.day === day) {
        return { ...hours, [field]: value };
      }
      return hours;
    }));
  };

  const handleServiceToggle = (serviceName: string) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceName)) {
        return prev.filter(name => name !== serviceName);
      } else {
        return [...prev, serviceName];
      }
    });
  };

  const handleDeleteService = (e: React.MouseEvent, serviceName: string) => {
    e.preventDefault();
    e.stopPropagation();
    setServices(prev => prev.filter(service => service.name !== serviceName));
    setSelectedServices(prev => prev.filter(name => name !== serviceName));
    setError(null);
  };

  const handleAddCustomService = () => {
    if (!newServiceName.trim()) {
      setError('Veuillez entrer un nom pour le service');
      return;
    }

    if (services.some(service => service.name.toLowerCase() === newServiceName.trim().toLowerCase())) {
      setError('Ce service existe déjà');
      setTimeout(() => setError(null), 2000); // Le message disparaît après 2 secondes
      return;
    }

    const newService = { name: newServiceName.trim(), isCustom: true };
    setServices(prev => [...prev, newService]);
    setSelectedServices(prev => [...prev, newService.name]);
    setNewServiceName('');
    setError(null);
  };

  const handleEditService = (serviceName: string) => {
    setEditingService(serviceName);
    setEditedName(serviceName);
    setError(null);
  };

  const handleUpdateService = (oldName: string) => {
    if (!editedName.trim()) {
      setError('Le nom du service ne peut pas être vide');
      return;
    }

    if (services.some(service => service.name.toLowerCase() === editedName.trim().toLowerCase() && service.name !== oldName)) {
      setError('Ce service existe déjà');
      return;
    }

    setServices(prev => prev.map(service => 
      service.name === oldName 
        ? { ...service, name: editedName.trim() }
        : service
    ));
    setSelectedServices(prev => prev.map(name => 
      name === oldName ? editedName.trim() : name
    ));
    setEditingService(null);
    setEditedName('');
    setError(null);
  };

  const handleSubmit = async () => {
    if (selectedServices.length === 0) {
      setError('Veuillez sélectionner au moins un service');
      return;
    }

    try {
      setError(null);

      // Sauvegarder les services sélectionnés
      const response = await fetch('/api/user/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          services: selectedServices,
          businessHours: businessHours,
          address: address
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde');
      }

      // Rediriger vers la page résumé au lieu de la page professionnel
      router.push('/onboarding/resume');
    } catch (error) {
      setError('Une erreur est survenue lors de la sauvegarde');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--gradient-bg)',
        color: 'white'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(255, 255, 255, 0.1)',
            borderTop: '3px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Erreur</h1>
        <p className={styles.subtitle}>{error}</p>
      </div>
    );
  }

  if (!professionalType) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Type professionnel non défini</h1>
        <p className={styles.subtitle}>Veuillez d'abord compléter vos informations professionnelles.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Configurez votre pratique</h1>
      <p className={styles.subtitle}>
        Définissez vos services, horaires et adresse pour que vos patients puissent vous trouver facilement.
      </p>

      <div style={{
        background: 'rgba(0, 0, 0, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem',
        backdropFilter: 'blur(10px)'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'white' }}>Vos services</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          {services.map((service) => (
            <div
              key={service.name}
              onClick={() => handleServiceToggle(service.name)}
              style={{
                background: selectedServices.includes(service.name) ? 'rgba(255, 114, 28, 0.1)' : 'rgba(0, 0, 0, 0.2)',
                border: `1px solid ${selectedServices.includes(service.name) ? '#FF721C' : 'rgba(255, 255, 255, 0.1)'}`,
                borderRadius: '12px',
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                minHeight: '100px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                backdropFilter: 'blur(10px)',
                color: 'white',
                fontSize: '1.1rem',
                transform: selectedServices.includes(service.name) ? 'translateY(-2px)' : 'none',
                boxShadow: selectedServices.includes(service.name) ? '0 4px 12px rgba(255, 114, 28, 0.15)' : 'none'
              }}
            >
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'white' }}>{service.name}</h3>
              {service.isCustom && editingService !== service.name && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingService(service.name);
                    setEditedName(service.name);
                  }}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.6)',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  ✎
                </button>
              )}
            </div>
          ))}
          {!showNewServiceForm ? (
            <div
              onClick={() => setShowNewServiceForm(true)}
              style={{
                background: 'rgba(0, 0, 0, 0.2)',
                border: '2px dashed rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '1.5rem',
                width: '100%',
                minHeight: '100px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'rgba(255, 255, 255, 0.7)',
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(10px)',
                fontSize: '1.1rem'
              }}
            >
              + Ajouter un service
            </div>
          ) : (
            <div style={{
              background: 'rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '1.5rem',
              width: '100%',
              minHeight: '100px',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <input
                type="text"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                placeholder="Nom du service"
                style={{
                  width: '100%',
                  background: 'rgba(0, 0, 0, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  padding: '0.8rem',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
                autoFocus
              />
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => setShowNewServiceForm(false)}
                  style={{
                    background: 'rgba(0, 0, 0, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    if (newServiceName.trim()) {
                      handleAddCustomService();
                      setShowNewServiceForm(false);
                    }
                  }}
                  style={{
                    background: 'var(--accent-gradient)',
                    border: 'none',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  Ajouter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{
        background: 'rgba(0, 0, 0, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem',
        backdropFilter: 'blur(10px)'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'white' }}>Vos horaires d'ouverture</h2>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {businessHours
            .sort((a, b) => (a.day === 0 ? 7 : a.day) - (b.day === 0 ? 7 : b.day))
            .map((hours) => (
            <div key={hours.day} style={{
              display: 'grid',
              gridTemplateColumns: '1fr 2fr 2fr auto',
              gap: '1rem',
              alignItems: 'center',
              padding: '1rem',
              borderRadius: '8px',
              background: 'rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <span style={{ 
                fontWeight: '500', 
                color: 'white',
                fontSize: '1rem'
              }}>
                {dayNames[hours.day]}
              </span>
              <input
                type="time"
                value={hours.open_time}
                onChange={(e) => handleHoursChange(hours.day, 'open_time', e.target.value)}
                disabled={hours.is_closed}
                style={{
                  width: '100%',
                  background: 'rgba(0, 0, 0, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  padding: '0.8rem',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  opacity: hours.is_closed ? '0.5' : '1'
                }}
              />
              <input
                type="time"
                value={hours.close_time}
                onChange={(e) => handleHoursChange(hours.day, 'close_time', e.target.value)}
                disabled={hours.is_closed}
                style={{
                  width: '100%',
                  background: 'rgba(0, 0, 0, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  padding: '0.8rem',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  opacity: hours.is_closed ? '0.5' : '1'
                }}
              />
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: '0.5rem',
                color: 'rgba(255, 255, 255, 0.8)'
              }}>
                <input
                  type="checkbox"
                  checked={hours.is_closed}
                  onChange={(e) => handleHoursChange(hours.day, 'is_closed', e.target.checked)}
                  style={{
                    width: '20px',
                    height: '20px',
                    cursor: 'pointer',
                    accentColor: '#FF721C'
                  }}
                />
                <span>Fermé</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        background: 'rgba(0, 0, 0, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem',
        backdropFilter: 'blur(10px)'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'white' }}>Votre adresse</h2>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', color: 'white', marginBottom: '0.5rem' }}>
              Adresse du cabinet
            </label>
            <input
              type="text"
              value={address.practice_address}
              onChange={(e) => setAddress({ ...address, practice_address: e.target.value })}
              style={{
                width: '100%',
                background: 'rgba(0, 0, 0, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white',
                padding: '0.8rem',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', color: 'white', marginBottom: '0.5rem' }}>
              Ville
            </label>
            <input
              type="text"
              value={address.practice_city}
              onChange={(e) => setAddress({ ...address, practice_city: e.target.value })}
              style={{
                width: '100%',
                background: 'rgba(0, 0, 0, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white',
                padding: '0.8rem',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', color: 'white', marginBottom: '0.5rem' }}>
              Code postal
            </label>
            <input
              type="text"
              value={address.practice_postal_code}
              onChange={(e) => setAddress({ ...address, practice_postal_code: e.target.value })}
              style={{
                width: '100%',
                background: 'rgba(0, 0, 0, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white',
                padding: '0.8rem',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
            />
          </div>
        </div>
      </div>

      <div className={styles.bottomActions}>
        <button
          className={styles.primaryButton}
          onClick={handleSubmit}
        >
          Continuer
        </button>
      </div>

      {error && <p className={styles.bottomMessage}>{error}</p>}

      {editingService && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Modifier le service</h2>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.formGroup}>
                <label>Nom du service</label>
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  placeholder="Ex: Consultation générale"
                />
              </div>
            </div>
            <div className={styles.modalActions}>
              <button
                className={styles.secondaryButton}
                onClick={() => {
                  setEditingService(null);
                  setEditedName('');
                }}
              >
                Annuler
              </button>
              <button
                className={styles.primaryButton}
                onClick={() => handleUpdateService(editingService!)}
                disabled={!editedName.trim()}
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
