import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    children: React.ReactNode;
}

export default function Button({
    variant = 'primary',
    size = 'md',
    loading = false,
    children,
    className = '',
    disabled,
    ...props
}: ButtonProps) {

    const baseClasses = "font-bold rounded-2xl transition-all inline-flex items-center justify-center gap-2";

    const variantClasses = {
        primary: "bg-brand-blue text-white hover:bg-brand-dark shadow-lg shadow-brand-blue/20 hover:scale-105 active:scale-95",
        secondary: "bg-slate-100 text-brand-dark hover:bg-slate-200",
        outline: "border-2 border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white",
        ghost: "text-brand-dark hover:bg-slate-100"
    };

    const sizeClasses = {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg"
    };

    const isDisabled = disabled || loading;

    return (
        <button
            className={`
        ${baseClasses} 
        ${variantClasses[variant]} 
        ${sizeClasses[size]}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
            disabled={isDisabled}
            {...props}
        >
            {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {children}
        </button>
    );
}
