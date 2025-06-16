import type { SVGProps } from 'react';

export const Logo = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect width="100%" height="100%" fill="hsl(var(--primary))" rx="5"/>
    <text 
      x="50%" 
      y="50%" 
      dominantBaseline="middle" 
      textAnchor="middle" 
      fontFamily="Inter, sans-serif" 
      fontSize="12" 
      fontWeight="bold"
      fill="hsl(var(--primary-foreground))"
    >
      SehatHub
    </text>
  </svg>
);
