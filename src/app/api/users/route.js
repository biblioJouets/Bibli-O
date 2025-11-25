
import { NextResponse } from 'next/server';
import { userController } from '@/lib/modules/users/user.controller';

// POST /api/users - Désactivé temporairement
export async function POST(request) {
  return userController.create(request);
}

// GET /api/users - Désactivé temporairement
export async function GET(request) {
  return NextResponse.json(
    { 
      success: false, 
      message: "Accès non autorisé." 
    },
    { status: 403 }
  );
}