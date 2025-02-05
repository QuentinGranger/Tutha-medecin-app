import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const data = await req.json();
    console.log('Données reçues:', data);
    
    // Récupérer l'utilisateur actuel pour préserver les données existantes
    const currentUser = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      include: {
        services: true,
        businessHours: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Mise à jour du profil utilisateur en préservant les données existantes
    const updatedUser = await prisma.user.update({
      where: {
        email: session.user.email,
      },
      data: {
        first_name: data.firstName || currentUser.first_name,
        last_name: data.lastName || currentUser.last_name,
        email: data.email || currentUser.email,
        phone: data.phone || currentUser.phone,
        professional_type: currentUser.professional_type,
        speciality: currentUser.speciality,
        rpps_number: currentUser.rpps_number,
        adeli_number: currentUser.adeli_number,
        certification_number: currentUser.certification_number,
        diploma: currentUser.diploma,
        years_of_experience: currentUser.years_of_experience,
        practice_address: currentUser.practice_address,
        practice_city: currentUser.practice_city,
        practice_postal_code: currentUser.practice_postal_code,
      },
      include: {
        services: true,
        businessHours: true,
      },
    });

    console.log('Utilisateur mis à jour:', updatedUser);
    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du profil' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const data = await req.json();

    // Mise à jour du profil utilisateur
    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        phone: data.phone,
      },
    });

    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du profil' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
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

    return NextResponse.json(user);
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du profil' },
      { status: 500 }
    );
  }
}
