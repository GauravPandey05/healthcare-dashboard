import { useMediaQuery } from 'react-responsive';

export const BreakpointIndicator = () => {
  // Only show in development
  if (import.meta.env.MODE !== 'development') {
    return null;
  }

  const isXs = useMediaQuery({ maxWidth: 639 });
  const isSm = useMediaQuery({ minWidth: 640, maxWidth: 767 });
  const isMd = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
  const isLg = useMediaQuery({ minWidth: 1024, maxWidth: 1279 });
  const isXl = useMediaQuery({ minWidth: 1280, maxWidth: 1535 });
  const is2Xl = useMediaQuery({ minWidth: 1536 });

  const getActiveBreakpoint = () => {
    if (isXs) return { name: 'xs', color: 'bg-pink-500' };
    if (isSm) return { name: 'sm', color: 'bg-blue-500' };
    if (isMd) return { name: 'md', color: 'bg-green-500' };
    if (isLg) return { name: 'lg', color: 'bg-yellow-500' };
    if (isXl) return { name: 'xl', color: 'bg-purple-500' };
    if (is2Xl) return { name: '2xl', color: 'bg-red-500' };
    return { name: 'unknown', color: 'bg-gray-500' };
  };

  const breakpoint = getActiveBreakpoint();

  return (
    <div className="fixed bottom-16 md:bottom-4 right-4 z-50">
      <div className={`${breakpoint.color} text-white text-xs font-bold px-2 py-1 rounded-md shadow opacity-75`}>
        {breakpoint.name}
      </div>
    </div>
  );
};