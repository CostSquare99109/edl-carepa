import { useState } from 'react';

interface AvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  src?: string;
  alt?: string;
  fallback?: string;
  className?: string;
}

const sizeMap: Record<string, string> = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-14 h-14', xl: 'w-20 h-20' };
const textMap: Record<string, string> = { sm: 'text-xs', md: 'text-sm', lg: 'text-lg', xl: 'text-2xl' };

export function Avatar({ size = 'md', src, alt, fallback, className = '' }: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const sz = sizeMap[size] || sizeMap.md;
  const tx = textMap[size] || textMap.md;

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={alt || ''}
        onError={() => setImgError(true)}
        className={`${sz} rounded-full object-cover ${className}`}
      />
    );
  }
  return (
    <div className={`${sz} rounded-full bg-inst-gris-med flex items-center justify-center ${tx} font-semibold text-inst-texto-claro ${className}`}>
      {fallback || '?'}
    </div>
  );
}
