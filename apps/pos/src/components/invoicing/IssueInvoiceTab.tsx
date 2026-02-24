import React, { useState } from 'react';
import {
  Search,
  CheckCircle,
  FileText,
  Download,
  Loader2,
} from 'lucide-react';
import {
  issueCfdiInvoice,
  getOrder,
} from '../../api';
import type { CfdiInvoice, CfdiCatalogs, Order } from '../../types';
import { formatPrice } from '../../utils/currency';

const paymentMethodLabel = (method: string | null | undefined): string => {
  switch (method) {
    case 'card':
      return 'Tarjeta';
    case 'cash':
      return 'Efectivo';
    case 'split':
      return 'Pago dividido';
    case 'crypto':
      return 'Criptomoneda';
    default:
      return 'N/A';
  }
};

interface IssueInvoiceTabProps {
  catalogs: CfdiCatalogs | null;
  onError: (msg: string) => void;
  onSuccess: (msg: string) => void;
}

export default function IssueInvoiceTab({ catalogs, onError, onSuccess }: IssueInvoiceTabProps) {
  const [orderNumber, setOrderNumber] = useState('');
  const [searchingOrder, setSearchingOrder] = useState(false);
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [publicoGeneral, setPublicoGeneral] = useState(false);
  const [receptorForm, setReceptorForm] = useState({
    rfc: '',
    name: '',
    tax_regime: '',
    postal_code: '',
    uso_cfdi: 'G03',
  });
  const [issuing, setIssuing] = useState(false);
  const [issuedInvoice, setIssuedInvoice] = useState<CfdiInvoice | null>(null);

  const handleSearchOrder = async () => {
    if (!orderNumber.trim()) return;

    try {
      setSearchingOrder(true);
      setFoundOrder(null);
      setIssuedInvoice(null);

      const id = parseInt(orderNumber.trim(), 10);
      if (isNaN(id)) {
        onError('Ingresa un numero de orden valido');
        return;
      }

      const order = await getOrder(id);
      setFoundOrder(order);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Orden no encontrada');
    } finally {
      setSearchingOrder(false);
    }
  };

  const handleIssueInvoice = async () => {
    if (!foundOrder) return;

    try {
      setIssuing(true);

      const payload: {
        order_id: number;
        receptor?: {
          rfc: string;
          name: string;
          tax_regime: string;
          postal_code: string;
          uso_cfdi?: string;
        };
        publico_general?: boolean;
      } = {
        order_id: foundOrder.id,
      };

      if (publicoGeneral) {
        payload.publico_general = true;
      } else {
        if (
          !receptorForm.rfc ||
          !receptorForm.name ||
          !receptorForm.tax_regime ||
          !receptorForm.postal_code
        ) {
          onError('Completa todos los datos del receptor');
          setIssuing(false);
          return;
        }
        payload.receptor = {
          rfc: receptorForm.rfc.toUpperCase().trim(),
          name: receptorForm.name.toUpperCase().trim(),
          tax_regime: receptorForm.tax_regime,
          postal_code: receptorForm.postal_code.trim(),
          uso_cfdi: receptorForm.uso_cfdi,
        };
      }

      const invoice = await issueCfdiInvoice(payload);
      setIssuedInvoice(invoice);
      onSuccess('Factura emitida correctamente');
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Error al emitir factura');
    } finally {
      setIssuing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Order Search */}
      <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Buscar Orden</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearchOrder();
            }}
            placeholder="ID de la orden (ej. 42)"
            className="flex-1 bg-neutral-800 text-white rounded-lg px-4 py-3 border border-neutral-700 focus:border-brand-500 focus:outline-none"
          />
          <button
            onClick={handleSearchOrder}
            disabled={searchingOrder || !orderNumber.trim()}
            className="px-6 py-3 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {searchingOrder ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Search size={16} />
            )}
            Buscar
          </button>
        </div>
      </div>

      {/* Order Summary */}
      {foundOrder && (
        <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6">
          <h3 className="text-lg font-bold text-white mb-4">
            Orden #{foundOrder.order_number}
          </h3>

          <div className="overflow-x-auto mb-4">
            <table className="w-full">
              <thead className="bg-neutral-800">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-neutral-300">
                    Producto
                  </th>
                  <th className="px-4 py-2 text-right text-sm font-semibold text-neutral-300">
                    Cant.
                  </th>
                  <th className="px-4 py-2 text-right text-sm font-semibold text-neutral-300">
                    Precio
                  </th>
                  <th className="px-4 py-2 text-right text-sm font-semibold text-neutral-300">
                    Importe
                  </th>
                </tr>
              </thead>
              <tbody>
                {foundOrder.items?.map((item, idx) => (
                  <tr key={idx} className="border-b border-neutral-800">
                    <td className="px-4 py-2 text-white text-sm">
                      {item.item_name}
                    </td>
                    <td className="px-4 py-2 text-neutral-300 text-sm text-right">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-2 text-neutral-300 text-sm text-right">
                      {formatPrice(item.unit_price)}
                    </td>
                    <td className="px-4 py-2 text-white text-sm text-right">
                      {formatPrice(item.unit_price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-neutral-800 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Subtotal</span>
              <span className="text-white">{formatPrice(foundOrder.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">IVA (16%)</span>
              <span className="text-white">{formatPrice(foundOrder.tax)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold border-t border-neutral-700 pt-2">
              <span className="text-white">Total</span>
              <span className="text-brand-500">{formatPrice(foundOrder.total)}</span>
            </div>
            <div className="flex justify-between text-sm pt-1">
              <span className="text-neutral-400">Metodo de Pago</span>
              <span className="text-neutral-300">
                {paymentMethodLabel(foundOrder.payment_method)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Receptor Data */}
      {foundOrder && !issuedInvoice && (
        <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6">
          <h3 className="text-lg font-bold text-white mb-4">Datos del Receptor</h3>

          <label className="flex items-center gap-3 mb-6 cursor-pointer">
            <input
              type="checkbox"
              checked={publicoGeneral}
              onChange={(e) => setPublicoGeneral(e.target.checked)}
              className="w-5 h-5 rounded border-neutral-600 bg-neutral-800 text-brand-600 focus:ring-brand-500 focus:ring-offset-0"
            />
            <span className="text-white font-medium">Publico en General</span>
            <span className="text-neutral-500 text-sm">
              (RFC: XAXX010101000)
            </span>
          </label>

          {!publicoGeneral && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">
                  RFC <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={receptorForm.rfc}
                  onChange={(e) =>
                    setReceptorForm({ ...receptorForm, rfc: e.target.value.toUpperCase() })
                  }
                  placeholder="XAXX010101000"
                  maxLength={13}
                  className="w-full bg-neutral-800 text-white rounded-lg px-4 py-3 border border-neutral-700 focus:border-brand-500 focus:outline-none uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">
                  Razon Social <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={receptorForm.name}
                  onChange={(e) =>
                    setReceptorForm({ ...receptorForm, name: e.target.value.toUpperCase() })
                  }
                  placeholder="NOMBRE O RAZON SOCIAL"
                  className="w-full bg-neutral-800 text-white rounded-lg px-4 py-3 border border-neutral-700 focus:border-brand-500 focus:outline-none uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">
                  Regimen Fiscal <span className="text-red-400">*</span>
                </label>
                <select
                  value={receptorForm.tax_regime}
                  onChange={(e) =>
                    setReceptorForm({ ...receptorForm, tax_regime: e.target.value })
                  }
                  className="w-full bg-neutral-800 text-white rounded-lg px-4 py-3 border border-neutral-700 focus:border-brand-500 focus:outline-none"
                >
                  <option value="">Seleccionar...</option>
                  {catalogs?.taxRegimes.map((r) => (
                    <option key={r.code} value={r.code}>
                      {r.code} - {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">
                  Codigo Postal <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={receptorForm.postal_code}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 5);
                    setReceptorForm({ ...receptorForm, postal_code: val });
                  }}
                  placeholder="44100"
                  maxLength={5}
                  className="w-full bg-neutral-800 text-white rounded-lg px-4 py-3 border border-neutral-700 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-400 mb-1">
                  Uso de CFDI
                </label>
                <select
                  value={receptorForm.uso_cfdi}
                  onChange={(e) =>
                    setReceptorForm({ ...receptorForm, uso_cfdi: e.target.value })
                  }
                  className="w-full bg-neutral-800 text-white rounded-lg px-4 py-3 border border-neutral-700 focus:border-brand-500 focus:outline-none"
                >
                  {catalogs?.usoCfdi.map((u) => (
                    <option key={u.code} value={u.code}>
                      {u.code} - {u.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <button
            onClick={handleIssueInvoice}
            disabled={issuing}
            className="mt-6 w-full py-4 bg-brand-600 text-white font-bold text-lg rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {issuing ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Emitiendo Factura...
              </>
            ) : (
              <>
                <FileText size={20} />
                Emitir Factura
              </>
            )}
          </button>
        </div>
      )}

      {/* Issued Invoice Result */}
      {issuedInvoice && (
        <div className="bg-green-900/20 rounded-lg border border-green-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="text-green-400" size={24} />
            <h3 className="text-lg font-bold text-green-400">
              Factura Emitida Exitosamente
            </h3>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between p-3 bg-neutral-900 rounded-lg">
              <span className="text-neutral-400 text-sm">UUID Fiscal</span>
              <span className="text-white text-sm font-mono">
                {issuedInvoice.uuid_fiscal}
              </span>
            </div>
            <div className="flex justify-between p-3 bg-neutral-900 rounded-lg">
              <span className="text-neutral-400 text-sm">Folio</span>
              <span className="text-white text-sm">
                {issuedInvoice.series}-{issuedInvoice.folio}
              </span>
            </div>
            <div className="flex justify-between p-3 bg-neutral-900 rounded-lg">
              <span className="text-neutral-400 text-sm">Receptor</span>
              <span className="text-white text-sm">
                {issuedInvoice.receptor_rfc} — {issuedInvoice.receptor_name}
              </span>
            </div>
            <div className="flex justify-between p-3 bg-neutral-900 rounded-lg">
              <span className="text-neutral-400 text-sm">Total</span>
              <span className="text-brand-500 text-sm font-bold">
                {formatPrice(issuedInvoice.total)}
              </span>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            {issuedInvoice.pdf_url && (
              <a
                href={issuedInvoice.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors text-sm font-medium"
              >
                <Download size={16} />
                Descargar PDF
              </a>
            )}
            {issuedInvoice.xml_url && (
              <a
                href={issuedInvoice.xml_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors text-sm font-medium border border-neutral-700"
              >
                <Download size={16} />
                Descargar XML
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
