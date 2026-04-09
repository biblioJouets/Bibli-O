import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prisma from "@/lib/core/database/index";
import OrdersTabs from "@/components/admin/OrdersTabs";

export const metadata = { title: "Commandes — Admin Bibli'O Jouets" };

// Forcer le rendu dynamique car on lit la session
export const dynamic = "force-dynamic";

const orderInclude = {
  Users: {
    select: { id: true, firstName: true, lastName: true, email: true, phone: true },
  },
  OrderProducts: {
    include: {
      Products: {
        select: { id: true, name: true, images: true, reference: true },
      },
    },
  },
};

export default async function AdminOrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const [rentalOrders, exchangeOrders, returningOrders, adoptionOrders] =
    await Promise.all([
      prisma.orders.findMany({
        where: { orderType: "RENTAL" },
        include: orderInclude,
        orderBy: { createdAt: "desc" },
      }),
      prisma.orders.findMany({
        where: { orderType: "EXCHANGE" },
        include: orderInclude,
        orderBy: { createdAt: "desc" },
      }),
      prisma.orders.findMany({
        where: { status: { in: ["RETURNING", "RETURNED"] } },
        include: orderInclude,
        orderBy: { updatedAt: "desc" },
      }),
      // Adoptions = commandes dédiées ADOPTION + commandes RENTAL/EXCHANGE
      // contenant au moins un jouet marqué ADOPTE (cas historique)
      prisma.orders.findMany({
        where: {
          OR: [
            { orderType: "ADOPTION" },
            {
              orderType: { in: ["RENTAL", "EXCHANGE"] },
              OrderProducts: { some: { renewalIntention: "ADOPTE" } },
            },
          ],
        },
        include: orderInclude,
        orderBy: { createdAt: "desc" },
      }),
    ]);

  // Exclure de Location les commandes dont TOUS les produits sont marqués ADOPTE
  const filteredRentalOrders = rentalOrders.filter((o) => {
    if (o.OrderProducts.length === 0) return true;
    return o.OrderProducts.some((op) => op.renewalIntention !== "ADOPTE");
  });

  // Sérialisation des dates pour passage au Client Component
  const serialize = (orders) =>
    orders.map((o) => ({
      ...o,
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
      rentalStartDate: o.rentalStartDate?.toISOString() ?? null,
      resetTokenExpiry: undefined,
      OrderProducts: o.OrderProducts.map((op) => ({
        ...op,
        rentalEndDate: op.rentalEndDate?.toISOString() ?? null,
        nextBillingDate: op.nextBillingDate?.toISOString() ?? null,
      })),
    }));

  return (
    <OrdersTabs
      rentalOrders={serialize(filteredRentalOrders)}
      exchangeOrders={serialize(exchangeOrders)}
      returningOrders={serialize(returningOrders)}
      adoptionOrders={serialize(adoptionOrders)}
    />
  );
}
