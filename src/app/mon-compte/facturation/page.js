import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { CreditCard, FileText, Calendar, AlertTriangle, ExternalLink } from 'lucide-react';
import prisma from '@/lib/core/database';

export const metadata = { title: 'Facturation & Paiement — Bibliojouets' };

// ---------- helpers ----------

function formatDate(ts) {
  if (!ts) return '—';
  return new Date(ts * 1000).toLocaleDateString('fr-FR');
}

function formatAmount(amount, currency = 'eur') {
  if (amount == null) return '—';
  return (amount / 100).toLocaleString('fr-FR', { style: 'currency', currency: currency.toUpperCase() });
}

const BRAND_LABEL = { visa: 'Visa', mastercard: 'Mastercard', amex: 'Amex', cb: 'CB' };
const BRAND_COLOR = { visa: '#1A1F71', mastercard: '#EB001B', amex: '#007BC1', cb: '#2E1D21' };

function InvoiceStatusBadge({ status }) {
  const config = {
    paid:   { bg: '#DAEEE6', color: '#3b8c6e', label: 'Payée' },
    open:   { bg: '#FFD9DC', color: '#a0000c', label: 'Impayée' },
    void:   { bg: '#f3f4f6', color: '#888',    label: 'Annulée' },
    draft:  { bg: '#FFF7E6', color: '#7a5c00', label: 'Brouillon' },
    uncollectible: { bg: '#f3f4f6', color: '#888', label: 'Irrécupérable' },
  }[status] ?? { bg: '#f3f4f6', color: '#888', label: status };

  return (
    <span className="px-3 py-1 rounded-full text-xs font-bold"
      style={{ background: config.bg, color: config.color }}>
      {config.label}
    </span>
  );
}

// ---------- data fetching ----------

async function getBillingData(userId) {
  const Stripe = (await import('stripe')).default;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  // Récupérer la commande active pour obtenir le stripeSubscriptionId
  const activeOrder = await prisma.orders.findFirst({
    where: {
      userId: parseInt(userId),
      stripeSubscriptionId: { not: null },
    },
    orderBy: { createdAt: 'desc' },
    select: { stripeSubscriptionId: true },
  });

  if (!activeOrder?.stripeSubscriptionId) return null;

  const subscription = await stripe.subscriptions.retrieve(
    activeOrder.stripeSubscriptionId,
    { expand: ['default_payment_method', 'customer'] }
  );

  const customerId = typeof subscription.customer === 'string'
    ? subscription.customer
    : subscription.customer?.id;

  if (!customerId) return null;

  // 12 dernières factures
  const invoicesRes = await stripe.invoices.list({
    customer: customerId,
    limit: 12,
  });

  // Méthode de paiement par défaut
  const customer = await stripe.customers.retrieve(customerId, {
    expand: ['invoice_settings.default_payment_method'],
  });

  const pm = customer.invoice_settings?.default_payment_method
    ?? subscription.default_payment_method
    ?? null;

  const card = pm?.card ?? null;

  // Prochaine échéance
  const item0 = subscription.items?.data?.[0];
  const nextBillingTs = subscription.current_period_end
    ?? item0?.current_period_end
    ?? null;

  const latestInvoice = invoicesRes.data[0] ?? null;
  const hasFailedPayment = latestInvoice?.status === 'open' && latestInvoice?.attempted;

  return {
    invoices: invoicesRes.data,
    card,
    nextBillingTs,
    nextBillingAmount: subscription.items?.data?.[0]?.price?.unit_amount ?? null,
    nextBillingCurrency: subscription.currency ?? 'eur',
    hasFailedPayment,
    latestInvoice,
    portalOrderId: null, // non nécessaire — on passe par stripeSubscriptionId côté route
    stripeSubscriptionId: activeOrder.stripeSubscriptionId,
  };
}

// ---------- sous-composants serveur ----------

function CardBlock({ card, stripeSubscriptionId }) {
  if (!card) {
    return (
      <div className="text-sm" style={{ color: '#888' }}>
        Aucune carte enregistrée.
      </div>
    );
  }

  const brand = BRAND_LABEL[card.brand] ?? card.brand?.toUpperCase() ?? 'CB';
  const brandColor = BRAND_COLOR[card.brand] ?? '#2E1D21';

  return (
    <>
      <div className="flex items-center justify-between rounded-[15px] p-4 mb-4"
        style={{ background: '#f9f9f9', border: '1px solid #eee' }}>
        <div className="flex items-center gap-3">
          <div className="px-2 py-1 rounded text-xs font-bold text-white"
            style={{ background: brandColor }}>
            {brand}
          </div>
          <span className="text-sm font-medium" style={{ color: '#2E1D21' }}>
            •••• •••• •••• {card.last4}
          </span>
        </div>
        <span className="text-xs" style={{ color: '#888' }}>
          {String(card.exp_month).padStart(2, '0')}/{String(card.exp_year).slice(-2)}
        </span>
      </div>
      <a
        href={`/api/stripe/create-portal-session?subscriptionId=${stripeSubscriptionId}`}
        className="text-sm font-semibold"
        style={{ color: '#6EC1E4', textDecoration: 'underline' }}
      >
        Mettre à jour ma carte →
      </a>
    </>
  );
}

function NextBillingBlock({ nextBillingTs, nextBillingAmount, nextBillingCurrency }) {
  if (!nextBillingTs) return <p className="text-sm" style={{ color: '#888' }}>Aucune échéance prévue.</p>;

  return (
    <>
      <p className="text-3xl font-extrabold mb-1" style={{ color: '#2E1D21' }}>
        {nextBillingAmount != null ? formatAmount(nextBillingAmount, nextBillingCurrency) : '—'}
      </p>
      <p className="text-sm" style={{ color: '#888' }}>
        Prélevé le <strong style={{ color: '#2E1D21' }}>{formatDate(nextBillingTs)}</strong>
      </p>
    </>
  );
}

function InvoicesTable({ invoices }) {
  if (!invoices?.length) {
    return <p className="text-sm text-center py-6" style={{ color: '#888' }}>Aucune facture disponible.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
            {['Référence', 'Date', 'Montant', 'Statut', 'PDF'].map((h) => (
              <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: '#888', fontWeight: 600 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: '12px', color: '#2E1D21', fontWeight: 600, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                {inv.number ?? inv.id.slice(0, 14)}
              </td>
              <td style={{ padding: '12px', color: '#666' }}>{formatDate(inv.created)}</td>
              <td style={{ padding: '12px', color: '#2E1D21', fontWeight: 700 }}>
                {formatAmount(inv.amount_paid || inv.amount_due, inv.currency)}
              </td>
              <td style={{ padding: '12px' }}>
                <InvoiceStatusBadge status={inv.status} />
              </td>
              <td style={{ padding: '12px' }}>
                {inv.invoice_pdf ? (
                  <a
                    href={inv.invoice_pdf}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-semibold"
                    style={{ color: '#6EC1E4', textDecoration: 'underline' }}
                  >
                    PDF <ExternalLink size={12} />
                  </a>
                ) : (
                  <span style={{ color: '#ccc', fontSize: '0.8rem' }}>—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------- page principale ----------

async function FacturationContent({ userId }) {
  const data = await getBillingData(userId);

  if (!data) {
    return (
      <div className="p-6 rounded-[25px] text-center" style={{ background: '#f9f9f9', border: '1px solid #eee' }}>
        <p style={{ color: '#888' }}>Aucun abonnement actif trouvé.</p>
      </div>
    );
  }

  return (
    <>
      {/* Bannière alerte paiement échoué */}
      {data.hasFailedPayment && (
        <div className="flex items-start gap-4 p-4 rounded-[20px] mb-6"
          style={{ background: '#FFD9DC', border: '1px solid #FF8C94' }}>
          <AlertTriangle size={24} style={{ color: '#a0000c', flexShrink: 0, marginTop: 2 }} />
          <div>
            <p className="font-bold text-sm" style={{ color: '#a0000c' }}>
              Paiement échoué — action requise
            </p>
            <p className="text-sm mt-1" style={{ color: '#7a0010' }}>
              Votre dernière facture du <strong>{formatDate(data.latestInvoice.created)}</strong> ({formatAmount(data.latestInvoice.amount_due, data.latestInvoice.currency)}) est impayée.
              Mettez à jour votre carte bancaire pour éviter la suspension de votre abonnement.
            </p>
            <a
              href={`/api/stripe/create-portal-session?subscriptionId=${data.stripeSubscriptionId}`}
              className="inline-block mt-3 px-5 py-2 rounded-full text-sm font-bold text-white"
              style={{ background: '#FF8C94' }}
            >
              Mettre à jour ma carte →
            </a>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

        {/* Moyen de paiement */}
        <div className="bg-white rounded-[25px] shadow-sm p-6" style={{ border: '1px solid #eee' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center rounded-full w-10 h-10" style={{ background: '#DFF1F9' }}>
              <CreditCard size={20} style={{ color: '#6EC1E4' }} />
            </div>
            <h3 className="font-bold text-base" style={{ color: '#2E1D21' }}>Moyen de paiement</h3>
          </div>
          <CardBlock card={data.card} stripeSubscriptionId={data.stripeSubscriptionId} />
        </div>

        {/* Prochaine échéance */}
        <div className="bg-white rounded-[25px] shadow-sm p-6" style={{ border: '1px solid #eee' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center rounded-full w-10 h-10" style={{ background: '#FFF7EB' }}>
              <Calendar size={20} style={{ color: '#d97706' }} />
            </div>
            <h3 className="font-bold text-base" style={{ color: '#2E1D21' }}>Prochaine échéance</h3>
          </div>
          <NextBillingBlock
            nextBillingTs={data.nextBillingTs}
            nextBillingAmount={data.nextBillingAmount}
            nextBillingCurrency={data.nextBillingCurrency}
          />
        </div>
      </div>

      {/* Historique factures */}
      <div className="bg-white rounded-[25px] shadow-sm p-6" style={{ border: '1px solid #eee' }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="flex items-center justify-center rounded-full w-10 h-10" style={{ background: '#f3f4f6' }}>
            <FileText size={20} style={{ color: '#888' }} />
          </div>
          <h3 className="font-bold text-base" style={{ color: '#2E1D21' }}>Historique des factures</h3>
        </div>
        <InvoicesTable invoices={data.invoices} />
      </div>
    </>
  );
}

export default async function FacturationPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/connexion');

  return (
    <div>
      <h2 className="section-title">Facturation & Paiement</h2>
      <p style={{ color: '#888', marginBottom: '32px' }}>
        Gérez votre carte bancaire, consultez vos factures et suivez vos échéances.
      </p>
      <Suspense fallback={
        <div className="animate-pulse space-y-6">
          <div className="h-14 bg-gray-200 rounded-[25px] w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-44 bg-gray-200 rounded-[25px]" />
            <div className="h-44 bg-gray-200 rounded-[25px]" />
          </div>
          <div className="h-64 bg-gray-200 rounded-[25px]" />
        </div>
      }>
        <FacturationContent userId={session.user.id} />
      </Suspense>
    </div>
  );
}
