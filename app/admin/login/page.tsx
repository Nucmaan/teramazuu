import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { LoginForm } from "@/app/admin/login/login-form";
import image from "@/public/images/photo/cups.jpg";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };

export default function LoginPage() {
  return (
    <div className="grid min-h-svh bg-ivory lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-espresso-deep lg:block">
        <Image src={image} alt="" fill placeholder="blur" sizes="50vw" className="object-cover opacity-80" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-espresso-deep/80 to-transparent" />
        <p className="absolute bottom-10 left-10 right-10 font-display text-4xl leading-tight text-ivory">
          Taste<span className="text-green">,</span> Click <span className="italic text-red">&amp;</span> Vote
          <span className="eyebrow mt-4 block text-ivory/70">Campaign administration · #SCIM2026</span>
        </p>
      </div>
      <main className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <span aria-hidden className="tricolore block w-12" />
          <h1 className="display mt-8 text-5xl text-espresso">Sign in</h1>
          <p className="mt-3 text-charcoal/65">Administrators of the Week of Italian Cuisine in the World 2026 campaign.</p>
          <Suspense fallback={<div className="mt-10 h-64" />}>
            <RedirectIfSignedIn />
            <LoginForm />
          </Suspense>
          <Link href="/" className="mt-10 inline-block text-sm text-charcoal/60 underline-offset-4 hover:underline">
            ← Back to the public site
          </Link>
        </div>
      </main>
    </div>
  );
}

async function RedirectIfSignedIn() {
  if (await getAdmin()) redirect("/admin");
  return null;
}
