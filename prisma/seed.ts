const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Services par défaut
  const defaultServices = [
    // Kinésithérapeute
    {
      professional_type: 'KINESITHERAPEUTE',
      name: 'Séance de kinésithérapie standard',
      description: 'Séance de base incluant bilan et traitement',
      duration: 30,
      default_price: 50
    },
    {
      professional_type: 'KINESITHERAPEUTE',
      name: 'Rééducation post-opératoire',
      description: 'Séance spécialisée pour la récupération après chirurgie',
      duration: 45,
      default_price: 65
    },
    {
      professional_type: 'KINESITHERAPEUTE',
      name: 'Drainage lymphatique',
      description: 'Technique manuelle pour améliorer la circulation',
      duration: 60,
      default_price: 70
    },

    // Médecin du sport
    {
      professional_type: 'MEDECIN',
      name: 'Consultation standard',
      description: 'Examen clinique complet et diagnostic',
      duration: 30,
      default_price: 80
    },
    {
      professional_type: 'MEDECIN',
      name: 'Visite médicale de non contre-indication',
      description: 'Certificat médical pour la pratique sportive',
      duration: 20,
      default_price: 50
    },
    {
      professional_type: 'MEDECIN',
      name: 'Suivi blessure sportive',
      description: 'Consultation de suivi pour blessure existante',
      duration: 30,
      default_price: 70
    },

    // Coach sportif
    {
      professional_type: 'COACH',
      name: 'Séance individuelle',
      description: 'Entraînement personnalisé one-to-one',
      duration: 60,
      default_price: 70
    },
    {
      professional_type: 'COACH',
      name: 'Bilan forme et objectifs',
      description: 'Évaluation complète et plan personnalisé',
      duration: 90,
      default_price: 100
    },
    {
      professional_type: 'COACH',
      name: 'Programme de réathlétisation',
      description: 'Retour progressif à l\'activité après blessure',
      duration: 45,
      default_price: 60
    },

    // Nutritionniste
    {
      professional_type: 'NUTRITIONNISTE',
      name: 'Consultation initiale',
      description: 'Bilan complet et plan alimentaire personnalisé',
      duration: 60,
      default_price: 80
    },
    {
      professional_type: 'NUTRITIONNISTE',
      name: 'Suivi nutritionnel',
      description: 'Ajustement du plan et des objectifs',
      duration: 30,
      default_price: 45
    },
    {
      professional_type: 'NUTRITIONNISTE',
      name: 'Plan nutrition sport spécifique',
      description: 'Adaptation nutritionnelle pour objectif sportif',
      duration: 45,
      default_price: 65
    }
  ];

  // Création des services par défaut
  await prisma.defaultService.deleteMany();
  
  for (const service of defaultServices) {
    await prisma.defaultService.create({
      data: service
    });
  }

  // Supprimer toutes les données existantes
  await prisma.patientRecommendation.deleteMany();
  await prisma.patient.deleteMany();

  const patients = [
    {
      name: 'Rocky Balboa',
      sport: 'Boxe',
      injury: 'Dégâts cérébraux légers',
      photo_url: '/img/patients/rocky.jpg',
      recommendations: {
        MEDECIN: ['Surveillance neurologique régulière', 'éviter les impacts'],
        KINESITHERAPEUTE: ['Travail proprioceptif', 'coordination'],
        NUTRITIONNISTE: ['Anti-inflammatoires naturels', 'hydratation optimale'],
        COACH: ['Réduction des sparrings']
      }
    },
    {
      name: 'Tsubasa Ozora',
      sport: 'Football',
      injury: 'Entorse de la cheville',
      photo_url: '/img/patients/tsubasa.jpg',
      recommendations: {
        MEDECIN: ['Immobilisation initiale', 'évolution des appuis'],
        KINESITHERAPEUTE: ['Rééducation articulaire', 'proprioception'],
        NUTRITIONNISTE: ['Supplémentation en collagène', 'réduction des inflammations'],
        COACH: ['Réintégration progressive des courses']
      }
    },
    {
      name: 'Hanamichi Sakuragi',
      sport: 'Basketball',
      injury: 'Rupture des ligaments croisés',
      photo_url: '/img/patients/sakuragi.jpg',
      recommendations: {
        MEDECIN: ['Suivi post-opératoire'],
        KINESITHERAPEUTE: ['Renforcement musculaire', 'proprioception avancée'],
        NUTRITIONNISTE: ['Augmentation de la synthèse protéique'],
        COACH: ['Plan de retour à la compétition graduelle']
      }
    },
    {
      name: 'Ryo Ishizaki',
      sport: 'Football',
      injury: 'Fracture de la clavicule',
      photo_url: '/img/patients/ishizaki.jpg',
      recommendations: {
        MEDECIN: ['Radiographies régulières', 'consolidation osseuse'],
        KINESITHERAPEUTE: ['Mobilité de l\'épaule post-immobilisation'],
        NUTRITIONNISTE: ['Apport élevé en calcium et vitamine D'],
        COACH: ['Réduction des contacts jusqu\'à cicatrisation totale']
      }
    },
    {
      name: 'Seiya',
      sport: 'Combat',
      injury: 'Fractures multiples',
      photo_url: '/img/patients/seiya.jpg',
      recommendations: {
        MEDECIN: ['Suivi médical rigoureux'],
        KINESITHERAPEUTE: ['Travail articulaire post-fractures'],
        NUTRITIONNISTE: ['Régime hypercalorique pour la réparation tissulaire'],
        COACH: ['Suspension des combats', 'reconditionnement physique']
      }
    },
    {
      name: 'Ippo Makunouchi',
      sport: 'Boxe',
      injury: 'Commotions cérébrales répétées',
      photo_url: '/img/patients/ippo.jpg',
      recommendations: {
        MEDECIN: ['Examens neurologiques réguliers'],
        KINESITHERAPEUTE: ['Travail de coordination et équilibre'],
        NUTRITIONNISTE: ['Alimentation riche en oméga-3 et antioxydants'],
        COACH: ['Diminution des impacts', 'évitement des KO']
      }
    },
    {
      name: 'Takumi Fujiwara',
      sport: 'Course automobile',
      injury: 'Fracture du tibia',
      photo_url: '/img/patients/takumi.jpg',
      recommendations: {
        MEDECIN: ['Suivi consolidation osseuse'],
        KINESITHERAPEUTE: ['Mobilisation progressive', 'travail des appuis'],
        NUTRITIONNISTE: ['Renforcement osseux par une diète adaptée'],
        COACH: ['Adaptation de la posture de conduite']
      }
    },
    {
      name: 'Shoyo Hinata',
      sport: 'Volleyball',
      injury: 'Douleurs lombaires',
      photo_url: '/img/patients/hinata.jpg',
      recommendations: {
        MEDECIN: ['Examen postural et radiographies'],
        KINESITHERAPEUTE: ['Renforcement du tronc et mobilité'],
        NUTRITIONNISTE: ['Anti-inflammatoires naturels'],
        COACH: ['Correction de la posture de saut', 'répartition des impacts']
      }
    },
    {
      name: 'Speed Racer',
      sport: 'Course automobile',
      injury: 'Fracture du poignet',
      photo_url: '/img/patients/speed.jpg',
      recommendations: {
        MEDECIN: ['Immobilisation et suivi post-trauma'],
        KINESITHERAPEUTE: ['Rééducation fine de la motricité'],
        NUTRITIONNISTE: ['Supplémentation en magnésium et vitamine D'],
        COACH: ['Adaptation du grip au volant']
      }
    },
    {
      name: 'Bruce Wayne',
      sport: 'Arts martiaux',
      injury: 'Blessures multiples (combat)',
      photo_url: '/img/patients/batman.jpg',
      recommendations: {
        MEDECIN: ['Bilans complets après chaque mission'],
        KINESITHERAPEUTE: ['Programme de récupération intensif'],
        NUTRITIONNISTE: ['Supplémentation pour la récupération musculaire'],
        COACH: ['Réduction des sessions de combat']
      }
    }
  ];

  // Création des patients
  for (const patientData of patients) {
    const { recommendations, ...patient } = patientData;
    const createdPatient = await prisma.patient.create({
      data: patient
    });

    // Création des recommandations
    for (const [type, recs] of Object.entries(recommendations)) {
      await prisma.patientRecommendation.create({
        data: {
          patientId: createdPatient.id,
          type,
          content: recs as string[]
        }
      });
    }
  }

  console.log('Base de données initialisée avec les données de test !');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
