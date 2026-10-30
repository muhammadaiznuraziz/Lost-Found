import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({
  href = "/",
  className,
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center transition-opacity hover:opacity-90 focus-visible:outline-none",
        className,
      )}
      aria-label="Lost & Found - Ke Beranda"
    >
      <Image
        src="/logo.svg"
        alt="Lost & Found Logo"
        width={110}
        height={36}
        priority
        className="h-7 w-auto object-contain"
      />
    </Link>
  );
}
