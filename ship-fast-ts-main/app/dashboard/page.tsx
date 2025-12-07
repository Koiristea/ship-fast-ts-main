"use client";

import { useState, useEffect } from "react";
import ButtonAccount from "@/components/ButtonAccount";
import apiClient from "@/libs/api";
import { useSession } from "next-auth/react";

// This is a private page: It's protected by the layout.js component which ensures the user is authenticated.
// See https://shipfa.st/docs/tutorials/private-page
export default function Dashboard() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (session?.user?.email) {
      setEmail(session.user.email);
    }
  }, [session]);

  const saveUser = async () => {
    setIsLoading(true);

    try {
      const { data } = await apiClient.post("/user", {
        email,
      });

      console.log(data);
    } catch (e: any) {
      console.error(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 pb-24">
      <section className="max-w-xl mx-auto space-y-8">
        <ButtonAccount />
        <h1 className="text-3xl md:text-4xl font-extrabold">User Dashboard</h1>

        {session?.user && (
          <div className="card bg-base-200 p-6 space-y-4">
            <p className="text-lg">
              Welcome <span className="font-bold">{session.user.name}</span> 👋
            </p>
            <p>
              Your email is <span className="font-mono">{session.user.email}</span>
            </p>
          </div>
        )}

        <div className="card bg-base-200 p-6 space-y-4">
          <h2 className="text-xl font-bold">Update Email</h2>
          <input
            type="email"
            className="input input-bordered w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter new email"
          />
          <button
            className="btn btn-primary"
            onClick={() => saveUser()}
            disabled={isLoading}
          >
            {isLoading && (
              <span className="loading loading-spinner loading-sm"></span>
            )}
            Save
          </button>
        </div>
      </section>
    </main>
  );
}
