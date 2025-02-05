import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { profile_type } = await request.json();
    
    const user = await prisma.user.update({
      where: {
        email: session.user.email,
      },
      data: {
        profile_type,
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        profile_type: true,
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating profile type:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
