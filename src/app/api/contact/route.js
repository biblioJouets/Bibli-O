import { contactController } from '@/lib/modules/contact/contact.controller';
import { NextResponse } from 'next/server';

export async function POST(request) {
  return contactController.create(request);
}

export async function GET(request) {
  return NextResponse.json({ success: true, message: 'Endpoint contact actif'});
}