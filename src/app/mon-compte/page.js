import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/core/database';

import DashboardAlerts from '@/components/account/DashboardAlerts';
import WidgetCurrentToys from '@/components/account/WidgetCurrentToys';
import WidgetSubscription from '@/components/account/WidgetSubscription';
import WidgetImpact from '@/components/account/WidgetImpact';

export const metadata = {
  title: 'Tableau de bord — Bibliojouets',
};

export default async function MonCompteDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/connexion');
  }

  const orders = await prisma.orders.findMany({
    where: { userId: parseInt(session.user.id) },
    include: {
      OrderProducts: {
        include: { Products: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="overflow-x-hidden">
      <h2 className="section-title">
        Bonjour, {session.user.name} 👋
      </h2>

      {/* Alertes prioritaires */}
      <DashboardAlerts orders={orders} />

      {/* Grille widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <WidgetCurrentToys orders={orders} />
        <WidgetSubscription orders={orders} />
        <WidgetImpact orders={orders} />
      </div>
    </div>
  );
}
