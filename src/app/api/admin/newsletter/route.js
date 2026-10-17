// src/app/api/admin/newsletter/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/core/database';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  try {
    const subscribers = await prisma.newsletter_subscribers.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(subscribers, { status: 200 });
  } catch (error) {
    console.error('Erreur API /admin/newsletter :', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des abonnés newsletter.' },
      { status: 500 }
    );
  }
}
