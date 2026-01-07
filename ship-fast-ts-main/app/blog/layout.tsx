import { Suspense } from "react";
import HeaderBlog from "./_assets/components/HeaderBlog";
import Footer from "@/components/Footer";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default async function LayoutBlog({ children }: { children: any }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <SidebarTrigger />
          <Suspense>
            <HeaderBlog />
          </Suspense>
        </div>

        <main className="min-h-screen max-w-6xl mx-auto p-8">{children}</main>

        <div className="h-24" />

        <Footer />
      </SidebarInset>
    </SidebarProvider>
  );
}
