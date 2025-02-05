import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const servicesByType = {
  MEDECIN: [
    { name: 'Consultation générale' },
    { name: 'Consultation spécialisée' },
    { name: 'Consultation de suivi' },
    { name: 'Téléconsultation' },
  ],
  KINESITHERAPEUTE: [
    { name: 'Séance de kinésithérapie' },
    { name: 'Rééducation fonctionnelle' },
    { name: 'Massage thérapeutique' },
    { name: 'Drainage lymphatique' },
  ],
  NUTRITIONNISTE: [
    { name: 'Bilan nutritionnel' },
    { name: 'Consultation de suivi' },
    { name: 'Plan alimentaire personnalisé' },
    { name: 'Coaching nutritionnel' },
  ],
  COACH: [
    { name: 'Séance individuelle' },
    { name: 'Coaching personnalisé' },
    { name: 'Bilan forme et objectifs' },
    { name: 'Suivi en ligne' },
  ],
} as const;

type ProfessionalType = keyof typeof servicesByType;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (!type) {
      return NextResponse.json(
        { error: 'Le type de professionnel est requis' },
        { status: 400 }
      );
    }

    // Vérifier si le type est valide
    if (!Object.keys(servicesByType).includes(type)) {
      return NextResponse.json(
        { error: `Type de professionnel non valide. Types valides : ${Object.keys(servicesByType).join(', ')}` },
        { status: 400 }
      );
    }

    const services = servicesByType[type as ProfessionalType];
    return NextResponse.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des services' },
      { status: 500 }
    );
  }
}
