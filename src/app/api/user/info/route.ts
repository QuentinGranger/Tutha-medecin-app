import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      console.error('GET /api/user/info - Non authentifié');
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Essayer de trouver l'utilisateur avec l'email de la session
    let user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      include: {
        services: {
          select: {
            id: true,
            name: true,
            description: true,
            duration: true,
            price: true,
            is_custom: true,
          }
        },
        businessHours: {
          select: {
            id: true,
            day: true,
            open_time: true,
            close_time: true,
            is_closed: true,
          }
        }
      }
    });

    // Si l'utilisateur n'est pas trouvé, essayer avec l'autre email
    if (!user) {
      const alternativeEmail = session.user.email === 'quentinsavigny@protonmail.com' 
        ? 'q.savigny.qs@gmail.com' 
        : 'quentinsavigny@protonmail.com';

      user = await prisma.user.findUnique({
        where: {
          email: alternativeEmail,
        },
        include: {
          services: {
            select: {
              id: true,
              name: true,
              description: true,
              duration: true,
              price: true,
              is_custom: true,
            }
          },
          businessHours: {
            select: {
              id: true,
              day: true,
              open_time: true,
              close_time: true,
              is_closed: true,
            }
          }
        }
      });
    }

    if (!user) {
      console.error(`GET /api/user/info - Utilisateur non trouvé: ${session.user.email}`);
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      professional_type: user.professional_type,
      speciality: user.speciality,
      rpps_number: user.rpps_number,
      adeli_number: user.adeli_number,
      certification_number: user.certification_number,
      diploma: user.diploma,
      years_of_experience: user.years_of_experience,
      practice_address: user.practice_address,
      practice_city: user.practice_city,
      practice_postal_code: user.practice_postal_code,
      services: user.services,
      businessHours: user.businessHours,
    });

  } catch (error) {
    console.error('GET /api/user/info - Erreur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
