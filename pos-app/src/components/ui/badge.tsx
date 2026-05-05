import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const variants = cva('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold', {
  variants: {
    variant: {
      default:     'bg-primary/15 text-primary',
      success:     'bg-emerald-100 text-emerald-700',
      warning:     'bg-amber-100 text-amber-700',
      destructive: 'bg-red-100 text-red-700',
      secondary:   'bg-secondary text-secondary-foreground',
      outline:     'border border-current',
    },
  },
  defaultVariants: { variant: 'default' },
});

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof variants> {}
export const Badge = ({ className, variant, ...props }: BadgeProps) => (
  <span className={cn(variants({ variant }), className)} {...props} />
);
