import { useState } from 'react';

interface FallbackImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: React.ReactNode;
}

export default function FallbackImage({ fallback, ...props }: FallbackImageProps) {
  const [hasError, setHasError] = useState(false);
  if (hasError) return fallback ? <>{fallback}</> : null;
  return <img {...props} onError={() => setHasError(true)} />;
}
