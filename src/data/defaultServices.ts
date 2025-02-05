interface DefaultService {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
}

type ServicesMap = {
  [key: string]: DefaultService[];
};

export const defaultServices: ServicesMap = {
  MEDECIN: [
    {
      id: '1',
      name: 'Consultation générale',
      description: 'Consultation médicale complète pour évaluer votre état de santé général',
      duration: 30,
      price: 60
    },
    {
      id: '2',
      name: 'Suivi sportif',
      description: 'Suivi médical spécialisé pour les athlètes et sportifs',
      duration: 45,
      price: 80
    },
    {
      id: '3',
      name: 'Certificat médical',
      description: 'Délivrance de certificat médical pour la pratique sportive',
      duration: 20,
      price: 40
    },
    {
      id: '4',
      name: 'Bilan de santé approfondi',
      description: 'Bilan complet avec examens et recommandations personnalisées',
      duration: 90,
      price: 120
    },
    {
      id: '5',
      name: 'Consultation traumatologie',
      description: 'Consultation spécialisée pour les blessures sportives',
      duration: 45,
      price: 90
    }
  ],
  KINESITHERAPEUTE: [
    {
      id: '1',
      name: 'Séance de kinésithérapie',
      description: 'Séance standard de rééducation et de thérapie manuelle',
      duration: 45,
      price: 65
    },
    {
      id: '2',
      name: 'Massage sportif',
      description: 'Massage thérapeutique adapté aux sportifs',
      duration: 60,
      price: 80
    },
    {
      id: '3',
      name: 'Rééducation post-blessure',
      description: 'Programme de rééducation personnalisé après une blessure',
      duration: 45,
      price: 70
    },
    {
      id: '4',
      name: 'Drainage lymphatique',
      description: 'Technique manuelle pour améliorer la circulation',
      duration: 60,
      price: 75
    },
    {
      id: '5',
      name: 'Thérapie posturale',
      description: 'Correction posturale et exercices de renforcement',
      duration: 45,
      price: 65
    }
  ],
  NUTRITIONNISTE: [
    {
      id: '1',
      name: 'Bilan nutritionnel',
      description: 'Analyse complète des habitudes alimentaires et objectifs',
      duration: 90,
      price: 90
    },
    {
      id: '2',
      name: 'Suivi nutritionnel',
      description: 'Consultation de suivi et ajustement du plan alimentaire',
      duration: 45,
      price: 70
    },
    {
      id: '3',
      name: 'Plan alimentaire sportif',
      description: 'Programme nutritionnel adapté aux objectifs sportifs',
      duration: 60,
      price: 95
    },
    {
      id: '4',
      name: 'Coaching perte de poids',
      description: 'Accompagnement personnalisé pour la perte de poids',
      duration: 45,
      price: 75
    },
    {
      id: '5',
      name: 'Atelier nutrition pratique',
      description: 'Session éducative sur la préparation des repas',
      duration: 120,
      price: 120
    }
  ],
  COACH: [
    {
      id: '1',
      name: 'Séance personnalisée',
      description: 'Entraînement individuel adapté à vos objectifs',
      duration: 60,
      price: 70
    },
    {
      id: '2',
      name: 'Bilan forme physique',
      description: 'Évaluation complète de votre condition physique',
      duration: 90,
      price: 100
    },
    {
      id: '3',
      name: 'Programme personnalisé',
      description: 'Création d\'un programme d\'entraînement sur mesure',
      duration: 60,
      price: 85
    },
    {
      id: '4',
      name: 'Coaching performance',
      description: 'Accompagnement pour athlètes et sportifs confirmés',
      duration: 75,
      price: 95
    },
    {
      id: '5',
      name: 'Préparation physique',
      description: 'Séance de préparation physique spécifique',
      duration: 60,
      price: 80
    }
  ],
  AUTRE: [
    {
      id: '1',
      name: 'Consultation standard',
      description: 'Consultation générale adaptée à votre spécialité',
      duration: 45,
      price: 60
    },
    {
      id: '2',
      name: 'Bilan initial',
      description: 'Premier rendez-vous et évaluation complète',
      duration: 60,
      price: 80
    },
    {
      id: '3',
      name: 'Suivi régulier',
      description: 'Séance de suivi et d\'accompagnement',
      duration: 45,
      price: 65
    },
    {
      id: '4',
      name: 'Séance spécialisée',
      description: 'Intervention spécifique selon votre domaine',
      duration: 60,
      price: 85
    },
    {
      id: '5',
      name: 'Consultation express',
      description: 'Séance courte pour un besoin ponctuel',
      duration: 30,
      price: 45
    }
  ]
};
