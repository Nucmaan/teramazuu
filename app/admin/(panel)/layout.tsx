import { Suspense } from "react";
import { LogOut } from "lucide-react";
import { AdminNav, AdminNavLinks } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/auth";
import { logout } from "@/app/admin/login/actions";

export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="lg:grid lg:min-h-svh lg:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="bg-espresso-deep text-ivory print:hidden lg:sticky lg:top-0 lg:flex lg:h-svh lg:flex-col">
        <div className="flex items-center justify-between gap-4 px-5 py-4 lg:block lg:py-7">
          <p className="font-display text-xl leading-none">
            Taste<span className="text-green">,</span> Click <span className="italic text-red">&amp;</span> Vote
          </p>
          <p className="text-[0.625rem] font-semibold uppercase tracking-[0.22em] text-ivory/45 lg:mt-2">Admin · #SCIM2026</p>
        </div>
        <div className="px-3 pb-3 lg:flex-1 lg:px-3">
          <Suspense fallback={<AdminNavLinks />}>
            <AdminNav />
          </Suspense>
        </div>
        <div className="border-t border-ivory/10 px-5 py-3 lg:p-4">
          <Suspense fallback={<div className="h-10" />}>
            <CurrentAdmin />
          </Suspense>
        </div>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

async function CurrentAdmin() {
  const admin = await requireAdmin();
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-sm text-ivory">{admin.name}</p>
        <p className="text-[0.6875rem] uppercase tracking-[0.12em] text-ivory/45">{admin.role.toLowerCase()}</p>
      </div>
      <form action={logout}>
        <button type="submit" aria-label="Sign out" className="grid size-9 place-items-center rounded-[3px] text-ivory/60 hover:bg-ivory/10 hover:text-ivory">
          <LogOut className="size-4" />
        </button>
      </form>
    </div>
  );
}
