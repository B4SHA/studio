
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from './ui/button';
import { Menu, User } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { useAuth } from '@/context/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Loading from '../app/loading';

const navigationLinks = [
  { name: 'Dashboard', href: '/dashboard', auth: true },
  { name: 'News Sleuth', href: '/news-sleuth' },
  { name: 'Video Integrity', href: '/video-integrity' },
  { name: 'Audio Authenticator', href: '/audio-authenticator' },
  { name: 'Image Verifier', href: '/image-verifier' },
];

export function Header() {
  const pathname = usePathname();
  const { user, loading, logOut } = useAuth();

  const getAvatarFallback = () => {
    if (!user) return '';
    if (user.displayName) {
      return user.displayName.charAt(0).toUpperCase();
    }
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return <User className="h-5 w-5" />;
  };

  const visibleLinks = navigationLinks.filter(link => !link.auth || (link.auth && user));

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Icons.shield className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold tracking-tight text-foreground">
            Veritas Vision
          </span>
        </Link>
        
        <div className="flex items-center gap-4">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-6">
            {visibleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  pathname === link.href ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <ThemeToggle />

          {loading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          ) : user ? (
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL || ''} alt={user.displayName || user.email || 'User'} />
                    <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logOut}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-2">
                <Button asChild variant="ghost" size="sm">
                    <Link href="/login">Login</Link>
                </Button>
                <Button asChild size="sm">
                    <Link href="/login">Sign Up</Link>
                </Button>
            </div>
          )}

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader className="text-left mb-4">
                   <Link href="/" className="flex items-center space-x-2">
                      <Icons.shield className="h-8 w-8 text-primary" />
                      <span className="text-xl font-bold tracking-tight text-foreground">
                        Veritas Vision
                      </span>
                    </Link>
                </SheetHeader>
                <div className="grid gap-4 py-2">
                  {visibleLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        'flex items-center space-x-2 rounded-md p-2 text-lg font-medium',
                        pathname === link.href ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/80'
                      )}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
                 <div className="mt-auto pt-6 border-t">
                    {!user ? (
                        <div className="grid grid-cols-2 gap-4">
                            <Button asChild variant="outline">
                                <Link href="/login">Login</Link>
                            </Button>
                            <Button asChild>
                                <Link href="/login">Sign Up</Link>
                            </Button>
                        </div>
                    ) : (
                        <Button onClick={logOut} variant="outline" className="w-full">
                            Sign Out
                        </Button>
                    )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
