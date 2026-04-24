'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:     'bg-emerald-500 text-white hover:bg-emerald-600',
        destructive: 'bg-red-500 text-white hover:bg-red-600',
        outline:     'border border-gray-600 bg-transparent text-white hover:bg-gray-700',
        secondary:   'bg-gray-700 text-white hover:bg-gray-600',
        ghost:       'hover:bg-gray-700 text-white',
        link:        'text-emerald-400 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm:      'h-8 rounded-md px-3 text-xs',
        lg:      'h-10 rounded-md px-8',
        icon:    'h-9 w-9',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  }
)
Button.displayName = 'Button'

export { buttonVariants }

const liquidButtonVariants = cva(
  'inline-flex items-center justify-center cursor-pointer gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,transform,box-shadow] duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 outline-none',
  {
    variants: {
      variant: {
        default:     'bg-transparent hover:scale-105 text-emerald-400',
        destructive: 'bg-red-500 text-white hover:bg-red-600',
        outline:     'border border-gray-600 bg-transparent text-white hover:bg-gray-700',
        secondary:   'bg-gray-700 text-white hover:bg-gray-600',
        ghost:       'hover:bg-gray-700 text-white',
        link:        'text-emerald-400 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm:      'h-8 text-xs px-4',
        lg:      'h-10 rounded-md px-6',
        xl:      'h-12 rounded-md px-8',
        xxl:     'h-14 rounded-md px-10',
        icon:    'h-9 w-9',
      },
    },
    defaultVariants: { variant: 'default', size: 'xxl' },
  }
)

export function LiquidButton({
  className,
  variant,
  size,
  asChild = false,
  children,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof liquidButtonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <>
      <GlassFilter />
      <Comp
        className={cn(liquidButtonVariants({ variant, size, className }))}
        style={{ filter: 'url(#glass-effect)' }}
        {...props}
      >
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </Comp>
    </>
  )
}

function GlassFilter() {
  return (
    <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden>
      <defs>
        <filter id="glass-effect" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" result="displaced" />
          <feComposite in="displaced" in2="SourceGraphic" operator="atop" />
        </filter>
      </defs>
    </svg>
  )
}
