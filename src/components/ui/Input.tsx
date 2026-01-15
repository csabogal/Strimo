import { type InputHTMLAttributes, forwardRef } from 'react'

import { twMerge } from 'tailwind-merge'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={twMerge(
                        'flex h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all disabled:cursor-not-allowed disabled:opacity-50',
                        error && 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50',
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p className="mt-1 text-xs text-red-400">{error}</p>
                )}
            </div>
        )
    }
)
Input.displayName = 'Input'
