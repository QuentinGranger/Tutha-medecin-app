import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  console.log('Début de la requête upload');

  // Vérifier la méthode
  if (request.method !== 'POST') {
    return new NextResponse('Méthode non autorisée', { status: 405 });
  }

  try {
    // Vérifier l'authentification
    console.log('Vérification de l\'authentification...');
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.log('Non autorisé - pas de session');
      return new NextResponse(
        JSON.stringify({ error: 'Non autorisé' }), 
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          }
        }
      );
    }
    console.log('Utilisateur authentifié:', session.user.email);

    console.log('Lecture du FormData...');
    const data = await request.formData();
    const file = data.get('file') as File;
    const fileType = data.get('type') as string;

    console.log('Données reçues:', {
      fileType,
      filePresent: !!file,
      fileSize: file ? file.size : 0,
      fileType: file ? file.type : null
    });

    if (!file) {
      console.log('Erreur: Aucun fichier fourni');
      return new NextResponse(
        JSON.stringify({ error: 'Aucun fichier fourni' }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          }
        }
      );
    }

    // Créer un nom de fichier unique
    console.log('Lecture du fichier...');
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${uuidv4()}.jpg`;
    console.log('Nom du fichier généré:', fileName);

    // Créer le dossier uploads s'il n'existe pas
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    console.log('Création/vérification du dossier:', uploadDir);
    await mkdir(uploadDir, { recursive: true });

    // Sauvegarder le fichier
    const filePath = join(uploadDir, fileName);
    console.log('Sauvegarde du fichier vers:', filePath);
    await writeFile(filePath, buffer);

    // Construire l'URL du fichier
    const url = `/uploads/${fileName}`;
    console.log('URL du fichier:', url);

    // Mettre à jour la base de données
    console.log('Recherche de l\'utilisateur dans la base de données...');
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      console.log('Erreur: Utilisateur non trouvé');
      return new NextResponse(
        JSON.stringify({ error: 'Utilisateur non trouvé' }),
        { 
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          }
        }
      );
    }

    // Mettre à jour le champ approprié dans la base de données
    console.log('Mise à jour de la base de données...');
    await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(fileType === 'avatar' ? { avatar_url: url } : {}),
        ...(fileType === 'diploma' ? { diploma_url: url } : {})
      }
    });

    console.log('Upload terminé avec succès');
    return new NextResponse(
      JSON.stringify({ url }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      }
    );
  } catch (error) {
    console.error('Erreur détaillée:', {
      message: error.message,
      stack: error.stack,
      error
    });
    return new NextResponse(
      JSON.stringify({ error: 'Erreur lors de l\'upload du fichier' }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}
