import { randomBytes } from "crypto";
import Stripe from "stripe";
import prisma from "@/lib/core/database";
import { emailService } from "@/lib/modules/emails/email.service";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const POSTAL_FEE_CENTS = 200;

export function generateGiftCode() {
  const part = () => randomBytes(3).toString("hex").toUpperCase().slice(0, 4);
  return `BJ-${part()}-${part()}`;
}

async function createUniqueCode() {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateGiftCode();
    const existing = await prisma.giftCode.findUnique({ where: { code } });
    if (!existing) return code;
  }
  throw new Error("Impossible de générer un code unique.");
}

function readGiftMeta(raw) {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export async function createGiftCardCheckoutSession({ userId, email, giftDeliveryMethod, shippingData, baseUrl }) {
  const dbUser = await prisma.users.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true, email: true },
  });

  const dbCart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: true },
  });

  if (!dbCart?.items?.length) {
    const error = new Error("Votre panier est vide.");
    error.status = 400;
    throw error;
  }

  const hasOther = dbCart.items.some((item) => item.intent !== "GIFT_CARD");
  const giftItem = dbCart.items.find((item) => item.intent === "GIFT_CARD");
  if (hasOther || !giftItem) {
    const error = new Error("Une carte-cadeau ne peut pas être mélangée avec des jouets ou un abonnement.");
    error.status = 400;
    throw error;
  }

  const amount = giftItem.customAmount;
  if (!Number.isInteger(amount) || amount < 10 || amount > 500) {
    const error = new Error("Le montant de la carte cadeau est invalide.");
    error.status = 400;
    throw error;
  }

  const method = giftDeliveryMethod === "POSTAL" ? "POSTAL" : "EMAIL";
  const shippingName = String(shippingData?.shippingName || "").trim();
  const shippingAddress = String(shippingData?.shippingAddress || "").trim();
  const shippingZip = String(shippingData?.shippingZip || "").trim();
  const shippingCity = String(shippingData?.shippingCity || "").trim();
  const shippingPhone = String(shippingData?.shippingPhone || "").trim();

  if (method === "POSTAL" && (!shippingName || !shippingAddress || !shippingZip || !shippingCity)) {
    const error = new Error("Renseignez l'adresse de livraison postale.");
    error.status = 400;
    throw error;
  }

  const giftMeta = readGiftMeta(giftItem.giftMetadata);
  const recipientName = [giftMeta.recipientFirstName, giftMeta.recipientLastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  const lineItems = [
    {
      price_data: {
        currency: "eur",
        product_data: {
          name: `Carte cadeau Bibli'o Jouets — ${amount} €`,
          description: method === "POSTAL" ? "Carte au format postal" : "Code envoyé par e-mail",
        },
        unit_amount: amount * 100,
      },
      quantity: 1,
    },
  ];

  if (method === "POSTAL") {
    lineItems.push({
      price_data: {
        currency: "eur",
        product_data: { name: "Livraison postale de la carte cadeau" },
        unit_amount: POSTAL_FEE_CENTS,
      },
      quantity: 1,
    });
  }

  const session = await stripe.checkout.sessions.create({
    line_items: lineItems,
    mode: "payment",
    ...(dbUser?.stripeCustomerId
      ? { customer: dbUser.stripeCustomerId, customer_update: { address: "auto", name: "auto" } }
      : { customer_email: email || dbUser?.email }),
    allow_promotion_codes: false,
    success_url: `${baseUrl}/confirmation-commande?session_id={CHECKOUT_SESSION_ID}&type=gift`,
    cancel_url: `${baseUrl}/paiement`,
    billing_address_collection: "required",
    metadata: {
      orderType: "GIFT_CARD",
      userId: String(userId),
      cartId: String(dbCart.id),
      customAmount: String(amount),
      giftDeliveryMethod: method,
      recipientName: recipientName.slice(0, 200),
      recipientEmail: String(giftMeta.recipientEmail || "").slice(0, 200),
      message: String(giftMeta.message || "").slice(0, 450),
      offerToSomeone: giftMeta.offerToSomeone ? "true" : "false",
      shippingName: method === "POSTAL" ? shippingName.slice(0, 200) : "",
      shippingAddress: method === "POSTAL" ? shippingAddress.slice(0, 200) : "",
      shippingZip: method === "POSTAL" ? shippingZip.slice(0, 20) : "",
      shippingCity: method === "POSTAL" ? shippingCity.slice(0, 100) : "",
      shippingPhone: method === "POSTAL" ? shippingPhone.slice(0, 20) : "",
    },
  });

  return session.url;
}

export async function fulfillGiftCardOrder(session) {
  const meta = session.metadata || {};
  if (meta.orderType !== "GIFT_CARD") return null;

  const existing = await prisma.orders.findFirst({
    where: {
      orderType: "GIFT_CARD",
      giftMetadata: { path: ["stripeSessionId"], equals: session.id },
    },
    include: { giftCode: true },
  });

  if (existing) {
    if (meta.cartId) {
      await prisma.cartItem.deleteMany({ where: { cartId: parseInt(meta.cartId, 10) } });
    }
    return existing;
  }

  const userId = parseInt(meta.userId, 10);
  const amount = parseInt(meta.customAmount, 10);
  const method = meta.giftDeliveryMethod === "POSTAL" ? "POSTAL" : "EMAIL";
  const cartId = meta.cartId ? parseInt(meta.cartId, 10) : null;

  let giftMeta = {
    offerToSomeone: meta.offerToSomeone === "true",
    recipientName: meta.recipientName || "",
    recipientEmail: meta.recipientEmail || "",
    message: meta.message || "",
  };

  if (cartId) {
    const cartItem = await prisma.cartItem.findFirst({
      where: { cartId, intent: "GIFT_CARD" },
    });
    const fromCart = readGiftMeta(cartItem?.giftMetadata);
    if (fromCart && Object.keys(fromCart).length > 0) {
      giftMeta = { ...giftMeta, ...fromCart };
    }
  }

  const recipientName = (
    giftMeta.recipientName ||
    [giftMeta.recipientFirstName, giftMeta.recipientLastName].filter(Boolean).join(" ")
  ).trim() || null;
  const recipientEmail = String(giftMeta.recipientEmail || "").trim() || null;
  const message = String(giftMeta.message || "").trim() || null;
  const code = await createUniqueCode();

  const shipping = {
    shippingName: meta.shippingName || null,
    shippingAddress: meta.shippingAddress || null,
    shippingZip: meta.shippingZip || null,
    shippingCity: meta.shippingCity || null,
    shippingPhone: meta.shippingPhone || null,
  };

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.orders.create({
      data: {
        userId,
        totalAmount: (session.amount_total || 0) / 100,
        status: method === "POSTAL" ? "PREPARING" : "SHIPPED",
        orderType: "GIFT_CARD",
        giftDeliveryMethod: method,
        giftMetadata: {
          ...giftMeta,
          stripeSessionId: session.id,
          amount,
          postalFee: method === "POSTAL" ? 2 : 0,
        },
        ...shipping,
      },
    });

    await tx.giftCode.create({
      data: {
        code,
        amount,
        orderId: created.id,
        purchasedById: userId,
        recipientName,
        recipientEmail,
        message,
      },
    });

    return created;
  });

  if (cartId) {
    await prisma.cartItem.deleteMany({ where: { cartId } });
  }

  try {
    const buyer = await prisma.users.findUnique({ where: { id: userId } });
    await emailService.sendGiftCardEmails({
      buyer,
      code,
      amount,
      method,
      recipientName,
      recipientEmail,
      message,
      orderId: order.id,
      shipping,
    });
  } catch (emailError) {
    console.error("[GiftCard] Commande créée, e-mails en échec :", emailError);
  }

  return order;
}
