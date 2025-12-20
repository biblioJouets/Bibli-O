import { userController } from '@/lib/modules/users/user.controller';
import { NextResponse } from 'next/server';
import { updateUser } from '@/lib/modules/users/user.service';

export async function GET(request, context) {
  return userController.getById(request, context);
}

export async function PUT(request, { params }) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    
    
    const updatedUser = await updateUser(id, body);
    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: "Erreur mise à jour" }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  return userController.delete(request, context);
}