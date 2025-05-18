import React from 'react';
import classNames from 'classnames';
import './Button.scss';

type ButtonSize = 'large' | 'middle' | 'small';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: ButtonSize;
  block?: boolean;
  className?: string;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  size = 'middle',
  block = false,
  className,
  children,
  ...props
}) => {
  const buttonClass = classNames(
    'custom-button',
    `button-${size}`,
    {
      'button-block': block,
    },
    className,
  );

  return (
    <button className={buttonClass} {...props}>
      {children}
    </button>
  );
};

export default Button;
