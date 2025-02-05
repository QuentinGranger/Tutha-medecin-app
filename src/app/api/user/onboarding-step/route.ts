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
    const { step } = data;

    // Récupérer l'utilisateur par email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Mise à jour du statut d'onboarding
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        onboarding_completed: step === '/onboarding/confirmation',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating onboarding step:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'étape d\'onboarding' },
      { status: 500 }
    );
  }
}
