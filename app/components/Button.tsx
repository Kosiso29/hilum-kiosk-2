import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    className?: string;
    variant?: 'primary' | 'secondary';
}

const baseButtonClass = 'px-12 py-4 rounded-3xl text-2xl font-semibold transition-all flex items-center justify-center';

const variants = {
    primary: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90',
    secondary: 'border-2 border-purple-500 text-purple-600 bg-white hover:bg-purple-50'
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ children, className = '', variant = 'primary', ...props }, ref) => {
        const variantClass = variants[variant] || variants.primary;
        return (
            <button ref={ref} className={`${baseButtonClass} ${variantClass} ${className}`} {...props}>
                {children}
            </button>
        );
    }
);
Button.displayName = 'Button';

export default Button; 