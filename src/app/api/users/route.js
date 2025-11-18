import { userController } from '@/lib/modules/users/user.controller';

export async function POST(request) {
  return userController.create(request);
}

export async function GET(request) {
  return userController.getAll(request);
}