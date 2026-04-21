import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { Package, Calendar, AlertTriangle, PauseCircle } from 'lucide-react';
import prisma from '@/lib/core/database';
import SubscriptionActions from '@/components/account/SubscriptionActions';

export const metadata = { title: 'Mon Abonnement — Bibliojouets' };

const PRICING_MAP = { 1: 20, 2: 25, 3: 35, 4: 38, 5: 45, 6: 51, 7: 56, 8: 60, 9: 63 };

function formatDate(ts) {
  if (!ts) return null;
  return new Date(ts * 1000).toLocaleDateString('fr-FR');
}

async function getSubscriptionData(userId) {
  const Stripe = (await import('stripe')).default;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const activeOrder = await prisma.orders.findFirst({
    where: {
      userId: parseInt(userId),
      stripeSubscriptionId: { not: null },
    },
    orderBy: { createdAt: 'desc' },
    include: {
      OrderProducts: { include: { Products: true } },
    },
  });

  if (!activeOrder?.stripeSubscriptionId) return null;

  const subscription = await stripe.subscriptions.retrieve(
    activeOrder.stripeSubscriptionId
  );

  const item0 = subscription.items?.data?.[0];
  const periodEnd = subscription.current_period_end ?? item0?.current_period_end ?? null;
  const cancelAt  = subscription.cancel_at ?? null;

  const toyCount = activeOrder.OrderProducts.filter(
    (op) => !['ADOPTE', 'ADOPTE_REMPLACE', 'RETOUR_DEMANDE'].includes(op.renewalIntention)
  ).length;

  return {
    status:             subscription.status,
    cancelAtPeriodEnd:  subscription.cancel_at_period_end,
    cancelAt,
    isPaused:           !!subscription.pause_collection,
    periodEnd,
    toyCount,
    monthlyAmount:      item0?.price?.unit_amount ?? null,
    currency:           subscription.currency ?? 'eur',
    order:              activeOrder,
    stripeSubscriptionId: activeOrder.stripeSubscriptionId,
  };
}

async function AbonnementContent({ userId }) {
  const data = await getSubscriptionData(userId);

  if (!data) {
    return (
      <div className="p-8 rounded-[25px] text-center" style={{ background: '#f9f9f9', border: '1px solid #eee' }}>
        <Package size={48} color="#ccc" style={{ margin: '0 auto 16px' }} />
        <p className="font-semibold text-[#2E1D21]">Aucun abonnement actif</p>
        <p className="text-sm mt-1" style={{ color: '#888' }}>
          Vous n&apos;avez pas encore de box en cours.
        </p>
      </div>
    );
  }

  const periodEndFormatted = formatDate(data.periodEnd);
  const cancelAtFormatted  = formatDate(data.cancelAt);
  const monthlyPrice = data.monthlyAmount != null
    ? (data.monthlyAmount / 100).toLocaleString('fr-FR', { style: 'currency', currency: data.currency.toUpperCase() })
    : null;

  return (
    <>
      {/* Bannière pause */}
      {data.isPaused && (
        <div className="flex items-start gap-3 p-4 rounded-[20px] mb-5"
          style={{ background: '#FFF7E6', border: '1px solid #FFE08A' }}>
          <PauseCircle size={22} style={{ color: '#d97706', flexShrink: 0, marginTop: 2 }} />
          <div>
            <p className="font-bold text-sm" style={{ color: '#7a5c00' }}>Abonnement en pause ☀️</p>
            <p className="text-sm mt-0.5" style={{ color: '#7a5c00' }}>
              Votre abonnement est actuellement suspendu. Contactez-nous pour le reprendre.
            </p>
          </div>
        </div>
      )}

      {/* Bannière résiliation programmée */}
      {data.cancelAtPeriodEnd && !data.isPaused && (
        <div className="flex items-start gap-3 p-4 rounded-[20px] mb-5"
          style={{ background: '#FFD9DC', border: '1px solid #FF8C94' }}>
          <AlertTriangle size={22} style={{ color: '#a0000c', flexShrink: 0, marginTop: 2 }} />
          <div>
            <p className="font-bold text-sm" style={{ color: '#a0000c' }}>Résiliation prévue</p>
            <p className="text-sm mt-0.5" style={{ color: '#7a0010' }}>
              Votre abonnement se terminera le <strong>{periodEndFormatted}</strong>.
              Vous conservez l&apos;accès à vos jouets jusqu&apos;à cette date.
            </p>
          </div>
        </div>
      )}

      {/* Carte abonnement */}
      <div className="bg-white rounded-[25px] shadow-sm p-6 mb-6" style={{ border: '1px solid #eee' }}>
        <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-full w-10 h-10" style={{ background: '#DFF1F9' }}>
              <Package size={20} style={{ color: '#6EC1E4' }} />
            </div>
            <div>
              <h3 className="font-bold text-base" style={{ color: '#2E1D21' }}>
                Box {data.toyCount} Jouet{data.toyCount > 1 ? 's' : ''}
              </h3>
              <p className="text-xs" style={{ color: '#888' }}>Formule mensuelle</p>
            </div>
          </div>
          <div className="text-right">
            {monthlyPrice && (
              <p className="text-2xl font-extrabold" style={{ color: '#6EC1E4' }}>
                {monthlyPrice}<span className="text-sm font-normal text-gray-400">/mois</span>
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Statut */}
          <div className="rounded-[16px] p-4" style={{ background: '#f9f9f9' }}>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#a0888c' }}>Statut</p>
            {data.isPaused ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: '#FFF7E6', color: '#d97706' }}>
                ☀️ En pause
              </span>
            ) : data.cancelAtPeriodEnd ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: '#FFD9DC', color: '#a0000c' }}>
                Résiliation prévue
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: '#DAEEE6', color: '#3b8c6e' }}>
                ✓ Actif
              </span>
            )}
          </div>

          {/* Prochaine échéance */}
          <div className="rounded-[16px] p-4" style={{ background: '#f9f9f9' }}>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#a0888c' }}>
              {data.cancelAtPeriodEnd ? 'Fin d\'accès' : 'Prochain renouvellement'}
            </p>
            <div className="flex items-center gap-2">
              <Calendar size={16} style={{ color: '#888' }} />
              <span className="font-semibold text-sm" style={{ color: '#2E1D21' }}>
                {periodEndFormatted ?? '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Jouets en cours */}
        {data.order.OrderProducts.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: '#a0888c' }}>
              Jouets dans votre box
            </p>
            <div className="flex flex-col gap-2">
              {data.order.OrderProducts.map((op) => {
                const isAdopted = ['ADOPTE', 'ADOPTE_REMPLACE'].includes(op.renewalIntention);
                const isReturning = op.renewalIntention === 'RETOUR_DEMANDE';
                return (
                  <div key={op.ProductId}
                    className="flex items-center justify-between px-3 py-2 rounded-[12px]"
                    style={{ background: '#fafafa', border: '1px solid #eee' }}>
                    <span className="text-sm font-medium" style={{ color: '#2E1D21' }}>
                      {op.Products?.name ?? `Jouet #${op.ProductId}`}
                    </span>
                    {isAdopted && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                        style={{ background: '#F5F0FA', color: '#7a5c9e' }}>
                        Adopté 💜
                      </span>
                    )}
                    {isReturning && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                        style={{ background: '#FFD9DC', color: '#a0000c' }}>
                        Retour en cours
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions (Client Component) */}
        <SubscriptionActions
          cancelAtDate={periodEndFormatted}
          isPaused={data.isPaused}
          isCancelScheduled={data.cancelAtPeriodEnd}
        />
      </div>

      {/* Lien portail Stripe */}
      <div className="text-center">
        <a
          href={`/api/stripe/create-portal-session?subscriptionId=${data.stripeSubscriptionId}`}
          className="text-sm font-semibold underline underline-offset-2"
          style={{ color: '#6EC1E4' }}
        >
          Gérer mon abonnement sur Stripe →
        </a>
      </div>
    </>
  );
}

export default async function AbonnementPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/connexion');

  return (
    <div>
      <h2 className="section-title">Mon Abonnement</h2>
      <p style={{ color: '#888', marginBottom: '32px' }}>
        Consultez votre formule, gérez vos options et suivez vos jouets en cours.
      </p>
      <Suspense fallback={
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-200 rounded-[25px]" />
          <div className="h-64 bg-gray-200 rounded-[25px]" />
        </div>
      }>
        <AbonnementContent userId={session.user.id} />
      </Suspense>
    </div>
  );
}
