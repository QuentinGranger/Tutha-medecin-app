import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (!type) {
      return NextResponse.json({ error: 'Type professionnel requis' }, { status: 400 });
    }

    const services = await prisma.defaultService.findMany({
      where: {
        professional_type: type
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error('Error fetching default services:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
