"use client";

import type { ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export type AppDialogSize = "compact" | "medium" | "large" | "xlarge" | "full";

const sizeClassName: Record<AppDialogSize, string> = {
  compact: "sm:max-w-sm h-[min(70dvh,420px)]",
  medium: "sm:max-w-lg h-[min(80dvh,560px)]",
  large: "sm:max-w-3xl h-[min(85dvh,680px)]",
  xlarge: "sm:max-w-6xl h-[min(85dvh,800px)]",
  full: "w-full max-w-[calc(100vw-2rem)] sm:max-w-[min(90vw,1763px)] h-[min(90dvh,900px)] sm:rounded-lg",
};

type AppDialogProps = {
  open: boolean;
  onClose: () => void;
  header: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: AppDialogSize;
  contentClassName?: string;
  bodyClassName?: string;
};

export function AppDialog({
  open,
  onClose,
  header,
  description,
  children,
  footer,
  size = "compact",
  contentClassName,
  bodyClassName,
}: AppDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent
        className={cn(
          "grid-rows-[auto_minmax(0,1fr)_auto]",
          sizeClassName[size],
          contentClassName,
        )}
        {...(!description ? { "aria-describedby": undefined } : {})}
      >
        <DialogHeader>
          <DialogTitle>{header}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        <ScrollArea className="h-full min-h-0">
          <div className={cn("min-h-0", bodyClassName)}>{children}</div>
        </ScrollArea>
        {footer ? <DialogFooter>{footer}</DialogFooter> : null}
      </DialogContent>
    </Dialog>
  );
}
