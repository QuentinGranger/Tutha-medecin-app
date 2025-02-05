import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { Patient, PatientResponse, ProfessionalType } from "@/types/patient";
import path from 'path';
import fs from 'fs';

const DEFAULT_AVATAR = "/img/patients/default-avatar.jpg";

// Fonction pour vérifier l'extension correcte d'une image
function getCorrectImagePath(imagePath: string): string {
  if (!imagePath) return DEFAULT_AVATAR;
  
  const publicDir = path.join(process.cwd(), 'public');
  const jpgPath = path.join(publicDir, imagePath);
  const pngPath = jpgPath.replace('.jpg', '.png');
  
  if (fs.existsSync(jpgPath)) return imagePath;
  if (fs.existsSync(pngPath)) return imagePath.replace('.jpg', '.png');
  
  return DEFAULT_AVATAR;
}

export async function GET(): Promise<NextResponse<PatientResponse>> {
  try {
    console.log("Démarrage de la requête GET /api/patients");
    
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" } as any, { status: 401 });
    }

    // Récupérer le profil utilisateur avec une seule requête
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        professional_type: true
      }
    });

    if (!user?.professional_type) {
      return NextResponse.json({ error: "Profil utilisateur non trouvé" } as any, { status: 404 });
    }

    const professionalType = user.professional_type as ProfessionalType;
    console.log("Type professionnel:", professionalType);

    // Récupérer tous les patients avec leurs recommandations en une seule requête
    const patients = await prisma.patient.findMany({
      select: {
        id: true,
        name: true,
        sport: true,
        injury: true,
        photo_url: true,
        created_at: true,
        updated_at: true,
        recommendations: {
          where: {
            type: professionalType
          },
          select: {
            content: true
          }
        }
      }
    });

    console.log("Patients récupérés:", patients.length);

    // Formater les données en fonction du type de professionnel
    const formattedPatients = patients.map(patient => {
      const recommendations = patient.recommendations[0]?.content || [];
      
      // Structure de base commune à tous les types
      const basePatientInfo = {
        id: patient.id,
        name: patient.name,
        sport: patient.sport,
        injury: patient.injury,
        photo_url: getCorrectImagePath(patient.photo_url || DEFAULT_AVATAR),
        recommendations,
        lastAppointment: null,
        healthStatus: "En cours de suivi",
        recentProgress: "Stable",
        created_at: patient.created_at,
        updated_at: patient.updated_at
      };

      // Ajouter des informations spécifiques selon le type de professionnel
      switch (professionalType) {
        case "MEDECIN":
          return {
            ...basePatientInfo,
            medicalStatus: "À surveiller",
            nextCheckup: "Dans 2 semaines",
            treatmentPlan: "En cours"
          };
        case "KINESITHERAPEUTE":
          return {
            ...basePatientInfo,
            mobilityScore: "7/10",
            painLevel: "3/10",
            exerciseCompliance: "Bon"
          };
        case "OSTEOPATHE":
          return {
            ...basePatientInfo,
            posturalAssessment: "Amélioration",
            jointMobility: "Bonne",
            treatmentFrequency: "Mensuelle"
          };
        case "NUTRITIONNISTE":
          return {
            ...basePatientInfo,
            dietAdherence: "85%",
            weightProgress: "Stable",
            nutritionalGoals: "En bonne voie"
          };
        case "COACH":
          return {
            ...basePatientInfo,
            trainingIntensity: "Modérée",
            performanceLevel: "En progression",
            fitnessScore: "8/10"
          };
        default:
          return {
            ...basePatientInfo,
            medicalStatus: "À surveiller",
            nextCheckup: "Dans 2 semaines",
            treatmentPlan: "En cours"
          };
      }
    }) as Patient[];

    return NextResponse.json({
      patients: formattedPatients,
      totalCount: patients.length
    });
  } catch (error) {
    console.error("Erreur détaillée:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des patients" } as any,
      { status: 500 }
    );
  }
}
