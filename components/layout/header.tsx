"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { nav } from "@/lib/site";
import { AnchorLink } from "@/components/layout/anchor-link";
import { StartButton } from "@/components/layout/start-button";
import { Wordmark } from "@/components/layout/wordmark";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { motion } from "framer-motion";
import { EASE_OUT_EXPO } from "@/lib/motion";

/**
 * Sticky header (§6). Transparent over the hero, gains a blurred dark
 * background once scrolled. Desktop dropdowns via NavigationMenu; mobile
 * full-screen Sheet with staggered links.
 */
export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [open, setOpen] = useState(false);
  const isHome = usePathname() === "/";

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      // The hero owns the only yellow element in the first viewport (§3);
      // the header CTA turns yellow once the hero CTA has scrolled away.
      setPastHero(window.scrollY > window.innerHeight * 0.6);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const ctaVariant = isHome && !pastHero ? "ghostPill" : "brand";

  return (
    <header
      className={cn(
        "site-header fixed inset-x-0 top-0 z-50 transition-colors duration-500",
        scrolled
          ? "border-b border-border bg-black/70 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="container-edge flex h-16 items-center justify-between gap-4 md:h-20">
        {isHome ? (
          <AnchorLink
            href="#top"
            aria-label="Milktree — back to top"
            className="relative z-10 inline-flex min-h-11 items-center"
          >
            <Wordmark className="h-[1.35rem] md:h-[1.6rem]" />
          </AnchorLink>
        ) : (
          <Link
            href="/"
            aria-label="Milktree — home"
            data-cursor="hover"
            className="relative z-10 inline-flex min-h-11 items-center"
          >
            <Wordmark className="h-[1.35rem] md:h-[1.6rem]" />
          </Link>
        )}

        {/* Desktop nav */}
        <nav className="hidden lg:block">
          <NavigationMenu closeDelay={150}>
            <NavigationMenuList className="gap-0.5">
              {nav.map((item) =>
                item.children ? (
                  <NavigationMenuItem key={item.label}>
                    <NavigationMenuTrigger className="bg-transparent text-sm font-medium text-muted-foreground hover:bg-white/5 hover:text-foreground data-popup-open:bg-white/5 data-popup-open:text-foreground">
                      {item.label}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[320px] gap-1 p-2">
                        {item.children.map((child) => (
                          <li key={child.label}>
                            <NavigationMenuLink
                              href={child.href}
                              closeOnClick
                              className="flex flex-col items-stretch gap-0 rounded-2xl p-3 transition-colors hover:bg-white/5 focus:bg-white/5"
                              render={<AnchorLink href={child.href} />}
                            >
                              <span className="text-sm font-semibold text-foreground">
                                {child.label}
                              </span>
                              {child.desc && (
                                <span className="mt-0.5 text-xs text-faint">
                                  {child.desc}
                                </span>
                              )}
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ) : (
                  <NavigationMenuItem key={item.label}>
                    <NavigationMenuLink
                      href={item.href}
                      closeOnClick
                      className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground focus:bg-white/5 focus:text-foreground"
                      render={<AnchorLink href={item.href} />}
                    >
                      {item.label}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ),
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        {/* Right actions — book CTA always visible; full label on desktop */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 md:gap-3">
          <Link
            href="/login"
            className="hidden min-h-11 items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground md:inline-flex"
          >
            Client login
          </Link>
          <StartButton
            size="pill"
            variant={ctaVariant}
            withIcon={false}
            source="Header"
            className="h-11 shrink-0 px-3.5 text-[0.78rem] sm:px-5 sm:text-[0.85rem] lg:hidden"
          >
            Get started
          </StartButton>
          <StartButton
            size="pill"
            variant={ctaVariant}
            source="Header"
            className="hidden h-11 lg:inline-flex"
          >
            Get started
          </StartButton>

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <button
                  aria-label="Open menu"
                  className="inline-flex size-11 items-center justify-center rounded-full border border-border bg-white/5 lg:hidden"
                />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full border-l-0 bg-background sm:max-w-md"
            >
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="flex h-full flex-col px-6 pt-16 pb-10">
                <nav className="flex flex-col gap-1">
                  {nav.map((item, i) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: EASE_OUT_EXPO, delay: 0.05 + i * 0.06 }}
                    >
                      <AnchorLink
                        href={item.href}
                        onNavigate={() => setOpen(false)}
                        className="block py-3 text-2xl font-bold tracking-tight text-foreground"
                      >
                        {item.label}
                      </AnchorLink>
                    </motion.div>
                  ))}
                </nav>
                <div className="mt-auto flex flex-col gap-3">
                  <StartButton size="pill-lg" source="Mobile Menu" className="w-full">
                    Get started
                  </StartButton>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="text-center text-sm font-medium text-muted-foreground"
                  >
                    Client login
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
