import { useState, useEffect } from 'react';
import {
  obtenerGrados,  crearGrado,    actualizarGrado,  eliminarGrado,
  obtenerDocentes, crearDocente, actualizarDocente, eliminarDocente,
  obtenerBloques,  crearBloque,  actualizarBloque,  eliminarBloque,
} from '../services/horariosService';

const TABS = [
  { key: 'grados',   label: 'Grados',   icon: 'fa-graduation-cap' },
  { key: 'docentes', label: 'Docentes', icon: 'fa-chalkboard-user' },
  { key: 'bloques',  label: 'Bloques',  icon: 'fa-clock' },
];

const NIVELES = ['Inicial', 'Primaria', 'Secundaria'];

export default function AdminHorario() {
  const [tab,       setTab]       = useState('grados');
  const [grados,    setGrados]    = useState([]);
  const [docentes,  setDocentes]  = useState([]);
  const [bloques,   setBloques]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [toast,     setToast]     = useState(null);

  /* ── Modales ── */
  const [showGrado,   setShowGrado]   = useState(false);
  const [showDocente, setShowDocente] = useState(false);
  const [showBloque,  setShowBloque]  = useState(false);
  const [confirmEl,   setConfirmEl]   = useState(null);  // { tipo, id }
  const [guardando,   setGuardando]   = useState(false);

  /* ── Formularios ── */
  const [fGrado,   setFGrado]   = useState({ id: null, nombre: '', nivel: 'Secundaria', orden: 1 });
  const [fDocente, setFDocente] = useState({ id: null, nombre_completo: '', nombre_corto: '', especialidad: '' });
  const [fBloque,  setFBloque]  = useState({ id: null, hora: '', es_receso: false, orden: 1 });

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      setLoading(true);
      const [g, d, b] = await Promise.all([
        obtenerGrados(),
        obtenerDocentes(),
        obtenerBloques(),
      ]);
      setGrados(g);
      setDocentes(d);
      setBloques(b);
    } catch {
      showToast('Error al cargar datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* ══ GRADOS ══ */
  const abrirGrado = (g = null) => {
    setFGrado(g ? { ...g } : { id: null, nombre: '', nivel: 'Secundaria', orden: grados.length + 1 });
    setShowGrado(true);
  };

  const submitGrado = async (e) => {
    e.preventDefault();
    if (!fGrado.nombre.trim()) { showToast('El nombre es obligatorio', 'error'); return; }
    setGuardando(true);
    try {
      if (fGrado.id) {
        await actualizarGrado(fGrado.id, fGrado);
        showToast('Grado actualizado');
      } else {
        await crearGrado(fGrado);
        showToast('Grado creado');
      }
      setShowGrado(false);
      await cargar();
    } catch { showToast('Error al guardar', 'error'); }
    finally { setGuardando(false); }
  };

  /* ══ DOCENTES ══ */
  const abrirDocente = (d = null) => {
    setFDocente(d ? { ...d } : { id: null, nombre_completo: '', nombre_corto: '', especialidad: '' });
    setShowDocente(true);
  };

  const submitDocente = async (e) => {
    e.preventDefault();
    if (!fDocente.nombre_completo.trim()) { showToast('El nombre es obligatorio', 'error'); return; }
    setGuardando(true);
    try {
      if (fDocente.id) {
        await actualizarDocente(fDocente.id, fDocente);
        showToast('Docente actualizado');
      } else {
        await crearDocente(fDocente);
        showToast('Docente creado');
      }
      setShowDocente(false);
      await cargar();
    } catch { showToast('Error al guardar', 'error'); }
    finally { setGuardando(false); }
  };

  /* ══ BLOQUES ══ */
  const abrirBloque = (b = null) => {
    setFBloque(b ? { ...b } : { id: null, hora: '', es_receso: false, orden: bloques.length + 1 });
    setShowBloque(true);
  };

  const submitBloque = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      if (fBloque.id) {
        await actualizarBloque(fBloque.id, fBloque);
        showToast('Bloque actualizado');
      } else {
        await crearBloque(fBloque);
        showToast('Bloque creado');
      }
      setShowBloque(false);
      await cargar();
    } catch { showToast('Error al guardar', 'error'); }
    finally { setGuardando(false); }
  };

  /* ══ ELIMINAR ══ */
  const confirmarEliminar = async () => {
    if (!confirmEl) return;
    try {
      if (confirmEl.tipo === 'grado')   await eliminarGrado(confirmEl.id);
      if (confirmEl.tipo === 'docente') await eliminarDocente(confirmEl.id);
      if (confirmEl.tipo === 'bloque')  await eliminarBloque(confirmEl.id);
      showToast('Eliminado correctamente');
      setConfirmEl(null);
      await cargar();
    } catch {
      showToast('Error al eliminar', 'error');
      setConfirmEl(null);
    }
  };

  /* ── Stats ── */
  const porNivel = NIVELES.map(n => ({
    nivel: n, count: grados.filter(g => g.nivel === n).length,
  })).filter(x => x.count > 0);

  return (
    <div className="page-section">

      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="section-title">Panel de Horarios</h1>
          <p className="section-subtitle">Gestión de grados, docentes y bloques horarios</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row" style={{ marginBottom: 20 }}>
        {[
          { label: 'Grados',   value: grados.length,   icon: 'fa-graduation-cap', color: '#38bdf8' },
          { label: 'Docentes', value: docentes.length,  icon: 'fa-chalkboard-user', color: '#06b6d4' },
          { label: 'Bloques',  value: bloques.length,   icon: 'fa-clock',           color: '#818cf8' },
        ].map(s => (
          <div key={s.label} className="stats-row-card">
            <div className="stats-row-icon" style={{ background: s.color }}>
              <i className={`fas ${s.icon}`} />
            </div>
            <div>
              <div className="stats-row-value">{loading ? '—' : s.value}</div>
              <div className="stats-row-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '8px 16px', fontSize: 13, fontWeight: 600,
              color: tab === t.key ? 'var(--accent)' : 'var(--text-secondary)',
              borderBottom: tab === t.key ? '2px solid var(--accent)' : '2px solid transparent',
              display: 'flex', alignItems: 'center', gap: 6,
              transition: 'color .2s',
            }}>
            <i className={`fas ${t.icon}`} />{t.label}
          </button>
        ))}
      </div>

      {/* Contenido de tabs */}
      {loading ? (
        <div className="loading-state"><div className="loading-spinner" /><p>Cargando...</p></div>
      ) : (
        <>
          {/* ── GRADOS ── */}
          {tab === 'grados' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                <button className="btn btn-primary" onClick={() => abrirGrado()}>
                  <i className="fas fa-plus" /> Nuevo Grado
                </button>
              </div>
              <div className="table-card">
                {grados.length === 0 ? (
                  <div className="empty-state">
                    <i className="fas fa-graduation-cap" />
                    <p>No hay grados registrados</p>
                  </div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Nivel</th>
                        <th style={{ textAlign: 'center' }}>Orden</th>
                        <th style={{ textAlign: 'right' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grados.map(g => (
                        <tr key={g.id}>
                          <td style={{ fontWeight: 600 }}>{g.nombre}</td>
                          <td>
                            <span className="badge" style={{
                              background: g.nivel === 'Secundaria' ? 'rgba(56,189,248,.15)' : g.nivel === 'Primaria' ? 'rgba(74,222,128,.15)' : 'rgba(251,191,36,.15)',
                              color:      g.nivel === 'Secundaria' ? '#38bdf8'              : g.nivel === 'Primaria' ? '#4ade80'              : '#fbbf24',
                              border:     g.nivel === 'Secundaria' ? '1px solid rgba(56,189,248,.3)' : g.nivel === 'Primaria' ? '1px solid rgba(74,222,128,.3)' : '1px solid rgba(251,191,36,.3)',
                            }}>
                              {g.nivel}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{g.orden}</td>
                          <td>
                            <div className="actions-cell">
                              <button className="btn btn-ghost btn-sm btn-icon" onClick={() => abrirGrado(g)}><i className="fas fa-pencil" /></button>
                              <button className="btn btn-danger btn-sm btn-icon" onClick={() => setConfirmEl({ tipo: 'grado', id: g.id, nombre: g.nombre })}><i className="fas fa-trash" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ── DOCENTES ── */}
          {tab === 'docentes' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                <button className="btn btn-primary" onClick={() => abrirDocente()}>
                  <i className="fas fa-plus" /> Nuevo Docente
                </button>
              </div>
              <div className="table-card">
                {docentes.length === 0 ? (
                  <div className="empty-state">
                    <i className="fas fa-chalkboard-user" />
                    <p>No hay docentes registrados</p>
                  </div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Nombre Completo</th>
                        <th>Abreviatura</th>
                        <th>Especialidad</th>
                        <th style={{ textAlign: 'right' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {docentes.map(d => (
                        <tr key={d.id}>
                          <td style={{ fontWeight: 600 }}>{d.nombre_completo}</td>
                          <td>
                            {d.nombre_corto && (
                              <span className="badge badge-editor">{d.nombre_corto}</span>
                            )}
                          </td>
                          <td style={{ color: 'var(--text-secondary)' }}>{d.especialidad || '—'}</td>
                          <td>
                            <div className="actions-cell">
                              <button className="btn btn-ghost btn-sm btn-icon" onClick={() => abrirDocente(d)}><i className="fas fa-pencil" /></button>
                              <button className="btn btn-danger btn-sm btn-icon" onClick={() => setConfirmEl({ tipo: 'docente', id: d.id, nombre: d.nombre_completo })}><i className="fas fa-trash" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ── BLOQUES ── */}
          {tab === 'bloques' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                <button className="btn btn-primary" onClick={() => abrirBloque()}>
                  <i className="fas fa-plus" /> Nuevo Bloque
                </button>
              </div>
              <div className="table-card">
                {bloques.length === 0 ? (
                  <div className="empty-state">
                    <i className="fas fa-clock" />
                    <p>No hay bloques horarios registrados</p>
                  </div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Hora</th>
                        <th style={{ textAlign: 'center' }}>Tipo</th>
                        <th style={{ textAlign: 'center' }}>Orden</th>
                        <th style={{ textAlign: 'right' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bloques.map(b => (
                        <tr key={b.id}>
                          <td style={{ fontWeight: 600 }}>{b.hora}</td>
                          <td style={{ textAlign: 'center' }}>
                            {b.es_receso
                              ? <span className="badge badge-warning">Receso</span>
                              : <span className="badge badge-active">Clase</span>
                            }
                          </td>
                          <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{b.orden}</td>
                          <td>
                            <div className="actions-cell">
                              <button className="btn btn-ghost btn-sm btn-icon" onClick={() => abrirBloque(b)}><i className="fas fa-pencil" /></button>
                              <button className="btn btn-danger btn-sm btn-icon" onClick={() => setConfirmEl({ tipo: 'bloque', id: b.id, nombre: b.hora })}><i className="fas fa-trash" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Modal Grado ── */}
      {showGrado && (
        <div className="modal-overlay">
          <div className="modal" style={{ width: 420 }}>
            <div className="modal-header">
              <h3><i className="fas fa-graduation-cap" style={{ color: 'var(--accent)' }} /> {fGrado.id ? 'Editar Grado' : 'Nuevo Grado'}</h3>
              <button className="modal-close" onClick={() => setShowGrado(false)}><i className="fas fa-xmark" /></button>
            </div>
            <form onSubmit={submitGrado}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nombre *</label>
                  <input className="form-input" placeholder="Ej: 1° A" required
                    value={fGrado.nombre} onChange={e => setFGrado(p => ({ ...p, nombre: e.target.value }))} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Nivel</label>
                    <select className="form-input" value={fGrado.nivel}
                      onChange={e => setFGrado(p => ({ ...p, nivel: e.target.value }))}>
                      {NIVELES.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Orden</label>
                    <input type="number" min={1} className="form-input" value={fGrado.orden}
                      onChange={e => setFGrado(p => ({ ...p, orden: +e.target.value }))} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowGrado(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={guardando}>
                  {guardando ? <><i className="fas fa-spinner fa-spin" /> Guardando…</> : <><i className="fas fa-save" /> Guardar</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Docente ── */}
      {showDocente && (
        <div className="modal-overlay">
          <div className="modal" style={{ width: 460 }}>
            <div className="modal-header">
              <h3><i className="fas fa-chalkboard-user" style={{ color: 'var(--accent)' }} /> {fDocente.id ? 'Editar Docente' : 'Nuevo Docente'}</h3>
              <button className="modal-close" onClick={() => setShowDocente(false)}><i className="fas fa-xmark" /></button>
            </div>
            <form onSubmit={submitDocente}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nombre Completo *</label>
                  <input className="form-input" placeholder="Ej: Juan Pérez García" required
                    value={fDocente.nombre_completo}
                    onChange={e => setFDocente(p => ({ ...p, nombre_completo: e.target.value }))} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Abreviatura</label>
                    <input className="form-input" placeholder="Ej: J.PÉREZ"
                      value={fDocente.nombre_corto}
                      onChange={e => setFDocente(p => ({ ...p, nombre_corto: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Especialidad</label>
                    <input className="form-input" placeholder="Ej: Matemáticas"
                      value={fDocente.especialidad}
                      onChange={e => setFDocente(p => ({ ...p, especialidad: e.target.value }))} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowDocente(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={guardando}>
                  {guardando ? <><i className="fas fa-spinner fa-spin" /> Guardando…</> : <><i className="fas fa-save" /> Guardar</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Bloque ── */}
      {showBloque && (
        <div className="modal-overlay">
          <div className="modal" style={{ width: 400 }}>
            <div className="modal-header">
              <h3><i className="fas fa-clock" style={{ color: 'var(--accent)' }} /> {fBloque.id ? 'Editar Bloque' : 'Nuevo Bloque'}</h3>
              <button className="modal-close" onClick={() => setShowBloque(false)}><i className="fas fa-xmark" /></button>
            </div>
            <form onSubmit={submitBloque}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Hora</label>
                    <input className="form-input" placeholder="Ej: 08:00 - 08:45"
                      value={fBloque.hora}
                      onChange={e => setFBloque(p => ({ ...p, hora: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Orden</label>
                    <input type="number" min={1} className="form-input" value={fBloque.orden}
                      onChange={e => setFBloque(p => ({ ...p, orden: +e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" checked={!!fBloque.es_receso}
                      onChange={e => setFBloque(p => ({ ...p, es_receso: e.target.checked }))}
                      style={{ width: 16, height: 16, accentColor: 'var(--accent)' }} />
                    <span className="form-label" style={{ margin: 0 }}>Es receso / recreo</span>
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowBloque(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={guardando}>
                  {guardando ? <><i className="fas fa-spinner fa-spin" /> Guardando…</> : <><i className="fas fa-save" /> Guardar</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Confirmar Eliminar ── */}
      {confirmEl && (
        <div className="modal-overlay" onClick={() => setConfirmEl(null)}>
          <div className="modal" style={{ width: 380 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="fas fa-trash" style={{ color: 'var(--danger)' }} /> Eliminar</h3>
              <button className="modal-close" onClick={() => setConfirmEl(null)}><i className="fas fa-xmark" /></button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: '28px 24px' }}>
              <div className="confirm-icon"><i className="fas fa-trash" /></div>
              <p style={{ fontWeight: 700, marginBottom: 8 }}>¿Eliminar "{confirmEl.nombre}"?</p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Esta acción no se puede deshacer.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setConfirmEl(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={confirmarEliminar}>
                <i className="fas fa-trash" /> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            <i className={`fas ${toast.type === 'error' ? 'fa-circle-xmark' : 'fa-circle-check'}`} />
            {toast.msg}
          </div>
        </div>
      )}
    </div>
  );
}
