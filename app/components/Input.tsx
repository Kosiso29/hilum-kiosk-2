import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    className?: string;
}

const baseInputClass = 'w-full p-4 text-2xl border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500';

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', ...props }, ref) => {
        return <input ref={ref} className={`${baseInputClass} ${className}`} {...props} />;
    }
);
Input.displayName = 'Input';

export default Input; 