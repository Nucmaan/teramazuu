export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <header className="flex flex-col gap-4 print:hidden border-b border-stone-line/70 bg-white/60 px-5 py-6 sm:flex-row sm:items-end sm:justify-between lg:px-10">
      <div>
        <span aria-hidden className="tricolore mb-4 block h-[2px] w-8" />
        <h1 className="font-display text-3xl text-espresso">{title}</h1>
        {description && <p className="mt-1 text-sm text-charcoal/60">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function PageBody({ children }: { children: React.ReactNode }) {
  return <div className="space-y-6 px-5 py-8 lg:px-10">{children}</div>;
}

export function PanelSkeleton() {
  return (
    <div className="space-y-6 px-5 py-8 lg:px-10" aria-busy="true">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-[4px] bg-white" />
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-[4px] bg-white" />
    </div>
  );
}
