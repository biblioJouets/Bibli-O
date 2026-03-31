import Image from 'next/image';
import Link from 'next/link';
import { PackageOpen } from 'lucide-react';

function getDaysRemaining(nextBillingDate) {
  if (!nextBillingDate) return null;
  const diff = new Date(nextBillingDate) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Widget listant les jouets actuellement en location (commandes ACTIVE).
 * @param {{ orders: import('@prisma/client').Orders[] }} props
 */
export default function WidgetCurrentToys({ orders }) {
  const activeItems = orders
    .filter((o) => o.status === 'ACTIVE')
    .flatMap((o) =>
      o.OrderProducts.map((op) => ({ ...op, orderId: o.id }))
    );

  return (
    <div
      className="bg-white rounded-[25px] shadow-sm p-6 flex flex-col gap-4"
      style={{ border: '1px solid #eee' }}
    >
      <h3 className="font-bold text-lg" style={{ color: '#2E1D21' }}>
        Jouets chez moi
      </h3>

      {activeItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-6 text-center text-gray-400">
          <PackageOpen size={36} aria-hidden="true" />
          <p className="text-sm">Aucun jouet en location actuellement.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {activeItems.map((op) => {
            const product = op.Products;
            const imgSrc = product?.images?.[0] ?? null;
            const daysLeft = getDaysRemaining(op.nextBillingDate);

            return (
              <li key={`${op.OrderId}-${op.ProductId}`} className="flex items-center gap-3">
                <div
                  className="shrink-0 rounded-[12px] overflow-hidden bg-gray-100"
                  style={{ width: 56, height: 56 }}
                >
                  {imgSrc ? (
                    <Image
                      src={imgSrc}
                      alt={product.name}
                      width={56}
                      height={56}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                      ?
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className="font-semibold text-sm truncate"
                    style={{ color: '#2E1D21' }}
                  >
                    {product?.name ?? 'Jouet'}
                  </p>
                  {daysLeft !== null && (
                    <p className="text-xs mt-0.5" style={{ color: '#6EC1E4' }}>
                      {daysLeft > 0
                        ? `Renouvellement dans ${daysLeft} j`
                        : daysLeft === 0
                        ? 'Renouvellement aujourd\'hui'
                        : `Dépassé de ${Math.abs(daysLeft)} j`}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Link
        href="/mon-compte/commandes"
        className="text-sm font-semibold mt-auto"
        style={{ color: '#6EC1E4' }}
      >
        Voir toutes mes commandes →
      </Link>
    </div>
  );
}
