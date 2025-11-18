import { userController } from '@/lib/modules/users/user.controller';

export async function GET(request, context) {
  return userController.getById(request, context);
}

export async function PUT(request, context) {
  return userController.update(request, context);
}

export async function DELETE(request, context) {
  return userController.delete(request, context);
}