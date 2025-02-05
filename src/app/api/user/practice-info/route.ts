import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data = await request.json();
    const { practice_address, practice_city, practice_postal_code, is_remote, business_hours, services } = data;

    // Mise à jour des informations de base
    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        practice_address,
        practice_city,
        practice_postal_code,
        is_remote,
      },
    });

    // Mise à jour des horaires d'ouverture
    if (business_hours) {
      // Supprimer les anciens horaires
      await prisma.businessHours.deleteMany({
        where: {
          userId: session.user.id,
        },
      });

      // Créer les nouveaux horaires
      await prisma.businessHours.createMany({
        data: business_hours.map((hour: any) => ({
          userId: session.user.id,
          day: hour.day,
          open_time: hour.open_time,
          close_time: hour.close_time,
          is_closed: hour.is_closed,
        })),
      });
    }

    // Mise à jour des services
    if (services) {
      // Supprimer les anciens services
      await prisma.professionalService.deleteMany({
        where: {
          userId: session.user.id,
        },
      });

      // Créer les nouveaux services
      await prisma.professionalService.createMany({
        data: services.map((service: any) => ({
          userId: session.user.id,
          name: service.name,
          description: service.description,
          duration: service.duration,
          price: service.price,
          is_custom: service.is_custom,
        })),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating practice information:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
