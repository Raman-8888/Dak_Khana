import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
    const variants = {
        primary: 'bg-primary-600 text-white hover:bg-primary-700',
        secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
        outline: 'border border-primary-600 text-primary-600 hover:bg-primary-50',
    };

    return (
        <button
            className={`px-4 py-2 rounded-md font-medium transition-colors ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
