import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

/**
 * Admin endpoint to manually update user hasAccess status
 * POST /api/admin/update-access
 * Body: { email: string, hasAccess: boolean }
 * Headers: { "x-admin-key": process.env.ADMIN_SECRET } (optional, for non-authenticated requests)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const adminKey = req.headers.get("x-admin-key");
    const adminSecret = process.env.ADMIN_SECRET;

    // Check authentication: either have a session OR provide correct admin key
    if (!session?.user?.email && (!adminSecret || adminKey !== adminSecret)) {
      return NextResponse.json(
        {
          error:
            "No autorizado. Proporciona una sesión válida o x-admin-key header.",
        },
        { status: 401 },
      );
    }

    await connectMongo();

    const { email, hasAccess, customerId, priceId } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email es requerido" },
        { status: 400 },
      );
    }

    // At least one field must be provided to update
    const update: Record<string, any> = {};
    if (typeof hasAccess === "boolean") update.hasAccess = hasAccess;
    if (customerId) update.customerId = customerId;
    if (priceId) update.priceId = priceId;

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { error: "Debe enviar al menos uno de: hasAccess, customerId, priceId" },
        { status: 400 },
      );
    }

    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { $set: update },
      { new: true },
    );

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: "Usuario actualizado correctamente",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        hasAccess: user.hasAccess,
        customerId: user.customerId,
        priceId: user.priceId,
      },
    });
  } catch (error) {
    console.error("Error updating user access:", error);
    return NextResponse.json(
      { error: "Error al actualizar usuario" },
      { status: 500 },
    );
  }
}

/**
 * GET endpoint to check user access status
 * GET /api/admin/update-access?email=user@example.com
 * Headers: { "x-admin-key": process.env.ADMIN_SECRET } (optional, for non-authenticated requests)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const adminKey = req.headers.get("x-admin-key");
    const adminSecret = process.env.ADMIN_SECRET;

    // Check authentication: either have a session OR provide correct admin key
    if (!session?.user?.email && (!adminSecret || adminKey !== adminSecret)) {
      return NextResponse.json(
        {
          error:
            "No autorizado. Proporciona una sesión válida o x-admin-key header.",
        },
        { status: 401 },
      );
    }

    await connectMongo();

    const email = req.nextUrl.searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email es requerido" },
        { status: 400 },
      );
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        hasAccess: user.hasAccess,
        customerId: user.customerId,
        priceId: user.priceId,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Error al obtener usuario" },
      { status: 500 },
    );
  }
}
