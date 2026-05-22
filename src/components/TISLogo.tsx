'use client';

import { useState } from 'react';

export default function TISLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { img: 'w-10 h-10' },
    md: { img: 'w-20 h-20' },
    lg: { img: 'w-32 h-32' },
  };

  const s = sizes[size];
  const [src, setSrc] = useState('/tis-logo.png');

  return (
    <div className="flex flex-col items-center">
      <img
        src={src}
        alt="TIS - The Innovators Studio"
        className={`${s.img} rounded-full object-cover`}
        draggable={false}
        onError={() => setSrc('/tis-logo.svg')}
      />
    </div>
  );
}
