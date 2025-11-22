
import { NextResponse } from 'next/server';

// POST /api/users - Désactivé temporairement
export async function POST(request) {
  return NextResponse.json(
    { 
      success: false, 
      message: "Cette fonctionnalité n'est pas encore disponible." 
    },
    { status: 503 }
  );
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