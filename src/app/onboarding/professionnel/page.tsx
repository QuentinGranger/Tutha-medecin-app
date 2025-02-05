'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import imageCompression from 'browser-image-compression';
import { PDFDocument } from 'pdf-lib';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import toast from 'react-hot-toast';
import styles from './page.module.css';
import dynamic from 'next/dynamic';
import Image from 'next/image';

// Import dynamique de heic2any côté client uniquement
const heic2any = dynamic(() => import('heic2any'), { ssr: false });

// UserIcon component inline
const UserIcon = ({ className }: { className?: string }) => (
  <svg 
    width="32" 
    height="32" 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M20 21C20 18.2386 16.4183 16 12 16C7.58172 16 4 18.2386 4 21" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

type ProfessionalInfo = {
  professional_type: string;
  speciality: string;
  diploma: string;
  diploma_url: string;
  rpps_number: string;
  adeli_number: string;
  certification_number: string;
  specializations?: string[];
  certifications?: string;
  experience_details?: string;
  years_of_experience: string;
  additional_info: string;
  avatar_url?: string;
  is_remote: boolean;
  phone: string; // Ajout du champ phone
};

type UserInfo = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_type: string;
  role: string;
};

const professionalTypes = [
  'MEDECIN',
  'KINESITHERAPEUTE',
  'NUTRITIONNISTE',
  'COACH',
  'AUTRE'
];

export default function ProfessionalForm() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent(window.location.href));
    },
  });

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    const fetchUserInfo = async () => {
      try {
        // Essayer de charger les données du localStorage d'abord
        const savedData = localStorage.getItem('professionalFormData');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          setFormData(prevData => ({
            ...prevData,
            ...parsedData
          }));
        }

        // Ensuite, charger les données du serveur
        const response = await fetch('/api/user/me');
        if (response.ok) {
          const data = await response.json();
          setUserInfo(data);
          
          // Déterminer le numéro professionnel à afficher
          let professionalNumber = '';
          if (data.professional_type === 'MEDECIN' && data.rpps_number) {
            professionalNumber = data.rpps_number;
          } else if (['KINESITHERAPEUTE', 'NUTRITIONNISTE', 'COACH'].includes(data.professional_type) && data.adeli_number) {
            professionalNumber = data.adeli_number;
          } else if (data.professional_type === 'AUTRE' && data.certification_number) {
            professionalNumber = data.certification_number;
          }

          // Mettre à jour le formulaire avec les données du serveur
          setFormData(prevData => ({
            ...prevData,
            professional_type: data.professional_type || prevData.professional_type,
            speciality: data.speciality || prevData.speciality,
            diploma: data.diploma || prevData.diploma,
            diploma_url: data.diploma_url || prevData.diploma_url,
            certification_number: professionalNumber,
            rpps_number: data.rpps_number || '',
            adeli_number: data.adeli_number || '',
            years_of_experience: data.years_of_experience || prevData.years_of_experience,
            additional_info: data.additional_info || prevData.additional_info,
            is_remote: data.is_remote || prevData.is_remote,
            phone: data.phone || '', // Ajout du champ phone
          }));
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [status]);

  const [formData, setFormData] = useState<ProfessionalInfo>({
    professional_type: '',
    speciality: '',
    diploma: '',
    diploma_url: '',
    rpps_number: '',
    adeli_number: '',
    certification_number: '',
    years_of_experience: '',
    additional_info: '',
    is_remote: false,
    phone: '', // Ajout du champ phone
  });

  // Sauvegarder les données dans localStorage à chaque modification
  useEffect(() => {
    localStorage.setItem('professionalFormData', JSON.stringify(formData));
  }, [formData]);

  const [validationError, setValidationError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const compressImage = async (file: File) => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error('Erreur lors de la compression de l\'image:', error);
      throw error;
    }
  };

  const compressPDF = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Compression des images dans le PDF
      const compressedPdfBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
        objectsPerTick: 50,
      });

      return new File([compressedPdfBytes], file.name, { type: 'application/pdf' });
    } catch (error) {
      console.error('Erreur lors de la compression du PDF:', error);
      throw error;
    }
  };

  const formatProfessionalNumber = (type: string, value: string): string => {
    // Enlever tous les caractères non numériques
    const numbers = value.replace(/\D/g, '');
    
    switch (type) {
      case 'MEDECIN':
        // Format RPPS: XX XXX XXX XXX
        return numbers.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
      case 'KINESITHERAPEUTE':
        // Format ADELI: XXX XXX XXX
        return numbers.replace(/(\d{3})(?=\d)/g, '$1 ').trim();
      default:
        return numbers;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Vérifier si on quitte vraiment la zone de drop
    const rect = dropZoneRef.current?.getBoundingClientRect();
    if (rect) {
      const { clientX, clientY } = e;
      if (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      ) {
        return;
      }
    }
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      await processFile(file);
    }
  };

  const processFile = async (file: File) => {
    setIsUploading(true);
    let processedFile = file;
    if (file.type === 'image/heic' || file.type === 'image/heif') {
      console.log('Conversion HEIC vers JPEG...');
      const conversionResult = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.7
      });
      processedFile = new File([conversionResult], file.name.replace(/\.heic$/i, '.jpg'), {
        type: 'image/jpeg'
      });
    }
    let fileToUpload = processedFile;

    try {
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(fileToUpload.type)) {
        toast.error('Type de fichier non autorisé. Veuillez utiliser un fichier PDF ou une image (JPG, PNG).');
        return;
      }

      if (fileToUpload.size > 5 * 1024 * 1024) {
        if (fileToUpload.type.startsWith('image/')) {
          fileToUpload = await compressImage(fileToUpload);
        } else if (fileToUpload.type === 'application/pdf') {
          fileToUpload = await compressPDF(fileToUpload);
        }
      }

      const formData = new FormData();
      const sanitizedName = fileToUpload.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
      formData.append('file', fileToUpload, `${sanitizedName}.jpg`);
      formData.append('type', 'diploma');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          diploma_url: data.url
        }));
        setUploadedFileName(fileToUpload.name);
      } else {
        toast.error('Échec de l\'upload. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Une erreur est survenue lors du traitement du fichier.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const fileToUpload = file;

    try {
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(fileToUpload.type)) {
        toast.error('Type de fichier non autorisé. Veuillez utiliser un fichier PDF ou une image (JPG, PNG).');
        return;
      }

      // Créer un FormData
      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('type', 'diploma');

      // Envoyer le fichier
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        
        // Mettre à jour le state avec l'URL du diplôme
        setFormData(prev => ({
          ...prev,
          diploma_url: data.url
        }));
        
        setUploadedFileName(fileToUpload.name);
        toast.success('Diplôme uploadé avec succès');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Échec de l\'upload. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Une erreur est survenue lors du traitement du fichier.');
    } finally {
      setIsUploading(false);
    }
  };

  const validateProfessionalNumber = (type: string, number: string): string | null => {
    // Pour les coachs, le numéro n'est pas obligatoire
    if (type === 'COACH') {
      if (!number) return null; // Pas d'erreur si pas de numéro
      // Si un numéro est fourni, il doit respecter le format
      if (number.length < 5 || number.length > 20) {
        return 'Si renseigné, le numéro de certification doit contenir entre 5 et 20 caractères';
      }
      return null;
    }

    if (!number) {
      return 'Le numéro professionnel est requis';
    }

    // Supprimer les espaces du numéro
    const cleanNumber = number.replace(/\s/g, '');

    switch (type) {
      case 'MEDECIN':
        // RPPS doit avoir exactement 11 chiffres
        if (!/^\d{11}$/.test(cleanNumber)) {
          return 'Le numéro RPPS doit contenir exactement 11 chiffres';
        }
        break;
      case 'KINESITHERAPEUTE':
      case 'NUTRITIONNISTE':
        // ADELI doit avoir exactement 9 chiffres
        if (!/^\d{9}$/.test(cleanNumber)) {
          return 'Le numéro ADELI doit contenir exactement 9 chiffres';
        }
        break;
    }

    return null;
  };

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setValidationError(null);

    try {
      // Vérifier les champs obligatoires
      const requiredFields = ['professional_type', 'diploma'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        toast.error('Veuillez remplir tous les champs obligatoires');
        setIsLoading(false);
        return;
      }

      // Vérifier le numéro professionnel selon le type
      let error = null;
      if (formData.professional_type === 'MEDECIN') {
        error = validateProfessionalNumber(formData.professional_type, formData.rpps_number || '');
      } else if (['KINESITHERAPEUTE', 'NUTRITIONNISTE'].includes(formData.professional_type)) {
        error = validateProfessionalNumber(formData.professional_type, formData.adeli_number || '');
      } else if (formData.professional_type === 'COACH' && formData.certification_number) {
        // Vérifier le numéro de certification seulement s'il est fourni
        error = validateProfessionalNumber(formData.professional_type, formData.certification_number);
      }
      
      if (error) {
        toast.error(error);
        setIsLoading(false);
        return;
      }

      // Formater les données avant l'envoi
      const dataToSend = {
        ...formData,
        rpps_number: formData.professional_type === 'MEDECIN' ? formData.rpps_number?.replace(/\s/g, '') : null,
        adeli_number: ['KINESITHERAPEUTE', 'NUTRITIONNISTE'].includes(formData.professional_type) 
          ? formData.adeli_number?.replace(/\s/g, '') 
          : null,
        certification_number: formData.professional_type === 'COACH' 
          ? formData.certification_number?.replace(/\s/g, '') 
          : null,
      };

      // Envoyer les données
      const response = await fetch('/api/user/professional-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Une erreur est survenue');
      }

      // Mettre à jour l'étape d'onboarding
      const stepResponse = await fetch('/api/user/onboarding-step', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ step: '/onboarding/pratique' }),
      });

      if (!stepResponse.ok) {
        const errorData = await stepResponse.json();
        throw new Error(errorData.error || 'Une erreur est survenue lors de la mise à jour de l\'étape');
      }

      // Sauvegarder le type professionnel dans localStorage
      localStorage.setItem('professional_type', formData.professional_type);

      // Redirection vers la prochaine étape
      router.push('/onboarding/pratique');
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState<string>('');
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 100,
    height: 100,
    x: 0,
    y: 0,
    aspect: 1
  });
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Liste des formats supportés
  const SUPPORTED_FORMATS = {
    'image/jpeg': 'JPEG',
    'image/jpg': 'JPG',
    'image/png': 'PNG',
    'image/heic': 'HEIC',
    'image/heif': 'HEIF',
    'image/webp': 'WEBP',
    'image/gif': 'GIF',
    'image/bmp': 'BMP',
    'image/tiff': 'TIFF'
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérification du format
    if (!Object.keys(SUPPORTED_FORMATS).includes(file.type)) {
      toast.error(`Ce format d'image n'est pas supporté.\n\nFormats acceptés :\n- JPG/JPEG\n- PNG\n- HEIC/HEIF (iPhone)\n- WebP\n- GIF\n- BMP\n- TIFF`);
      return;
    }

    try {
      setIsUploadingAvatar(true);
      
      // Conversion HEIC/HEIF si nécessaire
      let processedFile = file;
      if (file.type === 'image/heic' || file.type === 'image/heif') {
        try {
          const conversionResult = await heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.7
          });
          processedFile = new File([conversionResult], file.name.replace(/\.heic$/i, '.jpg'), {
            type: 'image/jpeg'
          });
        } catch (error) {
          toast.error('Impossible de convertir votre image HEIC/HEIF. Veuillez réessayer avec une image JPG ou PNG.');
          setIsUploadingAvatar(false);
          return;
        }
      }

      // Créer une URL temporaire pour l'aperçu
      const tempUrl = URL.createObjectURL(processedFile);
      setTempImageUrl(tempUrl);
      
      // Ouvrir la modal de recadrage
      setShowCropModal(true);
      
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(`Désolé, une erreur est survenue lors du traitement de votre image ${SUPPORTED_FORMATS[file.type]}.\n\nEssayez avec un autre format comme JPG ou PNG.`);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const getCroppedImg = (
    image: HTMLImageElement,
    crop: Crop,
    fileName: string
  ): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      // Calculer les dimensions du canvas
      canvas.width = Math.floor(crop.width * scaleX);
      canvas.height = Math.floor(crop.height * scaleY);

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('No 2d context'));
        return;
      }

      // Calculer les coordonnées de recadrage
      const cropX = crop.x * scaleX;
      const cropY = crop.y * scaleY;
      const cropWidth = crop.width * scaleX;
      const cropHeight = crop.height * scaleY;

      // Définir la qualité de rendu
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Dessiner l'image recadrée
      ctx.drawImage(
        image,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        canvas.width,
        canvas.height
      );

      // Convertir en blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob'));
            return;
          }
          resolve(blob);
        },
        'image/jpeg',
        0.95
      );
    });
  };

  const handleCropComplete = async () => {
    if (!imgRef.current) return;

    try {
      setIsUploadingAvatar(true);

      // S'assurer que l'image est chargée
      if (!imgRef.current.complete) {
        await new Promise((resolve) => {
          imgRef.current!.onload = resolve;
        });
      }

      // Recadrer l'image
      const croppedImage = await getCroppedImg(imgRef.current, crop, 'avatar.jpg');
      
      // Compresser l'image
      const compressedFile = await imageCompression(
        new File([croppedImage], "avatar.jpg", { type: 'image/jpeg' }), 
        {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 800,
          useWebWorker: true
        }
      );

      // Préparer et envoyer le fichier
      const formData = new FormData();
      formData.append('file', compressedFile, 'avatar.jpg');
      formData.append('type', 'avatar');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setAvatarUrl(data.url);
      
      // Fermer la modal et nettoyer
      setShowCropModal(false);
      URL.revokeObjectURL(tempImageUrl);
      setTempImageUrl('');

    } catch (error) {
      console.error('Error:', error);
      toast.error('Une erreur est survenue lors du traitement de l\'image.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const crop = centerAspectCrop(width, height, 1);
    setCrop(crop);
  };

  const centerAspectCrop = (mediaWidth: number, mediaHeight: number, aspect: number) => {
    const width = 90;
    const height = width / aspect;
    const x = (100 - width) / 2;
    const y = (100 - height) / 2;

    return {
      unit: '%',
      width,
      height,
      x,
      y,
      aspect
    } as Crop;
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user/me');
        if (response.ok) {
          const data = await response.json();
          if (data.avatar_url) {
            setAvatarUrl(data.avatar_url);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.formSection}>
        <div className={styles.avatarSection}>
          <div 
            className={styles.avatarContainer}
            onClick={() => avatarInputRef.current?.click()}
          >
            <div className={styles.avatarWrapper}>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className={styles.avatarImage}
                />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  <UserIcon />
                  <span>Ajouter une photo</span>
                </div>
              )}
              <div className={styles.avatarOverlay}>
                <span>Changer la photo</span>
              </div>
            </div>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className={styles.hiddenInput}
            ref={avatarInputRef}
          />
        </div>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="professional_type">Type de professionnel *</label>
            <select
              id="professional_type"
              name="professional_type"
              value={formData.professional_type}
              onChange={handleInputChange}
              required
            >
              <option value="">Sélectionnez votre profession</option>
              {professionalTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="speciality">Spécialité</label>
            <input
              type="text"
              id="speciality"
              name="speciality"
              value={formData.speciality}
              onChange={handleInputChange}
              placeholder="Ex: Cardiologie, Médecine du sport..."
            />
          </div>

          <div className={styles.formGroup}>
            <label>Diplôme *</label>
            <div className={styles.diplomaContainer}>
              <input
                type="text"
                id="diploma"
                name="diploma"
                value={formData.diploma}
                onChange={handleInputChange}
                required
                placeholder="Nom de votre diplôme"
                className={styles.diplomaInput}
              />

              <div
                ref={dropZoneRef}
                className={`${styles.dropZone} ${isDragging ? styles.dragging : ''}`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="diploma_file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf,.jpg,.jpeg,.png"
                  style={{ display: 'none' }}
                />
                <div className={styles.dropZoneContent}>
                  {isUploading ? (
                    <div className={styles.uploadingState}>
                      <div className={styles.spinner}></div>
                      <span>Traitement du fichier...</span>
                    </div>
                  ) : uploadedFileName ? (
                    <div className={styles.fileInfo}>
                      <span className={styles.fileName}>{uploadedFileName}</span>
                      <button
                        type="button"
                        className={styles.changeFile}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Changer le fichier
                      </button>
                      {formData.diploma_url && (
                        <a
                          href={formData.diploma_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.viewFile}
                        >
                          Voir le fichier
                        </a>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className={styles.dropIcon}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 16V8M12 8L9 11M12 8L15 11M13 15L15.7929 12.2071C16.1834 11.8166 16.8166 11.8166 17.2071 12.2071L20 15M13 15L15.25 17.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M3 15V16C3 17.8856 3 18.8284 3.58579 19.4142C4.17157 20 5.11438 20 7 20H17C18.8856 20 19.8284 20 20.4142 19.4142C21 18.8284 21 17.8856 21 16V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <div className={styles.dropText}>
                        <span>Glissez votre fichier ici ou</span>
                        <button
                          type="button"
                          className={styles.browseButton}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          parcourir
                        </button>
                      </div>
                      <div className={styles.fileTypes}>PDF, JPG, PNG (max 5MB)</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {formData.professional_type === 'MEDECIN' && (
            <div className={styles.formGroup}>
              <label htmlFor="rpps_number">Numéro RPPS *</label>
              <input
                type="text"
                id="rpps_number"
                name="rpps_number"
                value={formData.rpps_number || ''}
                onChange={(e) => {
                  // Ne garder que les chiffres
                  const value = e.target.value.replace(/[^\d]/g, '');
                  // Limiter à 11 chiffres
                  if (value.length <= 11) {
                    // Formatter avec des espaces tous les 3 chiffres
                    const formatted = value.replace(/(\d{3})/g, '$1 ').trim();
                    setFormData(prev => ({
                      ...prev,
                      rpps_number: formatted
                    }));
                  }
                }}
                placeholder="Ex: 123 456 789 10"
                required
                className={styles.input}
              />
              <small className={styles.hint}>Le numéro RPPS doit contenir 11 chiffres</small>
            </div>
          )}

          {['KINESITHERAPEUTE', 'NUTRITIONNISTE'].includes(formData.professional_type) && (
            <div className={styles.formGroup}>
              <label htmlFor="adeli_number">Numéro ADELI *</label>
              <input
                type="text"
                id="adeli_number"
                name="adeli_number"
                value={formData.adeli_number || ''}
                onChange={(e) => {
                  // Ne garder que les chiffres
                  const value = e.target.value.replace(/[^\d]/g, '');
                  // Limiter à 9 chiffres
                  if (value.length <= 9) {
                    // Formatter avec des espaces tous les 3 chiffres
                    const formatted = value.replace(/(\d{3})/g, '$1 ').trim();
                    setFormData(prev => ({
                      ...prev,
                      adeli_number: formatted
                    }));
                  }
                }}
                placeholder="Ex: 123 456 789"
                required
                className={styles.input}
              />
              <small className={styles.hint}>Le numéro ADELI doit contenir 9 chiffres</small>
            </div>
          )}

          {formData.professional_type === 'COACH' && (
            <div className={styles.formGroup}>
              <label htmlFor="certification_number">Numéro de certification</label>
              <input
                type="text"
                id="certification_number"
                name="certification_number"
                value={formData.certification_number || ''}
                onChange={handleInputChange}
                placeholder="Votre numéro de certification"
                className={styles.input}
              />
              <small className={styles.hint}>Le numéro de certification doit contenir entre 5 et 20 caractères</small>
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="phone">Numéro de téléphone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Ex: 06 12 34 56 78"
              pattern="[0-9\s]{10,}"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="years_of_experience">Années d&apos;expérience *</label>
            <input
              type="number"
              id="years_of_experience"
              name="years_of_experience"
              value={formData.years_of_experience}
              onChange={handleInputChange}
              placeholder="Nombre d'années d'expérience"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="additional_info">Bio</label>
            <textarea
              id="additional_info"
              name="additional_info"
              value={formData.additional_info}
              onChange={handleInputChange}
              placeholder="Parlez-nous de votre expérience et de votre approche..."
              rows={4}
              className={styles.textarea}
            />
          </div>

          <div className={styles.buttonGroup}>
            <button type="submit" className={styles.submitButton} disabled={isLoading}>
              Finaliser mon profil
            </button>
          </div>
        </form>
      </div>

      {showCropModal && (
        <div className={styles.cropModal}>
          <div className={styles.cropModalContent}>
            <h3>Recadrer votre photo</h3>
            <div className={styles.cropContainer}>
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                aspect={1}
                className={styles.cropTool}
              >
                <img
                  ref={imgRef}
                  src={tempImageUrl}
                  onLoad={onImageLoad}
                  alt="Image à recadrer"
                />
              </ReactCrop>
            </div>
            <div className={styles.cropActions}>
              <button
                onClick={() => {
                  setShowCropModal(false);
                  setTempImageUrl('');
                }}
                className={styles.cancelButton}
              >
                Annuler
              </button>
              <button
                onClick={handleCropComplete}
                className={styles.confirmButton}
              >
                Valider
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
