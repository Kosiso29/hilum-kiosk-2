import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    className?: string;
}

const baseButtonClass = 'px-12 py-4 rounded-3xl text-2xl font-semibold transition-all flex items-center';

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ children, className = '', ...props }, ref) => {
        return (
            <button ref={ref} className={`${baseButtonClass} ${className}`} {...props}>
                {children}
            </button>
        );
    }
);
Button.displayName = 'Button';

export default Button; 