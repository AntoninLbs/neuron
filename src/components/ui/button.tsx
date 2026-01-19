// src/components/ui/button.tsx
import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-neuron-400 to-neuron-600 text-white hover:from-neuron-500 hover:to-neuron-700 shadow-lg shadow-neuron-500/25',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        success:
          'bg-success text-success-foreground hover:bg-success/90',
        answer:
          'border-2 border-border bg-card text-card-foreground hover:border-neuron-400 hover:bg-neuron-50 dark:hover:bg-neuron-950/20',
        'answer-selected':
          'border-2 border-neuron-500 bg-neuron-50 text-card-foreground dark:bg-neuron-950/30',
        'answer-correct':
          'border-2 border-green-500 bg-green-50 text-green-900 dark:bg-green-950/30 dark:text-green-100',
        'answer-incorrect':
          'border-2 border-red-500 bg-red-50 text-red-900 dark:bg-red-950/30 dark:text-red-100',
      },
      size: {
        default: 'h-11 px-6 py-2',
        sm: 'h-9 rounded-lg px-4',
        lg: 'h-14 rounded-xl px-8 text-base',
        xl: 'h-16 rounded-2xl px-10 text-lg',
        icon: 'h-11 w-11',
        'icon-sm': 'h-9 w-9',
        'icon-lg': 'h-14 w-14',
        // Touch-friendly sizes (44px minimum)
        touch: 'h-12 min-w-[44px] px-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
