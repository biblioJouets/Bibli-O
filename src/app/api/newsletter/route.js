import { newsletterController } from '@/lib/modules/newsletter/newsletter.controller';
import { NextResponse } from 'next/server';

// POST /api/newsletter
export async function POST(request) {
  return newsletterController.subscribe(request);
}

// GET /api/newsletter
export async function GET() {
  return NextResponse.json(
    { success: false, message: "Accès non autorisé." },
    { status: 403 }
  );
}
// DELETE /api/newsletter
export async function DELETE() {
  return NextResponse.json(
    { success: false, message: "Accès non autorisé." },
    { status: 403 }
  );
}