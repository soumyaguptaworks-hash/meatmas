import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors select-none',
  {
    variants: {
      variant: {
        default:     'border-transparent bg-[#d94040]/10 text-[#d94040]',
        secondary:   'border-transparent bg-gray-100 text-gray-600',
        destructive: 'border-transparent bg-red-100 text-red-700',
        outline:     'border-gray-200 text-foreground bg-transparent',
        success:     'border-transparent bg-emerald-100 text-emerald-700',
        warning:     'border-transparent bg-amber-100 text-amber-700',
        info:        'border-transparent bg-blue-100 text-blue-700',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
