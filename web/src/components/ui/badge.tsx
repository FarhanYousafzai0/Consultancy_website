import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

const badgeVariants = cva(
  "inline-flex h-7 w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full px-3 text-xs font-semibold whitespace-nowrap [&>svg]:pointer-events-none [&>svg]:size-3.5",
  {
    variants: {
      variant: {
        neutral: "bg-muted text-foreground/85",
        verified: "bg-secondary text-forest",
        predicted: "bg-amber-soft text-amber-ink",
        unverified: "bg-muted text-muted-foreground",
        reach: "bg-amber-soft text-amber-ink",
        match: "bg-primary text-primary-foreground",
        safety: "bg-slate-soft text-slate-ink",
        error: "bg-error-soft text-destructive",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
)

function Badge({
  className,
  variant = "neutral",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
