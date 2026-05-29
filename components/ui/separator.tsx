import { Root } from '@radix-ui/react-separator';
import { cn } from '@/lib/utils';
import type { ComponentPropsWithoutRef } from 'react';

function Separator({
  className,
  orientation = 'horizontal',
  decorative = true,
  ...props
}: ComponentPropsWithoutRef<typeof Root>) {
  return (
    <Root
      decorative={decorative}
      orientation={orientation}
      className={cn(
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
        className
      )}
      {...props}
    />
  );
}

export { Separator };
