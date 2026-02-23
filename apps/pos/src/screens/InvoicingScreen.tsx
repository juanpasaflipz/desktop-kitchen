import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Settings,
  ListOrdered,
  Search,
  Upload,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Shield,
  Eye,
} from 'lucide-react';
import {
  getCfdiConfig,
  updateCfdiConfig,
  uploadCSD,
  testCfdiConnection,
  issueCfdiInvoice,
  getCfdiInvoices,
  getCfdiCatalogs,
  getOrder,
} from '../api';
import type {
  CfdiConfig,
  CfdiInvoice,
  CfdiCatalogs,
  SatCatalogItem,
  Order,
} from '../types';
import { formatPrice } from '../utils/currency';

const CancellationModal = lazy(
  () => import('../components/cfdi/CancellationModal')
);

type Tab = 'config' | 'issue' | 'list';

/* ======================== Status Badge Helper ======================== */

function ConfigStatusBadge({ config }: { config: CfdiConfig | null }) {
  if (!config) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-neutral-800 text-neutral-400 border border-neutral-700">
        <span className="w-2 h-2 rounded-full bg-neutral-500" />
        Sin Configurar
      </span>
    );
  }
  if (config.active) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-800">
        <span className="w-2 h-2 rounded-full bg-green-400" />
        Activo
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-900/30 text-amber-400 border border-amber-800">
      <span className="w-2 h-2 rounded-full bg-amber-400" />
      CSD Requerido
    </span>
  );
}

function InvoiceStatusBadge({ status }: { status: CfdiInvoice['status'] }) {
  if (status === 'valid') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-900/30 text-green-400 border border-green-800">
        <CheckCircle size={12} />
        Vigente
      </span>
    );
  }
  if (status === 'cancelled') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-900/30 text-red-400 border border-red-800">
        <XCircle size={12} />
        Cancelada
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-900/30 text-amber-400 border border-amber-800">
      <AlertTriangle size={12} />
      Cancelaci&oacute;n Pendiente
    </span>
  );
}

/* ======================== Main Component ======================== */

export default function InvoicingScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('config');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  /* Shared state */
  const [config, setConfig] = useState<CfdiConfig | null>(null);
  const [catalogs, setCatalogs] = useState<CfdiCatalogs | null>(null);

  /* Configuration tab */
  const [cfdiForm, setCfdiForm] = useState({
    rfc: '',
    legal_name: '',
    tax_regime: '',
    postal_code: '',
    default_uso_cfdi: 'G03',
    invoice_series: 'A',
    invoice_link_expiry_hours: 72,
  });
  const [savingConfig, setSavingConfig] = useState(false);

  /* CSD upload */
  const [cerFile, setCerFile] = useState<File | null>(null);
  const [keyFile, setKeyFile] = useState<File | null>(null);
  const [csdPassword, setCsdPassword] = useState('');
  const [uploadingCSD, setUploadingCSD] = useState(false);
  const cerInputRef = useRef<HTMLInputElement>(null);
  const keyInputRef = useRef<HTMLInputElement>(null);

  /* Test connection */
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    expires_at?: string;
    error?: string;
  } | null>(null);

  /* Issue Invoice tab */
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

  /* Invoice List tab */
  const [invoices, setInvoices] = useState<CfdiInvoice[]>([]);
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<string>('');
  const [invoicePage, setInvoicePage] = useState(1);
  const [invoiceTotal, setInvoiceTotal] = useState(0);
  const INVOICES_PER_PAGE = 15;

  /* Cancellation modal */
  const [cancellingInvoice, setCancellingInvoice] = useState<CfdiInvoice | null>(null);

  /* ======================== Data fetching ======================== */

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 'list') {
      fetchInvoices();
    }
  }, [activeTab, invoicePage, invoiceStatusFilter]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [configRes, catalogsRes] = await Promise.all([
        getCfdiConfig(),
        getCfdiCatalogs(),
      ]);
      setConfig(configRes.config);
      setCatalogs(catalogsRes);

      if (configRes.config) {
        setCfdiForm({
          rfc: configRes.config.rfc || '',
          legal_name: configRes.config.legal_name || '',
          tax_regime: configRes.config.tax_regime || '',
          postal_code: configRes.config.postal_code || '',
          default_uso_cfdi: configRes.config.default_uso_cfdi || 'G03',
          invoice_series: configRes.config.invoice_series || 'A',
          invoice_link_expiry_hours: configRes.config.invoice_link_expiry_hours || 72,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      const res = await getCfdiInvoices({
        page: invoicePage,
        limit: INVOICES_PER_PAGE,
        search: invoiceSearch || undefined,
        status: invoiceStatusFilter || undefined,
      });
      setInvoices(res.invoices);
      setInvoiceTotal(res.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar facturas');
    }
  };

  /* ======================== Configuration Handlers ======================== */

  const handleSaveConfig = async () => {
    try {
      setSavingConfig(true);
      setError(null);
      setSuccess(null);

      if (!cfdiForm.rfc || !cfdiForm.legal_name || !cfdiForm.tax_regime || !cfdiForm.postal_code) {
        setError('Todos los campos obligatorios deben estar completos');
        return;
      }

      if (!/^\d{5}$/.test(cfdiForm.postal_code)) {
        setError('El codigo postal debe tener 5 digitos');
        return;
      }

      const res = await updateCfdiConfig({
        rfc: cfdiForm.rfc.toUpperCase().trim(),
        legal_name: cfdiForm.legal_name.toUpperCase().trim(),
        tax_regime: cfdiForm.tax_regime,
        postal_code: cfdiForm.postal_code.trim(),
        default_uso_cfdi: cfdiForm.default_uso_cfdi,
        invoice_series: cfdiForm.invoice_series.toUpperCase().trim(),
        invoice_link_expiry_hours: cfdiForm.invoice_link_expiry_hours,
      });
      setConfig(res.config);
      setSuccess('Configuracion guardada correctamente');
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar configuracion');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleUploadCSD = async () => {
    if (!cerFile || !keyFile || !csdPassword) {
      setError('Debes seleccionar ambos archivos (.cer y .key) e ingresar la contrasena');
      return;
    }

    try {
      setUploadingCSD(true);
      setError(null);
      setSuccess(null);

      const formData = new FormData();
      formData.append('cer', cerFile);
      formData.append('key', keyFile);
      formData.append('password', csdPassword);

      const res = await uploadCSD(formData);
      setConfig(res.config);
      setCerFile(null);
      setKeyFile(null);
      setCsdPassword('');
      if (cerInputRef.current) cerInputRef.current.value = '';
      if (keyInputRef.current) keyInputRef.current.value = '';
      setSuccess(res.message || 'CSD cargado correctamente');
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar CSD');
    } finally {
      setUploadingCSD(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setTesting(true);
      setTestResult(null);
      setError(null);
      const result = await testCfdiConnection();
      setTestResult(result);
    } catch (err) {
      setTestResult({
        success: false,
        error: err instanceof Error ? err.message : 'Error de conexion',
      });
    } finally {
      setTesting(false);
    }
  };

  /* ======================== Issue Invoice Handlers ======================== */

  const handleSearchOrder = async () => {
    if (!orderNumber.trim()) return;

    try {
      setSearchingOrder(true);
      setError(null);
      setFoundOrder(null);
      setIssuedInvoice(null);

      const id = parseInt(orderNumber.trim(), 10);
      if (isNaN(id)) {
        setError('Ingresa un numero de orden valido');
        return;
      }

      const order = await getOrder(id);
      setFoundOrder(order);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Orden no encontrada');
    } finally {
      setSearchingOrder(false);
    }
  };

  const handleIssueInvoice = async () => {
    if (!foundOrder) return;

    try {
      setIssuing(true);
      setError(null);

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
          setError('Completa todos los datos del receptor');
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
      setSuccess('Factura emitida correctamente');
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al emitir factura');
    } finally {
      setIssuing(false);
    }
  };

  /* ======================== Invoice List Handlers ======================== */

  const handleInvoiceSearch = () => {
    setInvoicePage(1);
    fetchInvoices();
  };

  const handleCancelComplete = (updatedInvoice: CfdiInvoice) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === updatedInvoice.id ? updatedInvoice : inv))
    );
    setCancellingInvoice(null);
    setSuccess('Factura cancelada correctamente');
    setTimeout(() => setSuccess(null), 4000);
  };

  const totalPages = Math.ceil(invoiceTotal / INVOICES_PER_PAGE);

  /* ======================== Tab config ======================== */

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'config', label: 'Configuracion CFDI', icon: <Settings size={18} /> },
    { id: 'issue', label: 'Emitir Factura', icon: <FileText size={18} /> },
    { id: 'list', label: 'Lista de Facturas', icon: <ListOrdered size={18} /> },
  ];

  /* ======================== Helpers ======================== */

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

  const formatDate = (dateStr: string): string => {
    try {
      return new Date(dateStr).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  /* ======================== Render ======================== */

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Header */}
      <div className="bg-neutral-900 text-white p-6 border-b border-neutral-800">
        <div className="flex items-center gap-4">
          <Link
            to="/admin"
            className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <FileText className="text-brand-500" size={28} />
          <h1 className="text-3xl font-black tracking-tighter">
            Facturacion Electronica
          </h1>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-neutral-900 border-b border-neutral-800 px-6">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-neutral-950 text-brand-500 border-t-2 border-brand-500'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Alerts */}
        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 mb-6 flex items-start gap-3">
            <XCircle className="text-red-400 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-red-300 text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-300"
            >
              <XCircle size={16} />
            </button>
          </div>
        )}

        {success && (
          <div className="bg-green-900/30 border border-green-800 rounded-lg p-4 mb-6 flex items-start gap-3">
            <CheckCircle className="text-green-400 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-green-300 text-sm">{success}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-brand-500" />
          </div>
        ) : (
          <>
            {/* ==================== CONFIGURATION TAB ==================== */}
            {activeTab === 'config' && (
              <div className="space-y-6">
                {/* Status */}
                <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-white">Estado de la Configuracion</h2>
                      <p className="text-neutral-400 text-sm mt-1">
                        CFDI 4.0 — Facturacion electronica del SAT
                      </p>
                    </div>
                    <ConfigStatusBadge config={config} />
                  </div>
                </div>

                {/* CFDI Form */}
                <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Datos del Emisor</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* RFC */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-400 mb-1">
                        RFC <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={cfdiForm.rfc}
                        onChange={(e) =>
                          setCfdiForm({ ...cfdiForm, rfc: e.target.value.toUpperCase() })
                        }
                        placeholder="XAXX010101000"
                        maxLength={13}
                        className="w-full bg-neutral-800 text-white rounded-lg px-4 py-3 border border-neutral-700 focus:border-brand-500 focus:outline-none uppercase"
                      />
                    </div>

                    {/* Legal Name */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-400 mb-1">
                        Razon Social <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={cfdiForm.legal_name}
                        onChange={(e) =>
                          setCfdiForm({
                            ...cfdiForm,
                            legal_name: e.target.value.toUpperCase(),
                          })
                        }
                        placeholder="MI EMPRESA SA DE CV"
                        className="w-full bg-neutral-800 text-white rounded-lg px-4 py-3 border border-neutral-700 focus:border-brand-500 focus:outline-none uppercase"
                      />
                    </div>

                    {/* Tax Regime */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-400 mb-1">
                        Regimen Fiscal <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={cfdiForm.tax_regime}
                        onChange={(e) =>
                          setCfdiForm({ ...cfdiForm, tax_regime: e.target.value })
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

                    {/* Postal Code */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-400 mb-1">
                        Codigo Postal <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={cfdiForm.postal_code}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 5);
                          setCfdiForm({ ...cfdiForm, postal_code: val });
                        }}
                        placeholder="44100"
                        maxLength={5}
                        className="w-full bg-neutral-800 text-white rounded-lg px-4 py-3 border border-neutral-700 focus:border-brand-500 focus:outline-none"
                      />
                    </div>

                    {/* Default Uso CFDI */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-400 mb-1">
                        Uso de CFDI por defecto
                      </label>
                      <select
                        value={cfdiForm.default_uso_cfdi}
                        onChange={(e) =>
                          setCfdiForm({ ...cfdiForm, default_uso_cfdi: e.target.value })
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

                    {/* Invoice Series */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-400 mb-1">
                        Serie de Factura
                      </label>
                      <input
                        type="text"
                        value={cfdiForm.invoice_series}
                        onChange={(e) =>
                          setCfdiForm({
                            ...cfdiForm,
                            invoice_series: e.target.value.toUpperCase(),
                          })
                        }
                        placeholder="A"
                        maxLength={10}
                        className="w-full bg-neutral-800 text-white rounded-lg px-4 py-3 border border-neutral-700 focus:border-brand-500 focus:outline-none uppercase"
                      />
                    </div>

                    {/* Link Expiry Hours */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-400 mb-1">
                        Expiracion del Enlace (horas)
                      </label>
                      <input
                        type="number"
                        value={cfdiForm.invoice_link_expiry_hours}
                        onChange={(e) =>
                          setCfdiForm({
                            ...cfdiForm,
                            invoice_link_expiry_hours: Math.max(
                              1,
                              parseInt(e.target.value, 10) || 1
                            ),
                          })
                        }
                        min={1}
                        className="w-full bg-neutral-800 text-white rounded-lg px-4 py-3 border border-neutral-700 focus:border-brand-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSaveConfig}
                    disabled={savingConfig}
                    className="mt-6 px-6 py-3 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {savingConfig ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      'Guardar Configuracion'
                    )}
                  </button>
                </div>

                {/* CSD Upload — only visible when config exists */}
                {config && (
                  <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Shield className="text-brand-500" size={22} />
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          Certificado de Sello Digital (CSD)
                        </h3>
                        {config.csd_uploaded && config.csd_valid_until && (
                          <p className="text-neutral-400 text-sm">
                            Valido hasta:{' '}
                            <span className="text-green-400">
                              {formatDate(config.csd_valid_until)}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* .cer file */}
                      <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-1">
                          Archivo .cer
                        </label>
                        <input
                          ref={cerInputRef}
                          type="file"
                          accept=".cer"
                          onChange={(e) => setCerFile(e.target.files?.[0] || null)}
                          className="w-full bg-neutral-800 text-neutral-300 rounded-lg px-4 py-2.5 border border-neutral-700 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-brand-600 file:text-white hover:file:bg-brand-700"
                        />
                      </div>

                      {/* .key file */}
                      <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-1">
                          Archivo .key
                        </label>
                        <input
                          ref={keyInputRef}
                          type="file"
                          accept=".key"
                          onChange={(e) => setKeyFile(e.target.files?.[0] || null)}
                          className="w-full bg-neutral-800 text-neutral-300 rounded-lg px-4 py-2.5 border border-neutral-700 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-brand-600 file:text-white hover:file:bg-brand-700"
                        />
                      </div>

                      {/* Password */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-neutral-400 mb-1">
                          Contrasena del CSD
                        </label>
                        <input
                          type="password"
                          value={csdPassword}
                          onChange={(e) => setCsdPassword(e.target.value)}
                          placeholder="Contrasena de la llave privada"
                          className="w-full bg-neutral-800 text-white rounded-lg px-4 py-3 border border-neutral-700 focus:border-brand-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleUploadCSD}
                      disabled={uploadingCSD || !cerFile || !keyFile || !csdPassword}
                      className="mt-4 px-6 py-3 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {uploadingCSD ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Cargando...
                        </>
                      ) : (
                        <>
                          <Upload size={16} />
                          Cargar CSD
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Test Connection */}
                {config && (
                  <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Probar Conexion</h3>
                    <button
                      onClick={handleTestConnection}
                      disabled={testing}
                      className="px-6 py-3 bg-neutral-800 text-white font-bold rounded-lg hover:bg-neutral-700 transition-colors disabled:opacity-50 flex items-center gap-2 border border-neutral-700"
                    >
                      {testing ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Probando...
                        </>
                      ) : (
                        <>
                          <RefreshCw size={16} />
                          Probar Conexion
                        </>
                      )}
                    </button>

                    {testResult && (
                      <div
                        className={`mt-4 p-4 rounded-lg border ${
                          testResult.success
                            ? 'bg-green-900/30 border-green-800'
                            : 'bg-red-900/30 border-red-800'
                        }`}
                      >
                        {testResult.success ? (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="text-green-400" size={18} />
                            <span className="text-green-300 text-sm">
                              Conexion exitosa
                              {testResult.expires_at &&
                                ` — CSD valido hasta ${formatDate(testResult.expires_at)}`}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <XCircle className="text-red-400" size={18} />
                            <span className="text-red-300 text-sm">
                              Error: {testResult.error || 'No se pudo conectar'}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ==================== ISSUE INVOICE TAB ==================== */}
            {activeTab === 'issue' && (
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

                    {/* Items */}
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

                    {/* Totals */}
                    <div className="bg-neutral-800 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-400">Subtotal</span>
                        <span className="text-white">
                          {formatPrice(foundOrder.subtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-400">IVA (16%)</span>
                        <span className="text-white">
                          {formatPrice(foundOrder.tax)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm font-bold border-t border-neutral-700 pt-2">
                        <span className="text-white">Total</span>
                        <span className="text-brand-500">
                          {formatPrice(foundOrder.total)}
                        </span>
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

                    {/* Publico en General toggle */}
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
                        {/* RFC */}
                        <div>
                          <label className="block text-sm font-medium text-neutral-400 mb-1">
                            RFC <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            value={receptorForm.rfc}
                            onChange={(e) =>
                              setReceptorForm({
                                ...receptorForm,
                                rfc: e.target.value.toUpperCase(),
                              })
                            }
                            placeholder="XAXX010101000"
                            maxLength={13}
                            className="w-full bg-neutral-800 text-white rounded-lg px-4 py-3 border border-neutral-700 focus:border-brand-500 focus:outline-none uppercase"
                          />
                        </div>

                        {/* Razon Social */}
                        <div>
                          <label className="block text-sm font-medium text-neutral-400 mb-1">
                            Razon Social <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            value={receptorForm.name}
                            onChange={(e) =>
                              setReceptorForm({
                                ...receptorForm,
                                name: e.target.value.toUpperCase(),
                              })
                            }
                            placeholder="NOMBRE O RAZON SOCIAL"
                            className="w-full bg-neutral-800 text-white rounded-lg px-4 py-3 border border-neutral-700 focus:border-brand-500 focus:outline-none uppercase"
                          />
                        </div>

                        {/* Tax Regime */}
                        <div>
                          <label className="block text-sm font-medium text-neutral-400 mb-1">
                            Regimen Fiscal <span className="text-red-400">*</span>
                          </label>
                          <select
                            value={receptorForm.tax_regime}
                            onChange={(e) =>
                              setReceptorForm({
                                ...receptorForm,
                                tax_regime: e.target.value,
                              })
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

                        {/* Postal Code */}
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

                        {/* Uso CFDI */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-neutral-400 mb-1">
                            Uso de CFDI
                          </label>
                          <select
                            value={receptorForm.uso_cfdi}
                            onChange={(e) =>
                              setReceptorForm({
                                ...receptorForm,
                                uso_cfdi: e.target.value,
                              })
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
            )}

            {/* ==================== INVOICE LIST TAB ==================== */}
            {activeTab === 'list' && (
              <div className="space-y-6">
                {/* Search and Filters */}
                <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6">
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 flex gap-3">
                      <input
                        type="text"
                        value={invoiceSearch}
                        onChange={(e) => setInvoiceSearch(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleInvoiceSearch();
                        }}
                        placeholder="Buscar por RFC, folio o numero de orden..."
                        className="flex-1 bg-neutral-800 text-white rounded-lg px-4 py-3 border border-neutral-700 focus:border-brand-500 focus:outline-none"
                      />
                      <button
                        onClick={handleInvoiceSearch}
                        className="px-4 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
                      >
                        <Search size={18} />
                      </button>
                    </div>
                    <select
                      value={invoiceStatusFilter}
                      onChange={(e) => {
                        setInvoiceStatusFilter(e.target.value);
                        setInvoicePage(1);
                      }}
                      className="bg-neutral-800 text-white rounded-lg px-4 py-3 border border-neutral-700 focus:border-brand-500 focus:outline-none"
                    >
                      <option value="">Todos los estados</option>
                      <option value="valid">Vigente</option>
                      <option value="cancelled">Cancelada</option>
                    </select>
                  </div>
                </div>

                {/* Invoice Table */}
                <div className="bg-neutral-900 rounded-lg border border-neutral-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-neutral-800">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-300">
                            Folio
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-300">
                            Orden
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-300">
                            RFC
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-300">
                            Receptor
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-300">
                            Total
                          </th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-neutral-300">
                            Estado
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-300">
                            Fecha
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-300">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoices.length === 0 ? (
                          <tr>
                            <td
                              colSpan={8}
                              className="px-4 py-12 text-center text-neutral-500"
                            >
                              No se encontraron facturas
                            </td>
                          </tr>
                        ) : (
                          invoices.map((inv) => (
                            <tr
                              key={inv.id}
                              className="border-b border-neutral-800 hover:bg-neutral-800/50 transition-colors"
                            >
                              <td className="px-4 py-3 text-white text-sm font-medium">
                                {inv.series}-{inv.folio}
                              </td>
                              <td className="px-4 py-3 text-neutral-300 text-sm">
                                {inv.order_number || `#${inv.order_id}`}
                              </td>
                              <td className="px-4 py-3 text-neutral-300 text-sm font-mono">
                                {inv.receptor_rfc}
                              </td>
                              <td className="px-4 py-3 text-neutral-300 text-sm max-w-[200px] truncate">
                                {inv.receptor_name}
                              </td>
                              <td className="px-4 py-3 text-white text-sm text-right font-medium">
                                {formatPrice(inv.total)}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <InvoiceStatusBadge status={inv.status} />
                              </td>
                              <td className="px-4 py-3 text-neutral-400 text-sm">
                                {formatDate(inv.issued_at)}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  {inv.pdf_url && (
                                    <a
                                      href={inv.pdf_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      title="Ver PDF"
                                      className="p-2 hover:bg-neutral-700 rounded-lg transition-colors text-neutral-400 hover:text-white"
                                    >
                                      <Eye size={16} />
                                    </a>
                                  )}
                                  {inv.xml_url && (
                                    <a
                                      href={inv.xml_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      title="Descargar XML"
                                      className="p-2 hover:bg-neutral-700 rounded-lg transition-colors text-neutral-400 hover:text-white"
                                    >
                                      <Download size={16} />
                                    </a>
                                  )}
                                  {inv.status === 'valid' && (
                                    <button
                                      onClick={() => setCancellingInvoice(inv)}
                                      title="Cancelar factura"
                                      className="p-2 hover:bg-red-900/30 rounded-lg transition-colors text-neutral-400 hover:text-red-400"
                                    >
                                      <XCircle size={16} />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-800">
                      <p className="text-sm text-neutral-400">
                        Mostrando {(invoicePage - 1) * INVOICES_PER_PAGE + 1} -{' '}
                        {Math.min(invoicePage * INVOICES_PER_PAGE, invoiceTotal)} de{' '}
                        {invoiceTotal} facturas
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setInvoicePage((p) => Math.max(1, p - 1))}
                          disabled={invoicePage <= 1}
                          className="flex items-center gap-1 px-3 py-1.5 bg-neutral-800 text-neutral-300 rounded-lg hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          <ChevronLeft size={16} />
                          Anterior
                        </button>
                        <span className="text-sm text-neutral-400">
                          {invoicePage} / {totalPages}
                        </span>
                        <button
                          onClick={() =>
                            setInvoicePage((p) => Math.min(totalPages, p + 1))
                          }
                          disabled={invoicePage >= totalPages}
                          className="flex items-center gap-1 px-3 py-1.5 bg-neutral-800 text-neutral-300 rounded-lg hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          Siguiente
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Cancellation Modal */}
      {cancellingInvoice && catalogs && (
        <Suspense
          fallback={
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
              <Loader2 size={32} className="animate-spin text-brand-500" />
            </div>
          }
        >
          <CancellationModal
            invoice={cancellingInvoice}
            catalogs={catalogs}
            onCancel={handleCancelComplete}
            onClose={() => setCancellingInvoice(null)}
          />
        </Suspense>
      )}
    </div>
  );
}
