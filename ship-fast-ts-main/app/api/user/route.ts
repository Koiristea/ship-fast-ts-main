import { NextResponse } from "next/server";
import { auth } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

export async function POST(req: Request) {
  const session = await auth();

  if (session) {
    const { id } = session.user;

    const body = await req.json();

    if (!body.email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    try {
      await connectMongo();

      let user = await User.findById(id);

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      user.email = body.email;

      // Ensure hasAccess is always initialized
      if (user.hasAccess === undefined || user.hasAccess === null) {
        user.hasAccess = false;
      }

      await user.save();

      return NextResponse.json({ data: user }, { status: 200 });
    } catch (e: any) {
      console.error(e);
      return NextResponse.json(
        { error: "Something went wrong" },
        { status: 500 },
      );
    }
  } else {
    // Not Signed in
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
}
