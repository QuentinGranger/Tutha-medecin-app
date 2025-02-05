import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const data = await req.json();
    console.log('Données reçues:', data);

    const { services, businessHours, addresses } = data;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    console.log('User found:', user.id);

    try {
      // Log pour déboguer Prisma
      console.log('Prisma client:', Object.keys(prisma));

      const result = await prisma.$transaction(async (tx) => {
        // Mise à jour de l'adresse et de l'onboarding
        if (addresses && Array.isArray(addresses) && addresses.length > 0) {
          console.log('Updating address...');
          const address = addresses[0];
          await tx.user.update({
            where: { id: user.id },
            data: {
              practice_address: address.street,
              practice_city: address.city,
              practice_postal_code: address.postalCode,
              onboarding_completed: true,
            },
          });
          console.log('Address updated successfully');
        } else {
          await tx.user.update({
            where: { id: user.id },
            data: {
              onboarding_completed: true,
            },
          });
        }

        // Mise à jour des services
        if (services && Array.isArray(services) && services.length > 0) {
          console.log('Updating services...');
          
          // Supprimer les services existants
          await tx.professionalService.deleteMany({
            where: { userId: user.id },
          });

          // Créer les nouveaux services
          for (const service of services) {
            await tx.professionalService.create({
              data: {
                userId: user.id,
                name: service.name,
                description: service.description || null,
                duration: service.duration || null,
                price: service.price || null,
                is_custom: service.isCustom || false,
              },
            });
          }
          console.log('Services updated successfully');
        }

        // Mise à jour des horaires
        if (businessHours && Array.isArray(businessHours) && businessHours.length > 0) {
          console.log('Updating business hours...');
          // Suppression des horaires existants
          await tx.businessHours.deleteMany({
            where: { userId: user.id }
          });

          // Création des nouveaux horaires
          await tx.businessHours.createMany({
            data: businessHours.map(h => ({
              ...h,
              userId: user.id
            }))
          });
          console.log('Business hours updated successfully');
        }
      });

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Database operation error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error updating practice info:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des informations' },
      { status: 500 }
    );
  }
}
