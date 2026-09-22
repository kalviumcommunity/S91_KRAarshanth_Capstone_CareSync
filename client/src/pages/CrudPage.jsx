import { Plus, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';

export default function CrudPage({ title, endpoint, fields }) {
  const { user } = useAuth();
  const canWrite = ['super_admin', 'hospital_admin', 'department_manager'].includes(user?.role);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    api.get(`/${endpoint}`)
      .then((response) => setItems(response.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Could not load records'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const reset = () => {
    setForm({});
    setEditing(null);
  };

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (editing) await api.put(`/${endpoint}/${editing}`, form);
      else await api.post(`/${endpoint}`, form);
      reset();
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this record?')) return;
    try {
      await api.delete(`/${endpoint}/${id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="page">
      <PageHeader
        eyebrow="Operations"
        title={title}
        description="MongoDB-backed CRUD with validated REST endpoints."
        action={<button className="secondary" onClick={load}><RefreshCw size={16} /> Refresh</button>}
      />

      {error && <div className="alert error">{error}</div>}

      <div className="crud-layout">
        <div className="panel">
          <div className="panel-title">
            <h3>{editing ? 'Edit record' : 'Add record'}</h3>
            {editing && <button className="ghost" onClick={reset}>Cancel</button>}
          </div>
          {canWrite ? (
            <form onSubmit={submit} className="crud-form">
              {fields.map(([key, label, type]) => (
                <label className="field" key={key}>
                  <span>{label}</span>
                  <input
                    type={type}
                    value={form[key] ?? ''}
                    onChange={(event) => setForm({ ...form, [key]: type === 'number' ? Number(event.target.value) : event.target.value })}
                    required
                  />
                </label>
              ))}
              <button className="primary" disabled={busy}>
                <Plus size={17} />
                {busy ? 'Saving…' : editing ? 'Update record' : 'Create record'}
              </button>
            </form>
          ) : <p className="muted">Your role can view records but cannot modify them.</p>}
        </div>

        <div className="panel table-panel">
          <div className="panel-title"><h3>{items.length} records</h3></div>
          {loading ? <LoadingState message="Loading records…" /> : items.length === 0 ? (
            <EmptyState title="No records yet" message="Create the first record to populate this module." />
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr>{fields.map((field) => <th key={field[0]}>{field[1]}</th>)}{canWrite && <th>Actions</th>}</tr></thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item._id}>
                      {fields.map(([key]) => <td key={key}>{String(item[key] ?? '—')}</td>)}
                      {canWrite && (
                        <td>
                          <div className="row-actions">
                            <button className="icon-btn" onClick={() => { setEditing(item._id); setForm(Object.fromEntries(fields.map(([key]) => [key, item[key] ?? '']))); }} aria-label="Edit record">
                              <Pencil size={15} />
                            </button>
                            <button className="icon-btn danger" onClick={() => remove(item._id)} aria-label="Delete record">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
