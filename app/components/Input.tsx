import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    className?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', ...props }, ref) => {
        return <input ref={ref} className={className} {...props} />;
    }
);
Input.displayName = 'Input';

export default Input; 