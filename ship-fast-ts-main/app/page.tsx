import { Suspense } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import FeaturesAccordion from "@/components/FeaturesAccordion";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import { getSEOTags, renderSchemaTags } from "@/libs/seo";
import config from "@/config";

export const metadata = getSEOTags({
  title: `${config.appName} | Launch your startup fast`,
  canonicalUrlRelative: "/",
});

export default function Home() {
  return (
    <>
      {renderSchemaTags()}
      <Suspense>
        <Header />
      </Suspense>
      <main className="flex min-h-screen flex-col items-center justify-center text-center gap-12 p-8">
        <h1 className="text-3xl font-extrabold">Ship Fast</h1>

        <Hero />
        <Problem />
        <FeaturesAccordion />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
