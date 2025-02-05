import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { headers } from 'next/headers';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

export async function GET() {
  // Vérifier si nous sommes en environnement de développement
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (!isDevelopment) {
    return NextResponse.json({ error: "Cette route n'est disponible qu'en développement" }, { status: 403 });
  }

  try {
    // Récupérer tous les utilisateurs avec leur professional_type
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        professional_type: true,
      }
    });

    return NextResponse.json({
      users,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
