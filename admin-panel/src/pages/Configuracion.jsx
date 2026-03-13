import { useState, useEffect } from 'react';
import { configService } from '../services/configService';

function Toast({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <i className={`fas fa-${t.type === 'success' ? 'circle-check' : 'circle-xmark'}`} />
          {t.text}
        </div>
      ))}
    </div>
  );
}

/* ── Sección Información Institucional ── */
function SeccionInformacion({ toast }) {
  const [data,   setData]   = useState(null);
  const [form,   setForm]   = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    configService.getInformacion().then(d => {
      if (d) { setData(d); setForm(d); }
    }).catch(() => toast('Error al cargar información institucional', 'error'));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await configService.updateInformacion(form);
      toast('Información institucional actualizada');
    } catch {
      toast('Error al guardar', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!data) return <div className="loading-state"><div className="loading-spinner" /><p>Cargando...</p></div>;

  const campo = (label, name, type = 'text') => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input
        type={type}
        className="form-input"
        name={name}
        value={form[name] || ''}
        onChange={handleChange}
        disabled={saving}
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1.5rem' }}>
        {campo('Nombre de la institución', 'nombre')}
        {campo('Código modular', 'codigo_modular')}
        {campo('Director / Directora', 'director')}
        {campo('Ubicación', 'ubicacion')}
        {campo('Teléfono', 'telefono', 'tel')}
        {campo('Correo institucional', 'email', 'email')}
        {campo('Año de vigencia', 'anio_vigencia', 'number')}
        {campo('Grados atendidos', 'grados_atendidos')}
        {campo('Nivel educativo', 'nivel_educativo')}
        {campo('Tipo de gestión', 'tipo_gestion')}
      </div>
      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving
            ? <><i className="fas fa-spinner fa-spin" /> Guardando...</>
            : <><i className="fas fa-floppy-disk" /> Guardar cambios</>}
        </button>
      </div>
    </form>
  );
}

/* ── Sección Metadatos FONDEP ── */
function SeccionMetadata({ toast }) {
  const [rows,       setRows]       = useState([]);
  const [editando,   setEditando]   = useState(null);  // clave en edición
  const [valorEdit,  setValorEdit]  = useState('');
  const [saving,     setSaving]     = useState(false);
  const [loading,    setLoading]    = useState(true);

  const cargar = () => {
    setLoading(true);
    configService.getMetadata()
      .then(setRows)
      .catch(() => toast('Error al cargar metadatos', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, []);

  const iniciarEdicion = (row) => {
    setEditando(row.clave);
    setValorEdit(row.valor);
  };

  const cancelar = () => { setEditando(null); setValorEdit(''); };

  const guardar = async (clave) => {
    setSaving(true);
    try {
      await configService.updateMetadata(clave, valorEdit);
      toast(`Metadato "${clave}" actualizado`);
      setEditando(null);
      cargar();
    } catch {
      toast('Error al guardar', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-state"><div className="loading-spinner" /><p>Cargando...</p></div>;

  return (
    <div className="table-card">
      <table>
        <thead>
          <tr>
            <th style={{ width: 180 }}>Clave</th>
            <th>Valor</th>
            <th style={{ width: 80 }}>Tipo</th>
            <th style={{ width: 200 }}>Descripción</th>
            <th style={{ textAlign: 'right', width: 100 }}>Acción</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.clave}>
              <td>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--accent)', fontWeight: 700 }}>
                  {row.clave}
                </span>
              </td>
              <td>
                {editando === row.clave ? (
                  row.tipo === 'json' ? (
                    <textarea
                      className="form-input"
                      rows={3}
                      value={valorEdit}
                      onChange={e => setValorEdit(e.target.value)}
                      style={{ fontFamily: 'var(--mono)', fontSize: 12, resize: 'vertical' }}
                      disabled={saving}
                    />
                  ) : (
                    <input
                      type={row.tipo === 'numero' ? 'number' : row.tipo === 'fecha' ? 'date' : 'text'}
                      className="form-input"
                      value={valorEdit}
                      onChange={e => setValorEdit(e.target.value)}
                      disabled={saving}
                    />
                  )
                ) : (
                  <span style={{ fontSize: 13, color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                    {row.valor}
                  </span>
                )}
              </td>
              <td>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
                  background: 'var(--bg-elevated)', color: 'var(--text-secondary)',
                  fontFamily: 'var(--mono)',
                }}>
                  {row.tipo}
                </span>
              </td>
              <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{row.descripcion || '—'}</td>
              <td className="actions-cell">
                {editando === row.clave ? (
                  <>
                    <button className="btn btn-icon btn-success btn-sm" title="Guardar"
                      onClick={() => guardar(row.clave)} disabled={saving}>
                      <i className={`fas fa-${saving ? 'spinner fa-spin' : 'check'}`} />
                    </button>
                    <button className="btn btn-icon btn-ghost btn-sm" title="Cancelar"
                      onClick={cancelar} disabled={saving}>
                      <i className="fas fa-xmark" />
                    </button>
                  </>
                ) : (
                  <button className="btn btn-icon btn-ghost btn-sm" title="Editar"
                    onClick={() => iniciarEdicion(row)}
                    style={{ color: 'var(--accent)' }}>
                    <i className="fas fa-pen" />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ══════════════════════════════════
   Página principal
══════════════════════════════════ */
export default function Configuracion() {
  const [tab,    setTab]    = useState('informacion');
  const [toasts, setToasts] = useState([]);

  const toast = (text, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, text, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  };

  const tabs = [
    { id: 'informacion', label: 'Información Institucional', icon: 'fa-building' },
    { id: 'metadata',    label: 'Metadatos FONDEP',          icon: 'fa-database'  },
  ];

  return (
    <div className="page-section">
      <Toast toasts={toasts} />

      <div className="section-header">
        <div>
          <h2 className="section-title">Configuración</h2>
          <p className="section-subtitle">Información institucional y metadatos del Proyecto FONDEP</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 4,
        background: 'var(--bg-surface)', border: '1px solid var(--border)',
        borderRadius: 10, padding: 4, marginBottom: 20, width: 'fit-content',
      }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600,
              background: tab === t.id ? 'var(--accent)' : 'none',
              color: tab === t.id ? '#fff' : 'var(--text-secondary)',
              transition: 'all .2s',
            }}
          >
            <i className={`fas ${t.icon}`} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      <div className="table-card" style={{ padding: tab === 'informacion' ? '1.5rem' : 0 }}>
        {tab === 'informacion'
          ? <SeccionInformacion toast={toast} />
          : <SeccionMetadata    toast={toast} />
        }
      </div>
    </div>
  );
}
