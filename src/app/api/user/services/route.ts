import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const data = await request.json();
    const { services, businessHours, address } = data;

    // Récupérer l'utilisateur par email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Mettre à jour l'adresse
    if (address) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          practice_address: address.practice_address,
          practice_city: address.practice_city,
          practice_postal_code: address.practice_postal_code,
        },
      });
    }

    // Supprimer tous les services existants de l'utilisateur
    await prisma.professionalService.deleteMany({
      where: {
        userId: user.id,
      },
    });

    // Créer les nouveaux services
    const servicesData = services.map((serviceName: string) => ({
      userId: user.id,
      name: serviceName,
      is_custom: !isDefaultService(serviceName, user.professional_type || ''),
    }));

    await prisma.professionalService.createMany({
      data: servicesData,
    });

    // Mettre à jour les horaires d'ouverture
    if (businessHours) {
      // Supprimer les horaires existants
      await prisma.businessHours.deleteMany({
        where: {
          userId: user.id,
        },
      });

      // Créer les nouveaux horaires
      const hoursData = businessHours.map((hours: any) => ({
        userId: user.id,
        day: hours.day,
        open_time: hours.open_time,
        close_time: hours.close_time,
        is_closed: hours.is_closed,
      }));

      await prisma.businessHours.createMany({
        data: hoursData,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user services and hours:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      include: {
        services: true,
        businessHours: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    return NextResponse.json({
      services: user.services.map(service => service.name),
      businessHours: user.businessHours,
      address: {
        practice_address: user.practice_address,
        practice_city: user.practice_city,
        practice_postal_code: user.practice_postal_code,
      }
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données' },
      { status: 500 }
    );
  }
}

// Fonction utilitaire pour vérifier si un service est un service par défaut
function isDefaultService(serviceName: string, professionalType: string) {
  const defaultServices = {
    MEDECIN: [
      'Consultation générale',
      'Consultation spécialisée',
      'Consultation de suivi',
      'Téléconsultation',
    ],
    KINESITHERAPEUTE: [
      'Séance de kinésithérapie',
      'Rééducation fonctionnelle',
      'Massage thérapeutique',
      'Drainage lymphatique',
    ],
    NUTRITIONNISTE: [
      'Bilan nutritionnel',
      'Suivi nutritionnel',
      'Plan alimentaire personnalisé',
      'Coaching nutritionnel',
    ],
  };

  return defaultServices[professionalType as keyof typeof defaultServices]?.includes(serviceName) || false;
}
