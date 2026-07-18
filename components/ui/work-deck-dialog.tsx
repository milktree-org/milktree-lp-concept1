"use client";

import { useState } from "react";
import { ArrowUpRight, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const DECK_SRC =
  "https://docs.google.com/presentation/d/e/2PACX-1vRBzIu8sNGzt-MTMS_GYMhreMMZ-Jo7FMv5QdWHTHGoU8uOK1AwkmBP2o6liXIropUDLsqj3mqsgzbs/pubembed?start=false&loop=false&delayms=2000";

/**
 * "View more work" — opens the full portfolio deck (Google Slides embed)
 * in a near-fullscreen dialog. The iframe only mounts once opened, so it
 * costs nothing on initial page load.
 */
export function WorkDeckDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="ghostPill" size="pill-lg" data-cursor="hover" />
        }
      >
        View more work
        <ArrowUpRight />
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        className="block w-[min(96vw,1440px)] max-w-none gap-0 overflow-hidden rounded-[2rem] border border-border bg-black p-0 ring-0 sm:max-w-none"
      >
        <DialogTitle className="sr-only">Milktree portfolio deck</DialogTitle>

        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-faint">
            Portfolio
          </p>
          <DialogClose
            data-cursor="hover"
            aria-label="Close"
            className="grid size-10 place-items-center rounded-full border border-border bg-white/[0.03] text-foreground transition-colors duration-200 hover:bg-white/[0.08]"
          >
            <X className="size-4" />
          </DialogClose>
        </div>

        <div className="relative aspect-[1440/839] max-h-[calc(90vh-4.5rem)] w-full bg-black">
          {open && (
            <iframe
              src={DECK_SRC}
              title="Milktree portfolio deck"
              className="absolute inset-0 h-full w-full"
              allowFullScreen
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
