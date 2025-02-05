import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Mettre à jour le statut d'onboarding de l'utilisateur
    const updatedUser = await prisma.user.update({
      where: {
        email: session.user.email,
      },
      data: {
        onboarding_completed: true,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      message: 'Onboarding terminé avec succès',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Erreur lors de la finalisation de l\'onboarding:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la finalisation de l\'onboarding' },
      { status: 500 }
    );
  }
}
