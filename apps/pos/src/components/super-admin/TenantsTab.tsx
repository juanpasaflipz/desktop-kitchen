import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, X, Plus, Pencil, Sprout, KeyRound, Download, Trash2, Loader2, Users, Check,
} from 'lucide-react';
import {
  getTenants, getTenantDeepDive, patchTenant, seedTenant,
  getTenantEmployees, updateEmployeePin,
  type TenantRecord, type DeepDiveData, type TenantEmployee,
} from '../../api/superAdmin';
import {
  CreateTenantModal, EditTenantModal, ResetPasswordModal, DeleteTenantModal,
  downloadTenantExport,
} from '../admin/TenantManagement';
import { formatCurrency } from './shared';

function ActionButton({ icon: Icon, label, variant, loading, onClick }: {
  icon: any; label: string; variant?: 'danger'; loading?: boolean; onClick: () => void;
}) {
  const colors = variant === 'danger'
    ? 'text-red-400 hover:bg-red-900/30'
    : 'text-neutral-300 hover:bg-neutral-800';
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 ${colors}`}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <Icon size={14} />}
      {label}
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-neutral-800 rounded p-2.5">
      <p className="text-neutral-500 text-xs">{label}</p>
      <p className="text-white text-sm font-semibold">{value}</p>
    </div>
  );
}

function EmployeePinRow({ emp, tenantId }: { emp: TenantEmployee; tenantId: string }) {
  const [editing, setEditing] = useState(false);
  const [pin, setPin] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setError('');
    setSaving(true);
    try {
      await updateEmployeePin(tenantId, emp.id, pin);
      setSaved(true);
      setEditing(false);
      setPin('');
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed');
    }
    setSaving(false);
  };

  const roleColors: Record<string, string> = {
    admin: 'text-teal-400',
    manager: 'text-blue-400',
    cashier: 'text-neutral-300',
    kitchen: 'text-orange-400',
    bar: 'text-purple-400',
  };

  return (
    <div className="flex items-center gap-2 py-1.5">
      <div className="flex-1 min-w-0">
        <p className="text-white text-xs font-medium truncate">{emp.name}</p>
        <p className={`text-[10px] ${roleColors[emp.role] || 'text-neutral-400'}`}>{emp.role}</p>
      </div>
      {editing ? (
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={pin}
            onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="PIN"
            className="w-16 bg-neutral-700 border border-neutral-600 rounded px-1.5 py-1 text-xs text-white text-center font-mono focus:outline-none focus:border-teal-500"
            autoFocus
          />
          <button
            onClick={handleSave}
            disabled={saving || pin.length < 4}
            className="p-1 text-teal-400 hover:bg-teal-900/30 rounded disabled:opacity-50"
          >
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
          </button>
          <button onClick={() => { setEditing(false); setPin(''); setError(''); }} className="p-1 text-neutral-500 hover:text-neutral-300">
            <X size={12} />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          {saved && <span className="text-teal-400 text-[10px]">Saved</span>}
          <button
            onClick={() => setEditing(true)}
            className="px-1.5 py-0.5 text-[10px] text-neutral-400 hover:text-teal-400 hover:bg-neutral-800 rounded transition-colors"
          >
            Set PIN
          </button>
        </div>
      )}
      {error && <span className="text-red-400 text-[10px]">{error}</span>}
    </div>
  );
}

function EmployeeSection({ tenantId }: { tenantId: string }) {
  const [employees, setEmployees] = useState<TenantEmployee[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      setEmployees(await getTenantEmployees(tenantId));
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    if (expanded && employees.length === 0) fetchEmployees();
  }, [expanded]);

  return (
    <div className="border-t border-neutral-800 pt-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-neutral-400 text-xs font-medium uppercase tracking-wide hover:text-neutral-200 transition-colors w-full"
      >
        <Users size={12} />
        <span>Employees & PINs</span>
        <span className="ml-auto text-neutral-600">{expanded ? '\u25B2' : '\u25BC'}</span>
      </button>
      {expanded && (
        <div className="mt-2 space-y-0.5">
          {loading ? (
            <div className="text-neutral-500 text-xs py-2">Loading...</div>
          ) : employees.length === 0 ? (
            <div className="text-neutral-500 text-xs py-2">No employees</div>
          ) : (
            employees.map(emp => (
              <EmployeePinRow key={emp.id} emp={emp} tenantId={tenantId} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function TenantsTab() {
  const [tenants, setTenants] = useState<TenantRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deepDive, setDeepDive] = useState<DeepDiveData | null>(null);
  const [ddLoading, setDdLoading] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [editingTenant, setEditingTenant] = useState<TenantRecord | null>(null);
  const [resetPwTenant, setResetPwTenant] = useState<TenantRecord | null>(null);
  const [deletingTenant, setDeletingTenant] = useState<TenantRecord | null>(null);
  const [seedingId, setSeedingId] = useState<string | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');

  const fetchTenants = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTenants({ search: search || undefined, plan: planFilter || undefined });
      setTenants(data);
    } catch {}
    setLoading(false);
  }, [search, planFilter]);

  useEffect(() => { fetchTenants(); }, [fetchTenants]);

  const openDeepDive = async (id: string) => {
    setSelectedId(id);
    setDdLoading(true);
    try { setDeepDive(await getTenantDeepDive(id)); } catch {}
    setDdLoading(false);
  };

  const handlePlanChange = async (id: string, plan: string) => {
    setActionError('');
    try {
      await patchTenant(id, { plan });
      fetchTenants();
      if (selectedId === id && deepDive) setDeepDive({ ...deepDive, tenant: { ...deepDive.tenant, plan } });
    } catch (err: any) { setActionError(err.message || 'Failed to update plan'); }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    setActionError('');
    try { await patchTenant(id, { active: !active }); fetchTenants(); }
    catch (err: any) { setActionError(err.message || 'Failed to toggle status'); }
  };

  const handleSeed = async (id: string) => {
    if (!confirm(`Seed demo data for tenant "${id}"?`)) return;
    setSeedingId(id);
    try { await seedTenant(id); fetchTenants(); if (selectedId === id) openDeepDive(id); } catch {}
    setSeedingId(null);
  };

  const handleExport = async (id: string, name: string) => {
    setExportingId(id);
    try { await downloadTenantExport(id, name); } catch {}
    setExportingId(null);
  };

  const ddTenant = deepDive?.tenant ?? tenants.find(t => t.id === selectedId) ?? null;

  return (
    <div className="space-y-4">
      {actionError && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 rounded-lg px-4 py-2.5 text-sm flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError('')} className="text-red-400 hover:text-red-200 ml-3"><X size={16} /></button>
        </div>
      )}

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-3 text-neutral-500" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tenants..."
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-9 pr-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-teal-500 text-sm"
          />
        </div>
        <select value={planFilter} onChange={e => setPlanFilter(e.target.value)}
          className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-teal-500">
          <option value="">All plans</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
        </select>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-semibold transition-colors">
          <Plus size={16} /> Create Tenant
        </button>
      </div>

      <div className="flex gap-6">
        <div className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
          {loading ? (
            <div className="text-neutral-400 text-center py-8">Loading tenants...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-800">
                    <th className="text-left text-neutral-400 font-medium px-4 py-3">Name</th>
                    <th className="text-left text-neutral-400 font-medium px-4 py-3">Plan</th>
                    <th className="text-left text-neutral-400 font-medium px-4 py-3">Status</th>
                    <th className="text-right text-neutral-400 font-medium px-4 py-3">Orders</th>
                    <th className="text-right text-neutral-400 font-medium px-4 py-3">Employees</th>
                    <th className="text-center text-neutral-400 font-medium px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map(t => (
                    <tr key={t.id} onClick={() => openDeepDive(t.id)}
                      className={`border-b border-neutral-800 hover:bg-neutral-800/50 cursor-pointer transition-colors ${selectedId === t.id ? 'bg-neutral-800/70' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="text-white font-medium">{t.name}</div>
                        <div className="text-neutral-500 text-xs">{t.id}</div>
                      </td>
                      <td className="px-4 py-3">
                        <select value={t.plan} onClick={e => e.stopPropagation()}
                          onChange={e => { e.stopPropagation(); handlePlanChange(t.id, e.target.value); }}
                          className="bg-neutral-700 border-none rounded px-2 py-1 text-xs text-white focus:outline-none">
                          <option value="free">Free</option>
                          <option value="pro">Pro</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${t.active ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                          {t.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-neutral-300">{t.order_count}</td>
                      <td className="px-4 py-3 text-right text-neutral-300">{t.employee_count}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5" onClick={e => e.stopPropagation()}>
                          <button onClick={() => handleSeed(t.id)} disabled={seedingId === t.id} title="Seed demo data"
                            className="p-1.5 rounded text-neutral-400 hover:text-teal-400 hover:bg-neutral-800 transition-colors disabled:opacity-50">
                            {seedingId === t.id ? <Loader2 size={14} className="animate-spin" /> : <Sprout size={14} />}
                          </button>
                          <button onClick={() => setEditingTenant(t)} title="Edit"
                            className="p-1.5 rounded text-neutral-400 hover:text-teal-400 hover:bg-neutral-800 transition-colors">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => setResetPwTenant(t)} title="Reset Password"
                            className="p-1.5 rounded text-neutral-400 hover:text-yellow-400 hover:bg-neutral-800 transition-colors">
                            <KeyRound size={14} />
                          </button>
                          <button onClick={() => handleToggleActive(t.id, t.active)}
                            className={`text-xs px-2 py-1 rounded ${t.active ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' : 'bg-green-900/30 text-green-400 hover:bg-green-900/50'} transition-colors`}>
                            {t.active ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {tenants.length === 0 && <div className="text-neutral-500 text-center py-8">No tenants found</div>}
            </div>
          )}
        </div>

        {selectedId && (
          <div className="w-80 bg-neutral-900 border border-neutral-800 rounded-lg p-5 space-y-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">Tenant Details</h3>
              <button onClick={() => { setSelectedId(null); setDeepDive(null); }} className="text-neutral-500 hover:text-neutral-300"><X size={18} /></button>
            </div>
            {ddLoading || !deepDive ? (
              <div className="text-neutral-400 text-sm">Loading...</div>
            ) : (
              <>
                <div>
                  <p className="text-white font-medium">{deepDive.tenant.name}</p>
                  <p className="text-neutral-500 text-xs">{deepDive.tenant.owner_email}</p>
                  <p className="text-neutral-500 text-xs mt-1">Joined {new Date(deepDive.tenant.created_at).toLocaleDateString()}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Stat label="Orders (all)" value={deepDive.stats.total_orders} />
                  <Stat label="Revenue (all)" value={formatCurrency(deepDive.stats.total_revenue)} />
                  <Stat label="Orders (30d)" value={deepDive.stats.orders_30d} />
                  <Stat label="Revenue (30d)" value={formatCurrency(deepDive.stats.revenue_30d)} />
                  <Stat label="Employees" value={deepDive.stats.employee_count} />
                  <Stat label="Menu Items" value={deepDive.stats.menu_item_count} />
                  <Stat label="Categories" value={deepDive.stats.category_count} />
                  <Stat label="Customers" value={deepDive.stats.customer_count} />
                </div>
                {deepDive.stats.last_order_at && (
                  <p className="text-neutral-500 text-xs">Last order: {new Date(deepDive.stats.last_order_at).toLocaleString()}</p>
                )}
                <EmployeeSection tenantId={selectedId!} />
                <div className="border-t border-neutral-800 pt-4 space-y-2">
                  <p className="text-neutral-500 text-xs font-medium uppercase tracking-wide mb-2">Actions</p>
                  {ddTenant && (
                    <>
                      <ActionButton icon={Pencil} label="Edit Details" onClick={() => setEditingTenant(ddTenant)} />
                      <ActionButton icon={Sprout} label="Seed Demo Data" loading={seedingId === selectedId} onClick={() => handleSeed(selectedId!)} />
                      <ActionButton icon={KeyRound} label="Reset Password" onClick={() => setResetPwTenant(ddTenant)} />
                      <ActionButton icon={Download} label="Export Data" loading={exportingId === selectedId} onClick={() => handleExport(selectedId!, deepDive.tenant.name)} />
                      <ActionButton icon={Trash2} label="Delete Tenant" variant="danger" onClick={() => setDeletingTenant(ddTenant)} />
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {showCreate && <CreateTenantModal onClose={() => setShowCreate(false)} onSuccess={fetchTenants} />}
      {editingTenant && <EditTenantModal tenant={editingTenant} onClose={() => setEditingTenant(null)} onSuccess={() => { fetchTenants(); if (selectedId) openDeepDive(selectedId); }} />}
      {resetPwTenant && <ResetPasswordModal tenant={resetPwTenant} onClose={() => setResetPwTenant(null)} />}
      {deletingTenant && <DeleteTenantModal tenant={deletingTenant} onClose={() => setDeletingTenant(null)} onSuccess={() => { fetchTenants(); setSelectedId(null); setDeepDive(null); }} />}
    </div>
  );
}
