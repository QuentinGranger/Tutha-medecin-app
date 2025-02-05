import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { email, firstName, lastName, phoneNumber, rpps } = await req.json();

    // Vérification si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 400 }
      );
    }

    // Vérification si le RPPS existe déjà
    const existingRpps = await prisma.user.findFirst({
      where: { rpps },
    });

    if (existingRpps) {
      return NextResponse.json(
        { error: 'Ce numéro RPPS est déjà utilisé' },
        { status: 400 }
      );
    }

    // Création du nouvel utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber || null,
        rpps,
        role: 'DOCTOR',
        onboarding_completed: false,
      },
    });

    return NextResponse.json({ 
      message: 'Inscription réussie',
      userId: user.id 
    });
  } catch (error) {
    console.error('Error during signup:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'inscription' },
      { status: 500 }
    );
  }
}
