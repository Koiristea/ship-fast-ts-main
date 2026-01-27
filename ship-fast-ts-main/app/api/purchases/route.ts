import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import config from "@/config";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await connectMongo();

    const user = await User.findById(session.user.id).lean();

    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    const customerId = user?.customerId;

    let purchases: Array<{
      id: string;
      fecha: string;
      monto: number;
      moneda: string;
      estado: string;
      enlace?: string | null;
      tipo?: string;
    }> = [];

    if (stripeSecret && customerId) {
      const stripe = new Stripe(stripeSecret, {
        apiVersion: "2023-08-16",
        typescript: true,
      });

      try {
        // Obtener suscripciones activas
        const subscriptions = await stripe.subscriptions.list({
          customer: customerId,
          status: "active",
          limit: 50,
        });

        // Añadir suscripciones activas a la lista de compras
        purchases = subscriptions.data.map((subscription) => ({
          id: subscription.id,
          fecha: new Date(subscription.created * 1000).toISOString().slice(0, 10),
          monto:
            ((subscription.items.data[0]?.price?.unit_amount ?? 0) as number) /
            100,
          moneda:
            subscription.items.data[0]?.price?.currency?.toUpperCase() ?? "USD",
          estado: subscription.status ?? "desconocido",
          tipo: "Suscripción",
          enlace: null,
        }));

        // Obtener facturas
        const invoices = await stripe.invoices.list({
          customer: customerId,
          limit: 50,
        });

        // Añadir facturas a la lista
        purchases.push(
          ...invoices.data.map((invoice) => ({
            id: invoice.id,
            fecha: new Date(invoice.created * 1000).toISOString().slice(0, 10),
            monto:
              ((invoice.amount_paid ?? invoice.amount_due ?? 0) as number) /
              100,
            moneda: invoice.currency?.toUpperCase() ?? "USD",
            estado: invoice.status ?? "desconocido",
            tipo: "Factura",
            enlace: invoice.hosted_invoice_url ?? invoice.invoice_pdf ?? null,
          }))
        );

        // Ordenar por fecha descendente
        purchases.sort(
          (a, b) =>
            new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        );
      } catch (stripeError: any) {
        // Si el cliente no existe en Stripe, limpiar el customerId del usuario
        if (stripeError?.code === "resource_missing") {
          console.log(
            `Customer ${customerId} no encontrado en Stripe, limpiando datos...`
          );
          await User.findByIdAndUpdate(session.user.id, {
            customerId: null,
            priceId: null,
            hasAccess: false,
          });
          purchases = [];
        } else {
          throw stripeError;
        }
      }
    }

    const plan = config.stripe.plans.find((p) => p.priceId === user?.priceId);

    return NextResponse.json({
      user: {
        id: user?._id?.toString(),
        name: user?.name ?? session.user.name ?? "",
        email: user?.email ?? session.user.email ?? "",
        plan: plan?.name ?? null,
        priceId: user?.priceId ?? null,
        customerId: user?.customerId ?? null,
        hasAccess: user?.hasAccess ?? false,
      },
      purchases,
    });
  } catch (error) {
    console.error("Error al obtener compras:", error);
    return NextResponse.json(
      { error: "Error al obtener las compras" },
      { status: 500 },
    );
  }
}
