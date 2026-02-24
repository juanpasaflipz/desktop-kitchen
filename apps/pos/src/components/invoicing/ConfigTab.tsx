import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  CheckCircle,
  XCircle,
  RefreshCw,
  Loader2,
  Shield,
} from 'lucide-react';
import {
  updateCfdiConfig,
  uploadCSD,
  testCfdiConnection,
} from '../../api';
import type { CfdiConfig, CfdiCatalogs } from '../../types';

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

interface ConfigTabProps {
  config: CfdiConfig | null;
  catalogs: CfdiCatalogs | null;
  onConfigUpdate: (config: CfdiConfig) => void;
  onError: (msg: string) => void;
  onSuccess: (msg: string) => void;
}

export default function ConfigTab({ config, catalogs, onConfigUpdate, onError, onSuccess }: ConfigTabProps) {
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

  const [cerFile, setCerFile] = useState<File | null>(null);
  const [keyFile, setKeyFile] = useState<File | null>(null);
  const [csdPassword, setCsdPassword] = useState('');
  const [uploadingCSD, setUploadingCSD] = useState(false);
  const cerInputRef = useRef<HTMLInputElement>(null);
  const keyInputRef = useRef<HTMLInputElement>(null);

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    expires_at?: string;
    error?: string;
  } | null>(null);

  useEffect(() => {
    if (config) {
      setCfdiForm({
        rfc: config.rfc || '',
        legal_name: config.legal_name || '',
        tax_regime: config.tax_regime || '',
        postal_code: config.postal_code || '',
        default_uso_cfdi: config.default_uso_cfdi || 'G03',
        invoice_series: config.invoice_series || 'A',
        invoice_link_expiry_hours: config.invoice_link_expiry_hours || 72,
      });
    }
  }, [config]);

  const handleSaveConfig = async () => {
    try {
      setSavingConfig(true);

      if (!cfdiForm.rfc || !cfdiForm.legal_name || !cfdiForm.tax_regime || !cfdiForm.postal_code) {
        onError('Todos los campos obligatorios deben estar completos');
        return;
      }

      if (!/^\d{5}$/.test(cfdiForm.postal_code)) {
        onError('El codigo postal debe tener 5 digitos');
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
      onConfigUpdate(res.config);
      onSuccess('Configuracion guardada correctamente');
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Error al guardar configuracion');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleUploadCSD = async () => {
    if (!cerFile || !keyFile || !csdPassword) {
      onError('Debes seleccionar ambos archivos (.cer y .key) e ingresar la contrasena');
      return;
    }

    try {
      setUploadingCSD(true);

      const formData = new FormData();
      formData.append('cer', cerFile);
      formData.append('key', keyFile);
      formData.append('password', csdPassword);

      const res = await uploadCSD(formData);
      onConfigUpdate(res.config);
      setCerFile(null);
      setKeyFile(null);
      setCsdPassword('');
      if (cerInputRef.current) cerInputRef.current.value = '';
      if (keyInputRef.current) keyInputRef.current.value = '';
      onSuccess(res.message || 'CSD cargado correctamente');
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Error al cargar CSD');
    } finally {
      setUploadingCSD(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setTesting(true);
      setTestResult(null);
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

  return (
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
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">
              RFC <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={cfdiForm.rfc}
              onChange={(e) => setCfdiForm({ ...cfdiForm, rfc: e.target.value.toUpperCase() })}
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
              value={cfdiForm.legal_name}
              onChange={(e) => setCfdiForm({ ...cfdiForm, legal_name: e.target.value.toUpperCase() })}
              placeholder="MI EMPRESA SA DE CV"
              className="w-full bg-neutral-800 text-white rounded-lg px-4 py-3 border border-neutral-700 focus:border-brand-500 focus:outline-none uppercase"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">
              Regimen Fiscal <span className="text-red-400">*</span>
            </label>
            <select
              value={cfdiForm.tax_regime}
              onChange={(e) => setCfdiForm({ ...cfdiForm, tax_regime: e.target.value })}
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

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">
              Uso de CFDI por defecto
            </label>
            <select
              value={cfdiForm.default_uso_cfdi}
              onChange={(e) => setCfdiForm({ ...cfdiForm, default_uso_cfdi: e.target.value })}
              className="w-full bg-neutral-800 text-white rounded-lg px-4 py-3 border border-neutral-700 focus:border-brand-500 focus:outline-none"
            >
              {catalogs?.usoCfdi.map((u) => (
                <option key={u.code} value={u.code}>
                  {u.code} - {u.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">
              Serie de Factura
            </label>
            <input
              type="text"
              value={cfdiForm.invoice_series}
              onChange={(e) => setCfdiForm({ ...cfdiForm, invoice_series: e.target.value.toUpperCase() })}
              placeholder="A"
              maxLength={10}
              className="w-full bg-neutral-800 text-white rounded-lg px-4 py-3 border border-neutral-700 focus:border-brand-500 focus:outline-none uppercase"
            />
          </div>

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
                  invoice_link_expiry_hours: Math.max(1, parseInt(e.target.value, 10) || 1),
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

      {/* CSD Upload */}
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
  );
}
