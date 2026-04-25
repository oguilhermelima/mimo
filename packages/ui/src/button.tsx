import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { Slot as SlotPrimitive } from "radix-ui";

import { cn } from "@caixa/ui";

export const buttonVariants = cva(
  "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex shrink-0 items-center justify-center gap-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 active:translate-y-px [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-b from-primary to-primary/85 text-primary-foreground shadow-md shadow-primary/30 inset-shadow-[0_1px_0_rgb(255_255_255/0.22)] hover:to-primary/95 hover:shadow-lg hover:shadow-primary/40 active:shadow-sm active:shadow-primary/20",
        destructive:
          "bg-gradient-to-b from-destructive to-destructive/85 text-white shadow-md shadow-destructive/30 inset-shadow-[0_1px_0_rgb(255_255_255/0.22)] focus-visible:ring-destructive/30 hover:to-destructive/95 hover:shadow-lg hover:shadow-destructive/40 active:shadow-sm",
        outline:
          "border bg-background text-foreground shadow-sm shadow-foreground/5 inset-shadow-[0_1px_0_rgb(255_255_255/0.5)] hover:bg-accent hover:text-accent-foreground hover:shadow-md hover:shadow-foreground/10 active:shadow-xs",
        secondary:
          "bg-gradient-to-b from-secondary to-secondary/85 text-secondary-foreground shadow-md shadow-foreground/10 inset-shadow-[0_1px_0_rgb(255_255_255/0.4)] hover:to-secondary/95 hover:shadow-lg hover:shadow-foreground/15 active:shadow-sm",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2 has-[>svg]:px-4",
        sm: "h-8 gap-1.5 rounded-lg px-3 has-[>svg]:px-2.5",
        lg: "h-11 rounded-2xl px-6 has-[>svg]:px-5",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? SlotPrimitive.Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
