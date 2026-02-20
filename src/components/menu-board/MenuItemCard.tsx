import React, { useState } from 'react';
import ItemBadge from './ItemBadge';

interface Badge {
  type: string;
  label: string;
}

interface MenuItemCardProps {
  name: string;
  price: number;
  description?: string;
  imageUrl?: string | null;
  badges: Badge[];
  isPortrait: boolean;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ name, price, imageUrl, badges, isPortrait }) => {
  const [imgError, setImgError] = useState(false);
  const priceStr = `$${price}`;
  const showImage = imageUrl && !imgError;

  // Gradient placeholder when no image — uses first letter of name
  const initial = name.charAt(0).toUpperCase();

  if (isPortrait) {
    // Portrait: horizontal row with square thumbnail
    return (
      <div className="flex items-center gap-3 py-2 px-1 group">
        {/* Thumbnail */}
        <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 relative">
          {showImage ? (
            <img
              src={imageUrl}
              alt={name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-white/40 text-xl font-bold"
              style={{ background: 'linear-gradient(135deg, var(--mb-primary), rgba(0,0,0,0.6))' }}
            >
              {initial}
            </div>
          )}
          {badges.length > 0 && (
            <div className="absolute top-1 right-1">
              <ItemBadge badge={badges[0]} floating />
            </div>
          )}
        </div>
        {/* Name + price */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-white/90 truncate">{name}</div>
        </div>
        <span className="font-bold text-sm shrink-0" style={{ color: 'var(--mb-secondary, var(--mb-primary))' }}>
          {priceStr}
        </span>
      </div>
    );
  }

  // Landscape: tall card with photo top, name+price bottom
  return (
    <div className="rounded-xl overflow-hidden bg-white/[0.04] group relative">
      {/* Photo area — 70% of card */}
      <div className="relative aspect-[3/2] overflow-hidden">
        {showImage ? (
          <img
            src={imageUrl}
            alt={name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-white/20 text-4xl font-black"
            style={{ background: 'linear-gradient(135deg, var(--mb-primary), rgba(0,0,0,0.8))' }}
          >
            {initial}
          </div>
        )}
        {/* Gradient overlay at bottom of photo */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
        {/* Badges floating top-right */}
        {badges.length > 0 && (
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {badges.map(b => <ItemBadge key={b.type} badge={b} floating />)}
          </div>
        )}
      </div>
      {/* Name + price overlay at bottom */}
      <div className="px-3 py-2.5 flex items-center justify-between gap-2">
        <span className="font-semibold text-[13px] text-white/90 leading-tight truncate">{name}</span>
        <span className="font-bold text-sm shrink-0" style={{ color: 'var(--mb-secondary, var(--mb-primary))' }}>
          {priceStr}
        </span>
      </div>
    </div>
  );
};

export default MenuItemCard;
