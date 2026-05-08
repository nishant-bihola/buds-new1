import { useState } from "react";

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  blurHash?: string;
}

export function OptimizedImage({ src, alt, className, onLoad, ...props }: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoaded(true);
    onLoad?.(e);
  };

  return (
    <img
      src={src}
      alt={alt}
      loading="eager"
      decoding="sync"
      fetchPriority="high"
      className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
      onLoad={handleLoad}
      {...props}
    />
  );
}
