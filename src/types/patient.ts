export type ProfessionalType = 'MEDECIN' | 'KINESITHERAPEUTE' | 'OSTEOPATHE' | 'NUTRITIONNISTE' | 'COACH';

export interface PatientRecommendation {
  id: string;
  patientId: string;
  type: ProfessionalType;
  content: string[];
  created_at: Date;
  updated_at: Date;
}

export interface BasePatient {
  id: string;
  name: string;
  sport: string;
  injury: string;
  photo_url: string | null;
  recommendations: string[];
  lastAppointment: string | null;
  healthStatus: string;
  recentProgress: string;
  created_at: Date;
  updated_at: Date;
}

// Pour les médecins (MEDECIN)
export interface MedecinPatient extends BasePatient {
  medicalStatus: string;
  nextCheckup: string;
  treatmentPlan: string;
}

// Pour les kinésithérapeutes (KINESITHERAPEUTE)
export interface KinesitherapeutePatient extends BasePatient {
  mobilityScore: string;
  painLevel: string;
  exerciseCompliance: string;
}

// Pour les ostéopathes (OSTEOPATHE)
export interface OsteopathePatient extends BasePatient {
  posturalAssessment: string;
  jointMobility: string;
  treatmentFrequency: string;
}

// Pour les nutritionnistes (NUTRITIONNISTE)
export interface NutritionnistePatient extends BasePatient {
  dietAdherence: string;
  weightProgress: string;
  nutritionalGoals: string;
}

// Pour les coachs (COACH)
export interface CoachPatient extends BasePatient {
  trainingIntensity: string;
  performanceLevel: string;
  fitnessScore: string;
}

export type Patient = 
  | MedecinPatient 
  | KinesitherapeutePatient 
  | OsteopathePatient 
  | NutritionnistePatient 
  | CoachPatient;

export interface PatientResponse {
  patients: Patient[];
  totalCount: number;
}
