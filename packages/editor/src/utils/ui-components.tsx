import React, { PropsWithChildren } from 'react';

const JSX = { createElement: React.createElement };

interface IconProps {
  icon?: string;
  additionalClasses?: string[];
  // You can also allow passing other props like className, style, etc.
  className?: string;
}

const IvyIcon: React.FC<PropsWithChildren<IconProps>> = ({ icon, additionalClasses = [], className = '', children }) => {
  // Initialize the class list
  const cssClasses = ['ivy'];

  if (icon) {
    cssClasses.push(`ivy-${icon}`);
  }

  if (additionalClasses && additionalClasses.length > 0) {
    cssClasses.push(...additionalClasses);
  }

  // If there's a className prop, include it
  if (className) {
    cssClasses.push(className);
  }

  // Join all classes into a single string
  const finalClassName = cssClasses.join(' ');

  return <i className={finalClassName}>{children}</i>;
};

export default IvyIcon;
