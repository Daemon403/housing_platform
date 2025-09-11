"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NavLink = ({ href, label }: { href: string; label: string }) => {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname?.startsWith(href));
  return (
    <Link
      href={href}
      className={`px-3 py-2 rounded-md text-sm font-medium ${active ? "bg-primary-600 text-white" : "text-gray-700 hover:bg-gray-100"}`}
    >
      {label}
    </Link>
  );
};

export default function Navbar() {
  return (
    <nav className="border-b bg-white sticky top-0 z-40">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold text-primary-700">StudentHousing</Link>
        <div className="flex items-center gap-2">
          <NavLink href="/listings" label="Listings" />
          <NavLink href="/dashboard" label="Dashboard" />
          <NavLink href="/auth/login" label="Login" />
          <Link href="/auth/register" className="btn-secondary">Sign up</Link>
        </div>
      </div>
    </nav>
  );
}
