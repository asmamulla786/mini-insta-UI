import type React from 'react';
import { useState } from 'react';

type AvatarProps = {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
};

const sizeMap: Record<Required<AvatarProps>['size'], string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-12 w-12 text-sm',
  lg: 'h-16 w-16 text-base'
};

export const Avatar = ({ name, src, size = 'md' }: AvatarProps) => {
  const [hasError, setHasError] = useState(false);

  const handleError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.onerror = null;
    setHasError(true);
  };

  if (src && !hasError) {
    return (
      <img
        src={src}
        alt={name}
        onError={handleError}
        className={`${sizeMap[size]} rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`${sizeMap[size]} rounded-full bg-slate-800 text-center leading-[inherit] text-white`}
    >
      <span className="flex h-full w-full items-center justify-center">
        👤
      </span>
    </div>
  );
};

