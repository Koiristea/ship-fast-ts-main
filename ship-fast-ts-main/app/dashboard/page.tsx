"use client";

import { useState } from "react";
import ButtonAccount from "@/components/ButtonAccount";
import apiClient from "@/libs/api";

// This is a private page: It's protected by the layout.js component which ensures the user is authenticated.
// See https://shipfa.st/docs/tutorials/private-page
export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(false);

  const saveUser = async () => {
    setIsLoading(true);

    try {
      const { data } = await apiClient.post("/user", {
        email: "new@gmail.com",
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
        <h1 className="text-3xl md:text-4xl font-extrabold">Private Page</h1>

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
      </section>
    </main>
  );
}
