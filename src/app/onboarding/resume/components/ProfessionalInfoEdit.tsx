'use client';

import { useState } from 'react';
import styles from '../page.module.css';

interface ProfessionalInfo {
  profession: string;
  rpps?: string;
  adeli?: string;
  finess?: string;
  yearsOfExperience?: number;
}

interface ProfessionalInfoEditProps {
  info: ProfessionalInfo;
  onSave: (info: ProfessionalInfo) => Promise<void>;
  onCancel: () => void;
}

export default function ProfessionalInfoEdit({ info, onSave, onCancel }: ProfessionalInfoEditProps) {
  const [formData, setFormData] = useState<ProfessionalInfo>(info);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'yearsOfExperience' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.editForm}>
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label htmlFor="profession">Profession</label>
          <input
            type="text"
            id="profession"
            name="profession"
            value={formData.profession}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="rpps">Numéro RPPS</label>
          <input
            type="text"
            id="rpps"
            name="rpps"
            value={formData.rpps || ''}
            onChange={handleChange}
            placeholder="Optionnel"
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="adeli">Numéro ADELI</label>
          <input
            type="text"
            id="adeli"
            name="adeli"
            value={formData.adeli || ''}
            onChange={handleChange}
            placeholder="Optionnel"
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="finess">Numéro FINESS</label>
          <input
            type="text"
            id="finess"
            name="finess"
            value={formData.finess || ''}
            onChange={handleChange}
            placeholder="Optionnel"
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="yearsOfExperience">Années d&apos;expérience</label>
          <input
            type="number"
            id="yearsOfExperience"
            name="yearsOfExperience"
            value={formData.yearsOfExperience || ''}
            onChange={handleChange}
            min="0"
            placeholder="Optionnel"
          />
        </div>
      </div>
      <div className={styles.formActions}>
        <button 
          type="button" 
          onClick={onCancel}
          className={styles.cancelButton}
          disabled={isLoading}
        >
          Annuler
        </button>
        <button 
          type="submit" 
          className={styles.saveButton}
          disabled={isLoading}
        >
          {isLoading ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  );
}
