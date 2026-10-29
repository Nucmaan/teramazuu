import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-svh place-items-center bg-ivory px-6">
      <div className="max-w-lg text-center">
        <span aria-hidden className="tricolore mx-auto block w-16" />
        <p className="display mt-10 text-[clamp(5rem,16vw,10rem)] italic leading-none text-espresso/15">404</p>
        <h1 className="display mt-2 text-5xl text-espresso">
          This page has been <span className="italic text-red">eaten.</span>
        </h1>
        <p className="mt-6 text-charcoal/70">The page you&rsquo;re looking for doesn&rsquo;t exist.</p>
        <Link
          href="/"
          className="mt-10 inline-flex h-14 items-center bg-espresso px-8 text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-ivory transition-colors hover:bg-green"
        >
          Return home
        </Link>
      </div>
    </main>
  );
}
