import { auth } from "@/libs/next-auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function DataLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin");
  }

  return <>{children}</>;
}
