import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Mettre à jour l'utilisateur pour marquer l'onboarding comme terminé
    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id
      },
      data: {
        onboarding_completed: true
      },
      select: {
        id: true,
        email: true,
        onboarding_completed: true
      }
    });

    return NextResponse.json(
      { 
        message: 'Onboarding terminé avec succès',
        user: updatedUser
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'onboarding:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
