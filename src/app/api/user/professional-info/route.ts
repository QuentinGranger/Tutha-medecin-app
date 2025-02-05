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
    
    // Récupérer l'utilisateur par email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }
    
    // Mise à jour des informations professionnelles
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        professional_type: data.professional_type,
        speciality: data.speciality,
        diploma: data.diploma,
        diploma_url: data.diploma_url,
        rpps_number: data.rpps_number,
        adeli_number: data.adeli_number,
        certification_number: data.certification_number,
        years_of_experience: data.years_of_experience ? parseInt(data.years_of_experience) : null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating professional info:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des informations professionnelles' },
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
      select: {
        professional_type: true,
        speciality: true,
        diploma: true,
        diploma_url: true,
        rpps_number: true,
        adeli_number: true,
        certification_number: true,
        years_of_experience: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching professional info:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des informations professionnelles' },
      { status: 500 }
    );
  }
}
