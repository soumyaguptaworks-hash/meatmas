import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const variants = cva(
  'inline-flex items-center justify-center font-semibold transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 select-none',
  {
    variants: {
      variant: {
        default:     'bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg shadow-sm',
        success:     'bg-success text-success-foreground hover:bg-success/90 rounded-lg shadow-sm',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg',
        outline:     'border border-input bg-background hover:bg-accent rounded-lg',
        secondary:   'bg-secondary text-secondary-foreground hover:bg-secondary/70 rounded-lg',
        ghost:       'hover:bg-accent hover:text-accent-foreground rounded-md',
      },
      size: {
        default: 'h-10 px-4 py-2 text-sm',
        sm:      'h-8  px-3 text-xs',
        lg:      'h-12 px-6 text-base',
        xl:      'h-14 px-8 text-lg',
        icon:    'h-9 w-9',
        'icon-sm': 'h-7 w-7',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof variants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp ref={ref} className={cn(variants({ variant, size, className }))} {...props} />;
  },
);
Button.displayName = 'Button';
