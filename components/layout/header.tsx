"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { nav } from "@/lib/site";
import { AnchorLink } from "@/components/layout/anchor-link";
import { BookButton } from "@/components/layout/book-button";
import { Wordmark } from "@/components/layout/wordmark";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
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
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-500",
        scrolled
          ? "border-b border-border bg-black/70 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="container-edge flex h-16 items-center justify-between gap-4 md:h-20">
        <AnchorLink
          href="#top"
          aria-label="Milktree — back to top"
          className="relative z-10 inline-flex min-h-11 items-center"
        >
          <Wordmark className="h-[1.35rem] md:h-[1.6rem]" />
        </AnchorLink>

        {/* Desktop nav */}
        <nav className="hidden lg:block">
          <NavigationMenu>
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
                            <AnchorLink
                              href={child.href}
                              onNavigate={() => setOpen(false)}
                              className="block rounded-2xl p-3 transition-colors hover:bg-white/5"
                            >
                              <span className="block text-sm font-semibold text-foreground">
                                {child.label}
                              </span>
                              {child.desc && (
                                <span className="mt-0.5 block text-xs text-faint">
                                  {child.desc}
                                </span>
                              )}
                            </AnchorLink>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ) : (
                  <NavigationMenuItem key={item.label}>
                    <AnchorLink
                      href={item.href}
                      className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                    >
                      {item.label}
                    </AnchorLink>
                  </NavigationMenuItem>
                ),
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        {/* Right actions — book CTA always visible; full label on desktop */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 md:gap-3">
          <a
            href="#"
            className="hidden min-h-11 items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground md:inline-flex"
          >
            Client login
          </a>
          <BookButton
            size="pill"
            className="h-11 shrink-0 px-3.5 text-[0.78rem] sm:px-5 sm:text-[0.85rem] lg:hidden"
          >
            Book brand audit
          </BookButton>
          <BookButton size="pill" className="hidden h-11 lg:inline-flex">
            Book a brand audit
          </BookButton>

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
                  <BookButton size="pill-lg" className="w-full">
                    Book a free brand audit
                  </BookButton>
                  <a
                    href="#"
                    className="text-center text-sm font-medium text-muted-foreground"
                  >
                    Client login
                  </a>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
