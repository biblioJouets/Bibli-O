import { newsletterController } from '@/lib/modules/newsletter/newsletter.controller';

// POST /api/newsletter
export async function POST(request) {
  return newsletterController.subscribe(request);
}

// GET /api/newsletter
export async function GET(request) {
  return newsletterController.getAll(request);
}

// DELETE /api/newsletter
export async function DELETE(request) {
  return newsletterController.unsubscribe(request);
}