import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      {/* pt-24 sm:pt-28 menjamin konten tidak tertutup floating navbar (top-4 + h-12 = 64px) di mobile, tablet, dan desktop */}
      <main className="flex flex-1 flex-col pt-24 sm:pt-28">{children}</main>
      <SiteFooter />
    </>
  );
}
