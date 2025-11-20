// src/lib/modules/contact/contact.controller.js
import { NextResponse } from 'next/server';
import { contactService } from './contact.service';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(2).max(50).regex(/^[a-zA-ZÀ-ÿ\s-]+$/).optional(),
  surname: z.string().min(2).max(50).regex(/^[a-zA-ZÀ-ÿ\s-]+$/).optional(),
  phone: z.string().regex(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/).optional(),
  email: z.string().email(),
  message: z.string().min(10).max(1000),
});

export const contactController = {
  async create(request) {
    try {
      const body = await request.json();
      
      // validation stricte avec Zod
      const validated = contactSchema.parse(body);

      // sanitation avec DOMPurify
const sanitized = {
  ...validated,
  name: validated.name?.trim(),
  surname: validated.surname?.trim(),
  phone: validated.phone?.trim(),
  email: validated.email.trim(),
  message: validated.message.trim(),
};

      const created = await contactService.createMessage(sanitized);

      return NextResponse.json({ success: true, data: created }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, errors: error.errors },
          { status: 400 }
        );
      }
      console.error('Erreur contactController.create :', error);
      return NextResponse.json({ success: false, message: 'Erreur serveur', error: error.message }, { status: 500 });
    }
  },
};
