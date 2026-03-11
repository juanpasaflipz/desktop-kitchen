import React, { useState, useRef } from 'react';
import { X, Camera, Image, Loader2, Trash2 } from 'lucide-react';
import { uploadReceipt, type Expense } from '../../api';

const CATEGORIES = [
  { value: 'food_cost', label: 'Food & Ingredients' },
  { value: 'supplies', label: 'Cleaning Supplies' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'rent', label: 'Rent' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'other', label: 'Other' },
];

const PAYMENT_METHODS = [
  { value: '', label: 'Not specified' },
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'transfer', label: 'Transfer' },
];

interface Props {
  expense?: Expense | null;
  initialData?: Partial<Expense>;
  onSave: (data: Partial<Expense>) => void;
  onClose: () => void;
  saving?: boolean;
}

const ExpenseFormModal: React.FC<Props> = ({ expense, initialData, onSave, onClose, saving }) => {
  const [category, setCategory] = useState(expense?.category || initialData?.category || 'food_cost');
  const [vendor, setVendor] = useState(expense?.vendor || initialData?.vendor || '');
  const [description, setDescription] = useState(expense?.description || initialData?.description || '');
  const [amount, setAmount] = useState(expense?.amount?.toString() || initialData?.amount?.toString() || '');
  const [taxAmount, setTaxAmount] = useState(expense?.tax_amount?.toString() || initialData?.tax_amount?.toString() || '0');
  const [expenseDate, setExpenseDate] = useState(
    expense?.expense_date?.slice(0, 10) || initialData?.expense_date || new Date().toISOString().slice(0, 10)
  );
  const [paymentMethod, setPaymentMethod] = useState(expense?.payment_method || initialData?.payment_method || '');
  const [notes, setNotes] = useState(expense?.notes || initialData?.notes || '');

  // Receipt image
  const existingUrl = initialData?.receipt_image_url || expense?.receipt_image_url || null;
  const [receiptUrl, setReceiptUrl] = useState<string | null>(existingUrl);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(existingUrl);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    setReceiptPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const result = await uploadReceipt(file);
      setReceiptUrl(result.image_url);
    } catch (err) {
      console.error('Failed to upload receipt:', err);
      // Keep the preview but clear the URL so user knows it didn't save
      setReceiptUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveReceipt = () => {
    setReceiptUrl(null);
    setReceiptPreview(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      category,
      vendor: vendor || undefined,
      description: description || undefined,
      amount: Number(amount),
      tax_amount: Number(taxAmount) || 0,
      expense_date: expenseDate,
      payment_method: paymentMethod || undefined,
      notes: notes || undefined,
      receipt_image_url: receiptUrl || undefined,
      receipt_data: initialData?.receipt_data || expense?.receipt_data,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="bg-neutral-900 rounded-xl border border-neutral-800 w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <h2 className="text-lg font-bold text-white">{expense ? 'Edit Expense' : 'Add Expense'}</h2>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Receipt Photo */}
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">Receipt Photo</label>
            {receiptPreview ? (
              <div className="relative inline-block">
                <img
                  src={receiptPreview}
                  alt="Receipt"
                  className="h-32 rounded-lg object-cover bg-neutral-800 border border-neutral-700"
                />
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                    <Loader2 size={20} className="animate-spin text-white" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleRemoveReceipt}
                  className="absolute -top-2 -right-2 p-1 bg-neutral-700 rounded-full text-white hover:bg-red-600 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-2 bg-neutral-800 text-white text-sm rounded-lg border border-neutral-700 hover:bg-neutral-700 transition-colors"
                >
                  <Camera size={16} />
                  Take Photo
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-2 bg-neutral-800 text-white text-sm rounded-lg border border-neutral-700 hover:bg-neutral-700 transition-colors"
                >
                  <Image size={16} />
                  Choose File
                </button>
              </div>
            )}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Category *</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:border-brand-500 focus:outline-none"
            >
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Vendor</label>
            <input
              type="text"
              value={vendor}
              onChange={e => setVendor(e.target.value)}
              placeholder="e.g. Costco, Walmart"
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white placeholder-neutral-500 focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What was purchased?"
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white placeholder-neutral-500 focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Amount *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white placeholder-neutral-500 focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Tax</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={taxAmount}
                onChange={e => setTaxAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white placeholder-neutral-500 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Date *</label>
              <input
                type="date"
                required
                value={expenseDate}
                onChange={e => setExpenseDate(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:border-brand-500 focus:outline-none"
              >
                {PAYMENT_METHODS.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Additional notes..."
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white placeholder-neutral-500 focus:border-brand-500 focus:outline-none resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-neutral-800 text-white font-semibold rounded-lg hover:bg-neutral-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploading || !amount || Number(amount) <= 0}
              className="flex-1 py-2.5 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : expense ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseFormModal;
