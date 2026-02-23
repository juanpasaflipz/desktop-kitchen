import React, { useState, useRef, useCallback, useEffect } from 'react';
import { lookupInventoryItem, scanRestock } from '../../api';
import { InventoryItem } from '../../types';
import { successFeedback, errorFeedback, tapFeedback } from '../../lib/haptics';
import MobileHeader from '../../components/mobile/MobileHeader';
import { Camera, CameraOff, Search, Check, Package } from 'lucide-react';

interface SessionEntry {
  item: InventoryItem;
  quantity: number;
  newQuantity: number;
}

const MobileScannerScreen: React.FC = () => {
  const [cameraActive, setCameraActive] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [foundItem, setFoundItem] = useState<InventoryItem | null>(null);
  const [restockQty, setRestockQty] = useState('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<SessionEntry[]>([]);
  const [showSession, setShowSession] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraActiveRef = useRef(false);
  const scanningRef = useRef(false);

  const stopCamera = useCallback(() => {
    cameraActiveRef.current = false;
    scanningRef.current = false;
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  const handleLookup = useCallback(async (barcode: string) => {
    if (!barcode.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const item = await lookupInventoryItem(barcode.trim());
      setFoundItem(item);
      setRestockQty('1');
      tapFeedback();
    } catch {
      setError(`No item found for barcode: ${barcode}`);
      setFoundItem(null);
      errorFeedback();
    } finally {
      setLoading(false);
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
        cameraActiveRef.current = true;
        scanningRef.current = true;

        // Start barcode detection
        if ('BarcodeDetector' in window) {
          const BarcodeDetectorAPI = (window as any).BarcodeDetector;
          const detector = new BarcodeDetectorAPI({
            formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39'],
          });

          const scan = async () => {
            if (!cameraActiveRef.current || !scanningRef.current || !videoRef.current) return;
            try {
              const barcodes = await detector.detect(videoRef.current);
              if (barcodes.length > 0) {
                const code = barcodes[0].rawValue;
                scanningRef.current = false;
                stopCamera();
                handleLookup(code);
                setManualInput(code);
                return;
              }
            } catch { /* ignore detection errors */ }
            if (cameraActiveRef.current && scanningRef.current) {
              requestAnimationFrame(scan);
            }
          };
          requestAnimationFrame(scan);
        }
      }
    } catch {
      setError('Camera access denied. Use manual input below.');
    }
  }, [stopCamera, handleLookup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cameraActiveRef.current = false;
      scanningRef.current = false;
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleRestock = async () => {
    if (!foundItem) return;
    const qty = parseInt(restockQty);
    if (isNaN(qty) || qty <= 0) return;

    setLoading(true);
    try {
      const result = await scanRestock({ barcode: foundItem.barcode || foundItem.sku || '', quantity: qty });
      setSession((prev) => [
        { item: foundItem, quantity: qty, newQuantity: result.new_quantity },
        ...prev,
      ]);
      setFoundItem(null);
      setManualInput('');
      setRestockQty('1');
      successFeedback();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Restock failed');
      errorFeedback();
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) handleLookup(manualInput.trim());
  };

  return (
    <>
      <MobileHeader
        title="Scan & Restock"
        rightAction={
          session.length > 0 ? (
            <button
              onClick={() => setShowSession(!showSession)}
              className="relative p-2 text-neutral-400 hover:text-white touch-manipulation"
            >
              <Package className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {session.length}
              </span>
            </button>
          ) : undefined
        }
      />

      <div className="flex flex-col">
        {/* Camera viewfinder */}
        <div className="relative bg-black" style={{ height: '55vh' }}>
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />

          {!cameraActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-900">
              <button
                onClick={startCamera}
                className="flex flex-col items-center gap-3 p-8 touch-manipulation"
              >
                <Camera className="w-16 h-16 text-neutral-500" />
                <span className="text-neutral-400 font-semibold">Tap to scan barcode</span>
              </button>
            </div>
          )}

          {cameraActive && (
            <>
              {/* Scan frame overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-40 border-2 border-brand-500 rounded-xl">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-brand-400 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-brand-400 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-brand-400 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-brand-400 rounded-br-lg" />
                </div>
              </div>
              <button
                onClick={stopCamera}
                className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white touch-manipulation"
              >
                <CameraOff className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        <div className="p-4 space-y-4">
          {/* Manual input */}
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Enter barcode or SKU..."
              className="flex-1 px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-brand-600"
            />
            <button
              type="submit"
              disabled={!manualInput.trim() || loading}
              className="px-4 py-3 bg-brand-600 text-white rounded-xl font-bold disabled:opacity-50 touch-manipulation"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>

          {/* Error */}
          {error && (
            <div className="bg-red-900/30 border border-red-700 rounded-xl p-3">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Found item detail card */}
          {foundItem && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
              <div>
                <p className="text-lg font-bold text-white">{foundItem.name}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-neutral-400">
                    Current stock: <span className="font-bold text-white">{foundItem.quantity} {foundItem.unit}</span>
                  </span>
                  {foundItem.low_stock_threshold && foundItem.quantity <= foundItem.low_stock_threshold && (
                    <span className="text-xs bg-amber-600 text-white px-2 py-0.5 rounded-full font-bold">Low</span>
                  )}
                </div>
                {foundItem.barcode && (
                  <p className="text-xs text-neutral-500 mt-1">Barcode: {foundItem.barcode}</p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <label className="text-sm text-neutral-400 font-semibold">Qty:</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setRestockQty(String(Math.max(1, parseInt(restockQty) - 1)))}
                    className="w-10 h-10 bg-neutral-800 text-white font-bold rounded-lg border border-neutral-700 text-lg touch-manipulation"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={restockQty}
                    onChange={(e) => setRestockQty(e.target.value)}
                    className="w-16 text-center py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white font-bold"
                    min="1"
                  />
                  <button
                    onClick={() => setRestockQty(String(parseInt(restockQty) + 1))}
                    className="w-10 h-10 bg-neutral-800 text-white font-bold rounded-lg border border-neutral-700 text-lg touch-manipulation"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleRestock}
                disabled={loading}
                className="w-full py-4 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold rounded-xl text-lg flex items-center justify-center gap-2 transition-colors touch-manipulation"
              >
                <Check className="w-5 h-5" />
                {loading ? 'Restocking...' : 'Restock'}
              </button>
            </div>
          )}

          {/* Session tracker */}
          {showSession && session.length > 0 && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
              <div className="p-3 border-b border-neutral-800">
                <p className="text-sm font-bold text-neutral-300">Session ({session.length} items)</p>
              </div>
              <div className="divide-y divide-neutral-800 max-h-48 overflow-y-auto">
                {session.map((entry, i) => (
                  <div key={i} className="px-3 py-2 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white font-semibold">{entry.item.name}</p>
                      <p className="text-xs text-neutral-500">+{entry.quantity} {entry.item.unit}</p>
                    </div>
                    <span className="text-sm text-green-400 font-bold">{entry.newQuantity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MobileScannerScreen;
