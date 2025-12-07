import { auth } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import ButtonAccount from "@/components/ButtonAccount";

// This is a private page: It's protected by the layout.js component which ensures the user is authenticated.
// See https://shipfa.st/docs/tutorials/private-page
export default async function Dashboard() {
  await connectMongo();
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <main className="min-h-screen p-8 pb-24">
        <section className="max-w-xl mx-auto space-y-8">
          <h1 className="text-3xl md:text-4xl font-extrabold">
            User Dashboard
          </h1>
          <p>No session found</p>
        </section>
      </main>
    );
  }

  const user = await User.findById(session.user.id);
  const displayName = session.user.name || user?.name || "User";
  const displayEmail = session.user.email || user?.email || "";

  return (
    <main className="min-h-screen p-8 pb-24">
      <section className="max-w-xl mx-auto space-y-8">
        <ButtonAccount />
        <h1 className="text-3xl md:text-4xl font-extrabold">User Dashboard</h1>
        <p>Welcome {displayName} 👋</p>
        <p>Your email is {displayEmail || "Not set"}</p>
        <form action="/api/user" method="POST" className="space-y-2">
          <input type="hidden" name="email" value={displayEmail} />
          <button type="submit" className="btn btn-primary">
            Save
          </button>
        </form>
      </section>
    </main>
  );
}
