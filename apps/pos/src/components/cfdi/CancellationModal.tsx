import React, { useState } from 'react';
import { X, AlertTriangle, FileX } from 'lucide-react';
import { CfdiInvoice } from '../../types';
import { formatPrice } from '../../utils/currency';

interface CancellationModalProps {
  invoice: CfdiInvoice;
  onCancel: (motive: string, substituteUUID?: string) => void;
  onClose: () => void;
}

interface CancellationMotive {
  code: string;
  label: string;
  requiresSubstitute: boolean;
}

const CANCELLATION_MOTIVES: CancellationMotive[] = [
  {
    code: '01',
    label: 'Comprobante emitido con errores con relacion',
    requiresSubstitute: true,
  },
  {
    code: '02',
    label: 'Comprobante emitido con errores sin relacion',
    requiresSubstitute: false,
  },
  {
    code: '03',
    label: 'No se llevo a cabo la operacion',
    requiresSubstitute: false,
  },
  {
    code: '04',
    label: 'Operacion nominativa relacionada en factura global',
    requiresSubstitute: false,
  },
];

const CancellationModal: React.FC<CancellationModalProps> = ({ invoice, onCancel, onClose }) => {
  const [selectedMotive, setSelectedMotive] = useState('');
  const [substituteUUID, setSubstituteUUID] = useState('');

  const currentMotive = CANCELLATION_MOTIVES.find((m) => m.code === selectedMotive);
  const requiresSubstitute = currentMotive?.requiresSubstitute ?? false;

  const isFormValid =
    selectedMotive.length > 0 &&
    (!requiresSubstitute || substituteUUID.trim().length >= 32);

  const handleConfirm = () => {
    if (!isFormValid) return;
    onCancel(
      selectedMotive,
      requiresSubstitute ? substituteUUID.trim() : undefined
    );
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-700">
          <div className="flex items-center gap-2">
            <FileX className="w-5 h-5 text-red-400" />
            <h2 className="text-lg font-bold text-white">Cancel Invoice</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Invoice details */}
          <div className="bg-neutral-800 rounded-lg p-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-400">Folio #</span>
              <span className="text-white font-medium">{invoice.series}{invoice.folio}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Recipient RFC</span>
              <span className="text-white font-medium">{invoice.receptor_rfc}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Recipient</span>
              <span className="text-white font-medium truncate ml-4">{invoice.receptor_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Total</span>
              <span className="text-white font-bold">{formatPrice(invoice.total)}</span>
            </div>
            <div>
              <span className="text-neutral-400 block mb-1">UUID Fiscal</span>
              <span className="text-brand-400 font-mono text-xs break-all">{invoice.uuid_fiscal}</span>
            </div>
          </div>

          {/* SAT Motive dropdown */}
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">
              Cancellation reason (SAT)
            </label>
            <select
              value={selectedMotive}
              onChange={(e) => {
                setSelectedMotive(e.target.value);
                if (e.target.value !== '01') setSubstituteUUID('');
              }}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-white text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 appearance-none"
            >
              <option value="" className="bg-neutral-800">Select reason...</option>
              {CANCELLATION_MOTIVES.map((motive) => (
                <option key={motive.code} value={motive.code} className="bg-neutral-800">
                  {motive.code} - {motive.label}
                </option>
              ))}
            </select>
          </div>

          {/* Substitute UUID (only for motive 01) */}
          {requiresSubstitute && (
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                Substitute UUID
              </label>
              <input
                type="text"
                value={substituteUUID}
                onChange={(e) => setSubstituteUUID(e.target.value.trim())}
                placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-white placeholder-neutral-500 text-sm font-mono focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
              <p className="text-xs text-neutral-500 mt-1">
                UUID of the invoice that replaces this one.
              </p>
            </div>
          )}

          {/* Warning */}
          <div className="flex gap-2 bg-amber-900/20 border border-amber-800 rounded-lg p-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-amber-300 text-xs leading-relaxed">
              Cancellation with the SAT is irreversible. Make sure to select the correct reason.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg font-bold text-sm bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!isFormValid}
              className="flex-1 py-2.5 rounded-lg font-bold text-sm bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Confirm Cancellation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancellationModal;
