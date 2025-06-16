
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Menu, Package2 } from 'lucide-react';

const navItems = [
  { href: '#', label: 'Home' },
  { href: '#', label: 'About' },
  { href: '#', label: 'Resources' },
  { href: '#', label: 'Contact' },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2" prefetch={false}>
          <Package2 className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-primary">GiziGO!</span>
        </Link>
        <nav className="hidden gap-6 text-sm font-medium md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-foreground/70 transition-colors hover:text-foreground"
              prefetch={false}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost">Login</Button>
          <Button>Get Started</Button>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Menu Navigasi</SheetTitle>
              <SheetDescription className="sr-only">
                Daftar tautan navigasi utama untuk perangkat mobile.
              </SheetDescription>
            </SheetHeader>
            <nav className="grid gap-6 text-lg font-medium mt-8">
              <Link href="/" className="flex items-center gap-2 text-lg font-semibold mb-4" prefetch={false}>
                <Package2 className="h-6 w-6 text-primary" />
                <span>GiziGO!</span>
              </Link>
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  prefetch={false}
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-4 flex flex-col gap-2">
                <Button variant="ghost" className="w-full justify-start">Login</Button>
                <Button className="w-full justify-start">Get Started</Button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
