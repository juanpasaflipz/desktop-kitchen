import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { BoardSettings } from '../../types/menu-board';

interface QrCodeOverlayProps {
  settings: BoardSettings;
  primaryColor?: string;
  position?: 'bottom-right' | 'bottom-left';
}

const QrCodeOverlay: React.FC<QrCodeOverlayProps> = ({
  settings,
  primaryColor = '#ffffff',
  position = 'bottom-right',
}) => {
  if (!settings.showQrCode) return null;

  const url = settings.qrCodeUrl || window.location.origin;
  const label = settings.qrCodeLabel || 'Scan to Order';

  return (
    <div
      className={`absolute z-30 ${
        position === 'bottom-right' ? 'bottom-4 right-4' : 'bottom-4 left-4'
      }`}
    >
      <div className="flex flex-col items-center gap-1.5 bg-white rounded-xl p-3 shadow-2xl">
        <QRCodeSVG
          value={url}
          size={80}
          bgColor="#ffffff"
          fgColor="#000000"
          level="M"
          includeMargin={false}
        />
        <span
          className="text-[9px] font-semibold uppercase tracking-wider text-center max-w-[80px] leading-tight"
          style={{ color: primaryColor }}
        >
          {label}
        </span>
      </div>
    </div>
  );
};

export default QrCodeOverlay;
