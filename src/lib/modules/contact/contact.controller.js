// src/lib/modules/contact/contact.controller.js
import { NextResponse } from 'next/server';
import { contactService } from './contact.service';

export const contactController = {
  async create(request) {
    try {
      const body = await request.json();

      const { name, surname, phone, email, message } = body;

      // validation basique
      if (!email || !email.includes('@')) {
        return NextResponse.json({ success: false, message: 'Email invalide' }, { status: 400 });
      }
      if (!message || message.trim().length < 3) {
        return NextResponse.json({ success: false, message: 'Message trop court' }, { status: 400 });
      }

      const created = await contactService.createMessage({ name, surname, phone, email, message });

      return NextResponse.json({ success: true, message: 'Message reçu', data: created }, { status: 201 });
    } catch (error) {
      console.error('Erreur contactController.create :', error);
      return NextResponse.json({ success: false, message: 'Erreur serveur', error: error.message }, { status: 500 });
    }
  },
};
