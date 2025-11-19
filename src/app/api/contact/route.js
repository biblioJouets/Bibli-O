import { NextResponse } from 'next/server';
import { contactController } from '@/lib/modules/contact/contact.controller';


export async function POST(request) {
    return contactController.create(request);

}

export async function GET(request) {
    return NextResponse.json({ success: true, message: 'Endpoint contact actif'});
}