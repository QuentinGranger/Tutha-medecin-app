'use client';

import { useState } from 'react';
import styles from '../page.module.css';
import toast from 'react-hot-toast';

interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface PersonalInfoEditProps {
  info: PersonalInfo;
  onCancel: () => void;
  onSave: () => void;
}

export default function PersonalInfoEdit({ info, onCancel, onSave }: PersonalInfoEditProps) {
  const [formData, setFormData] = useState({
    firstName: info.firstName || '',
    lastName: info.lastName || '',
    email: info.email || '',
    phone: info.phone || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('Envoi des données:', formData);
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la mise à jour');
      }

      const data = await response.json();
      console.log('Réponse du serveur:', data);

      toast.success('Informations mises à jour avec succès');
      onSave();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors de la mise à jour des informations');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label htmlFor="firstName">Prénom</label>
        <input
          type="text"
          id="firstName"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="lastName">Nom</label>
        <input
          type="text"
          id="lastName"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="phone">Téléphone</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Ex: 06 12 34 56 78"
          pattern="[0-9\s]{10,}"
        />
      </div>

      <div className={styles.buttonGroup}>
        <button type="button" onClick={onCancel} className={styles.cancelButton}>
          Annuler
        </button>
        <button type="submit" className={styles.saveButton}>
          Enregistrer
        </button>
      </div>
    </form>
  );
}
