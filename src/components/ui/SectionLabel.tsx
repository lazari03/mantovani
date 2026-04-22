import React from 'react';
import { cn } from '@/lib/utils';

interface SectionLabelProps {
  text: string;
  className?: string;
  color?: string;
}

export const SectionLabel: React.FC<SectionLabelProps> = ({
  text,
  className,
  color = '#B8B8B8',
}) => {
  return (
    <span
      className={cn('text-label uppercase tracking-[0.1em] block mb-6', className)}
      style={{ color }}
    >
      {text}
    </span>
  );
};

export default SectionLabel;
