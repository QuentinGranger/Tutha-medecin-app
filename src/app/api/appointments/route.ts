import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function GET(): Promise<NextResponse> {
  try {
    console.log("Démarrage de la requête GET /api/appointments");
    
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer l'utilisateur connecté
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    // Récupérer les rendez-vous avec les informations du patient
    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId: user.id,
        type: user.professional_type || undefined
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            photo_url: true
          }
        }
      },
      orderBy: {
        datetime: 'desc'
      }
    });

    return NextResponse.json({ appointments });

  } catch (error) {
    console.error("Erreur lors de la récupération des rendez-vous:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des rendez-vous" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    const data = await request.json();
    const { patientId, datetime, duration, type, notes } = data;

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        doctorId: user.id,
        datetime: new Date(datetime),
        duration,
        type,
        notes,
        status: "planifié"
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            photo_url: true,
            sport: true,
            injury: true,
            healthStatus: true,
            recentProgress: true
          }
        }
      }
    });

    return NextResponse.json(appointment);

  } catch (error) {
    console.error("Erreur lors de la création du rendez-vous:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du rendez-vous" },
      { status: 500 }
    );
  }
}
