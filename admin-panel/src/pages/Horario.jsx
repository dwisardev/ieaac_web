import { useState, useEffect } from 'react';
import {
  obtenerGrados,      crearGrado,         actualizarGrado,      eliminarGrado,
  obtenerDocentes,
  obtenerBloques,     crearBloque,        actualizarBloque,     eliminarBloque,
  obtenerAsignaturas, crearAsignatura,    actualizarAsignatura, eliminarAsignatura,
  obtenerHorarioEstudiante, guardarHorarioEstudiante,
  obtenerHorarioDocente,    guardarHorarioDocente as apiGuardarHorarioDocente,
} from '../services/horariosService';

const TABS = [
  { key: 'grados',          label: 'Grados',             icon: 'fa-graduation-cap' },
  { key: 'bloques',         label: 'Bloques',            icon: 'fa-clock' },
  { key: 'asignaturas',     label: 'Asignaturas',        icon: 'fa-book' },
  { key: 'docentes',        label: 'Docentes',           icon: 'fa-chalkboard-user' },
  { key: 'horario-grado',   label: 'Horario por Grado',  icon: 'fa-table' },
  { key: 'horario-docente', label: 'Horario por Docente',icon: 'fa-user-clock' },
];

const DIAS       = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
const DIAS_LABEL = { lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles', jueves: 'Jueves', viernes: 'Viernes' };
const NIVELES    = ['Inicial', 'Primaria', 'Secundaria'];

export default function AdminHorario() {
  const [tab,        setTab]        = useState('grados');
  const [grados,     setGrados]     = useState([]);
  const [docentes,   setDocentes]   = useState([]);
  const [bloques,    setBloques]    = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [toast,      setToast]      = useState(null);

  /* ── Modales CRUD ── */
  const [showGrado,      setShowGrado]      = useState(false);
  const [showBloque,     setShowBloque]     = useState(false);
  const [showAsignatura, setShowAsignatura] = useState(false);
  const [confirmEl,      setConfirmEl]      = useState(null);
  const [guardando,      setGuardando]      = useState(false);

  /* ── Formularios CRUD ── */
  const [fGrado,      setFGrado]      = useState({ id: null, nombre: '', nivel: 'Secundaria', orden: 1 });
  const [fBloque,     setFBloque]     = useState({ id: null, horaInicio: '', horaFin: '', es_receso: false, orden: 1 });
  const [fAsignatura, setFAsignatura] = useState({ id: null, nombre: '', codigo: '', area_curricular: '', color: '#4A90D9' });

  /* ── Horario por Grado ── */
  const [hGradoId,        setHGradoId]        = useState('');
  const [hGradoAnio,      setHGradoAnio]      = useState(new Date().getFullYear());
  const [hGradoCells,     setHGradoCells]     = useState({});
  const [hGradoLoading,   setHGradoLoading]   = useState(false);
  const [hGradoGuardando, setHGradoGuardando] = useState(false);
  const [hGradoCargado,   setHGradoCargado]   = useState(false);

  /* ── Horario por Docente ── */
  const [hDocId,        setHDocId]        = useState('');
  const [hDocAnio,      setHDocAnio]      = useState(new Date().getFullYear());
  const [hDocCells,     setHDocCells]     = useState({});
  const [hDocLoading,   setHDocLoading]   = useState(false);
  const [hDocGuardando, setHDocGuardando] = useState(false);
  const [hDocCargado,   setHDocCargado]   = useState(false);

  /* ── Modal celda ── */
  const [celda, setCelda] = useState(null); // { tipo: 'grado'|'docente', bloque_id, dia }

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      setLoading(true);
      const [g, d, b, a] = await Promise.all([
        obtenerGrados(),
        obtenerDocentes(),
        obtenerBloques(),
        obtenerAsignaturas(),
      ]);
      setGrados(g);
      setDocentes(d);
      setBloques(b);
      setAsignaturas(a);
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

  /* ══ HELPERS GRILLA ══ */
  const initGrid = (bloquesArr) => {
    const g = {};
    bloquesArr.forEach(b => {
      g[b.id] = {};
      DIAS.forEach(d => { g[b.id][d] = { asignatura_id: null, docente_id: null, grado_id: null }; });
    });
    return g;
  };

  const updateCelda = (field, rawValue) => {
    if (!celda) return;
    const value = rawValue === '' || rawValue === null ? null : +rawValue;
    const setter = celda.tipo === 'grado' ? setHGradoCells : setHDocCells;
    setter(prev => ({
      ...prev,
      [celda.bloque_id]: {
        ...prev[celda.bloque_id],
        [celda.dia]: {
          ...(prev[celda.bloque_id]?.[celda.dia] || {}),
          [field]: value,
        }
      }
    }));
  };

  const clearCelda = () => {
    if (!celda) return;
    const setter = celda.tipo === 'grado' ? setHGradoCells : setHDocCells;
    setter(prev => ({
      ...prev,
      [celda.bloque_id]: {
        ...prev[celda.bloque_id],
        [celda.dia]: { asignatura_id: null, docente_id: null, grado_id: null },
      }
    }));
  };

  /* ══ HORARIO GRADO ══ */
  const cargarHorarioGrado = async () => {
    if (!hGradoId) return;
    setHGradoLoading(true);
    setHGradoCargado(false);
    try {
      const data = await obtenerHorarioEstudiante(+hGradoId, hGradoAnio);
      const grid = initGrid(bloques);
      data.forEach(row => {
        if (grid[row.bloque_id] && row.dia_semana) {
          grid[row.bloque_id][row.dia_semana] = {
            asignatura_id: row.asignatura_id ? +row.asignatura_id : null,
            docente_id:    row.docente_id    ? +row.docente_id    : null,
            grado_id:      null,
          };
        }
      });
      setHGradoCells(grid);
      setHGradoCargado(true);
    } catch { showToast('Error al cargar horario del grado', 'error'); }
    finally { setHGradoLoading(false); }
  };

  const saveHorarioGrado = async () => {
    if (!hGradoId) { showToast('Selecciona un grado', 'error'); return; }
    setHGradoGuardando(true);
    try {
      const bloquesList = [];
      bloques.forEach(b => {
        DIAS.forEach(dia => {
          const cell = hGradoCells[b.id]?.[dia] || {};
          bloquesList.push({
            bloque_id:     b.id,
            dia_semana:    dia,
            asignatura_id: cell.asignatura_id || null,
            docente_id:    cell.docente_id    || null,
            es_receso:     b.es_receso ? 1 : 0,
          });
        });
      });
      await guardarHorarioEstudiante(+hGradoId, hGradoAnio, bloquesList);
      showToast('Horario guardado correctamente');
    } catch { showToast('Error al guardar horario', 'error'); }
    finally { setHGradoGuardando(false); }
  };

  /* ══ HORARIO DOCENTE ══ */
  const cargarHorarioDocente = async () => {
    if (!hDocId) return;
    setHDocLoading(true);
    setHDocCargado(false);
    try {
      const data = await obtenerHorarioDocente(+hDocId, hDocAnio);
      const grid = initGrid(bloques);
      data.forEach(row => {
        if (grid[row.bloque_id] && row.dia_semana) {
          grid[row.bloque_id][row.dia_semana] = {
            asignatura_id: row.asignatura_id ? +row.asignatura_id : null,
            grado_id:      row.grado_id      ? +row.grado_id      : null,
            docente_id:    null,
          };
        }
      });
      setHDocCells(grid);
      setHDocCargado(true);
    } catch { showToast('Error al cargar horario del docente', 'error'); }
    finally { setHDocLoading(false); }
  };

  const saveHorarioDocente = async () => {
    if (!hDocId) { showToast('Selecciona un docente', 'error'); return; }
    setHDocGuardando(true);
    try {
      const bloquesList = [];
      bloques.forEach(b => {
        DIAS.forEach(dia => {
          const cell = hDocCells[b.id]?.[dia] || {};
          bloquesList.push({
            bloque_id:     b.id,
            dia_semana:    dia,
            asignatura_id: cell.asignatura_id || null,
            grado_id:      cell.grado_id      || null,
            es_receso:     b.es_receso ? 1 : 0,
          });
        });
      });
      await apiGuardarHorarioDocente(+hDocId, hDocAnio, bloquesList);
      showToast('Horario del docente guardado correctamente');
    } catch { showToast('Error al guardar horario', 'error'); }
    finally { setHDocGuardando(false); }
  };

  /* ══ GRADOS CRUD ══ */
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

  /* ══ BLOQUES CRUD ══ */
  const abrirBloque = (b = null) => {
    if (b) {
      const partes = b.hora ? b.hora.split(' - ') : ['', ''];
      setFBloque({ ...b, horaInicio: partes[0] ?? '', horaFin: partes[1] ?? '' });
    } else {
      setFBloque({ id: null, horaInicio: '', horaFin: '', es_receso: false, orden: bloques.length + 1 });
    }
    setShowBloque(true);
  };

  const submitBloque = async (e) => {
    e.preventDefault();
    if (!fBloque.horaInicio || !fBloque.horaFin) {
      showToast('Selecciona hora de inicio y fin', 'error'); return;
    }
    const payload = { ...fBloque, hora: `${fBloque.horaInicio} - ${fBloque.horaFin}` };
    setGuardando(true);
    try {
      if (fBloque.id) {
        await actualizarBloque(fBloque.id, payload);
        showToast('Bloque actualizado');
      } else {
        await crearBloque(payload);
        showToast('Bloque creado');
      }
      setShowBloque(false);
      await cargar();
    } catch { showToast('Error al guardar', 'error'); }
    finally { setGuardando(false); }
  };

  /* ══ ASIGNATURAS CRUD ══ */
  const abrirAsignatura = (a = null) => {
    setFAsignatura(a
      ? { ...a }
      : { id: null, nombre: '', codigo: '', area_curricular: '', color: '#4A90D9' }
    );
    setShowAsignatura(true);
  };

  const submitAsignatura = async (e) => {
    e.preventDefault();
    if (!fAsignatura.nombre.trim()) { showToast('El nombre es obligatorio', 'error'); return; }
    setGuardando(true);
    try {
      if (fAsignatura.id) {
        await actualizarAsignatura(fAsignatura.id, fAsignatura);
        showToast('Asignatura actualizada');
      } else {
        await crearAsignatura(fAsignatura);
        showToast('Asignatura creada');
      }
      setShowAsignatura(false);
      await cargar();
    } catch { showToast('Error al guardar', 'error'); }
    finally { setGuardando(false); }
  };

  /* ══ ELIMINAR ══ */
  const confirmarEliminar = async () => {
    if (!confirmEl) return;
    try {
      if (confirmEl.tipo === 'grado')      await eliminarGrado(confirmEl.id);
      if (confirmEl.tipo === 'bloque')     await eliminarBloque(confirmEl.id);
      if (confirmEl.tipo === 'asignatura') await eliminarAsignatura(confirmEl.id);
      showToast('Eliminado correctamente');
      setConfirmEl(null);
      await cargar();
    } catch {
      showToast('Error al eliminar', 'error');
      setConfirmEl(null);
    }
  };

  /* ── Celda actual (para el modal) ── */
  const getCeldaActual = () => {
    if (!celda) return {};
    const cells = celda.tipo === 'grado' ? hGradoCells : hDocCells;
    return cells[celda.bloque_id]?.[celda.dia] || {};
  };

  /* ══ RENDER GRILLA ══ */
  const thSt = {
    padding: '10px 10px', textAlign: 'center', background: 'var(--surface-2)',
    fontWeight: 700, borderBottom: '1px solid var(--border)', fontSize: 12,
  };
  const tdSt = {
    padding: '5px 6px', verticalAlign: 'top', minWidth: 110,
    borderBottom: '1px solid var(--border)', cursor: 'pointer',
  };
  const tdHoraSt = {
    padding: '8px 12px', fontWeight: 600, fontSize: 12,
    color: 'var(--text-secondary)', whiteSpace: 'nowrap',
    borderBottom: '1px solid var(--border)', background: 'var(--surface-2)',
  };

  const renderGrilla = (tipo, cells) => {
    if (bloques.length === 0) {
      return (
        <div className="empty-state">
          <i className="fas fa-clock" />
          <p>No hay bloques horarios. Ve a la pestaña <strong>Bloques</strong> para agregarlos.</p>
        </div>
      );
    }
    return (
      <div className="table-card" style={{ padding: 0 }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                <th style={{ ...thSt, textAlign: 'left', width: 130 }}>Hora</th>
                {DIAS.map(d => <th key={d} style={thSt}>{DIAS_LABEL[d]}</th>)}
              </tr>
            </thead>
            <tbody>
              {bloques.map(bloque => (
                <tr key={bloque.id}>
                  <td style={tdHoraSt}>
                    {bloque.hora}
                    {bloque.es_receso && (
                      <span className="badge badge-warning" style={{ marginLeft: 6, fontSize: 9 }}>Receso</span>
                    )}
                  </td>
                  {DIAS.map(dia => {
                    if (bloque.es_receso) {
                      return (
                        <td key={dia} style={{ ...tdSt, background: '#f8fafc', textAlign: 'center', color: '#94a3b8', fontSize: 11, fontStyle: 'italic', cursor: 'default' }}>
                          recreo
                        </td>
                      );
                    }
                    const cell = cells[bloque.id]?.[dia] || {};
                    const asig = asignaturas.find(a => a.id === cell.asignatura_id);
                    const extra = tipo === 'grado'
                      ? docentes.find(d => d.id === cell.docente_id)
                      : grados.find(g => g.id === cell.grado_id);
                    return (
                      <td key={dia} style={tdSt}
                        onClick={() => setCelda({ tipo, bloque_id: bloque.id, dia })}
                        title="Clic para asignar">
                        {asig ? (
                          <div style={{
                            background: (asig.color || '#6B7280') + '22',
                            border: `1px solid ${asig.color || '#6B7280'}44`,
                            borderRadius: 6, padding: '5px 7px', minHeight: 44,
                          }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: asig.color || '#374151', lineHeight: 1.3 }}>
                              {asig.nombre}
                            </div>
                            {extra && (
                              <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>
                                <i className={`fas ${tipo === 'grado' ? 'fa-user' : 'fa-users'}`} style={{ marginRight: 3, fontSize: 9 }} />
                                {tipo === 'grado'
                                  ? (extra.nombre_corto || extra.nombre_completo)
                                  : extra.nombre}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            height: 44, color: '#e2e8f0', borderRadius: 6, border: '1.5px dashed #e2e8f0',
                          }}>
                            <i className="fas fa-plus" style={{ fontSize: 14 }} />
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="page-section">

      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="section-title">Panel de Horarios</h1>
          <p className="section-subtitle">Gestión de grados, bloques y asignación de horarios</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row" style={{ marginBottom: 20 }}>
        {[
          { label: 'Grados',      value: grados.length,      icon: 'fa-graduation-cap',  color: '#38bdf8' },
          { label: 'Docentes',    value: docentes.length,    icon: 'fa-chalkboard-user', color: '#06b6d4' },
          { label: 'Bloques',     value: bloques.length,     icon: 'fa-clock',           color: '#818cf8' },
          { label: 'Asignaturas', value: asignaturas.length, icon: 'fa-book',            color: '#f59e0b' },
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
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '8px 14px', fontSize: 13, fontWeight: 600,
              color: tab === t.key ? 'var(--accent)' : 'var(--text-secondary)',
              borderBottom: tab === t.key ? '2px solid var(--accent)' : '2px solid transparent',
              display: 'flex', alignItems: 'center', gap: 6,
              transition: 'color .2s', whiteSpace: 'nowrap',
            }}>
            <i className={`fas ${t.icon}`} />{t.label}
          </button>
        ))}
      </div>

      {/* Contenido */}
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
                    <i className="fas fa-graduation-cap" /><p>No hay grados registrados</p>
                  </div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Nombre</th><th>Nivel</th>
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
                              color:      g.nivel === 'Secundaria' ? '#38bdf8' : g.nivel === 'Primaria' ? '#4ade80' : '#fbbf24',
                              border:     g.nivel === 'Secundaria' ? '1px solid rgba(56,189,248,.3)' : g.nivel === 'Primaria' ? '1px solid rgba(74,222,128,.3)' : '1px solid rgba(251,191,36,.3)',
                            }}>{g.nivel}</span>
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
                    <i className="fas fa-clock" /><p>No hay bloques horarios registrados</p>
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

          {/* ── ASIGNATURAS ── */}
          {tab === 'asignaturas' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                <button className="btn btn-primary" onClick={() => abrirAsignatura()}>
                  <i className="fas fa-plus" /> Nueva Asignatura
                </button>
              </div>
              <div className="table-card">
                {asignaturas.length === 0 ? (
                  <div className="empty-state">
                    <i className="fas fa-book" /><p>No hay asignaturas registradas</p>
                  </div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Código</th>
                        <th>Área Curricular</th>
                        <th style={{ textAlign: 'center' }}>Color</th>
                        <th style={{ textAlign: 'right' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {asignaturas.map(a => (
                        <tr key={a.id}>
                          <td style={{ fontWeight: 600 }}>
                            <span style={{
                              display: 'inline-block', width: 10, height: 10,
                              borderRadius: '50%', background: a.color || '#6B7280',
                              marginRight: 8, verticalAlign: 'middle',
                            }} />
                            {a.nombre}
                          </td>
                          <td style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: 12 }}>
                            {a.codigo || '—'}
                          </td>
                          <td style={{ color: 'var(--text-secondary)' }}>{a.area_curricular || '—'}</td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{
                              display: 'inline-block', padding: '2px 10px', borderRadius: 20,
                              background: (a.color || '#6B7280') + '22',
                              border: `1px solid ${a.color || '#6B7280'}66`,
                              color: a.color || '#6B7280', fontSize: 11, fontWeight: 700,
                            }}>{a.color || '#6B7280'}</span>
                          </td>
                          <td>
                            <div className="actions-cell">
                              <button className="btn btn-ghost btn-sm btn-icon" onClick={() => abrirAsignatura(a)}>
                                <i className="fas fa-pencil" />
                              </button>
                              <button className="btn btn-danger btn-sm btn-icon"
                                onClick={() => setConfirmEl({ tipo: 'asignatura', id: a.id, nombre: a.nombre })}>
                                <i className="fas fa-trash" />
                              </button>
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

          {/* ── DOCENTES (vista) ── */}
          {tab === 'docentes' && (
            <div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                <i className="fas fa-info-circle" style={{ marginRight: 6 }} />
                Para agregar o editar docentes ve a <strong>Académico → Docentes</strong>.
              </p>
              <div className="table-card">
                {docentes.length === 0 ? (
                  <div className="empty-state">
                    <i className="fas fa-chalkboard-user" /><p>No hay docentes registrados</p>
                  </div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Nombre Completo</th><th>Abreviatura</th><th>Especialidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {docentes.map(d => (
                        <tr key={d.id}>
                          <td style={{ fontWeight: 600 }}>{d.nombre_completo}</td>
                          <td>{d.nombre_corto && <span className="badge badge-editor">{d.nombre_corto}</span>}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>{d.especialidad || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ── HORARIO POR GRADO ── */}
          {tab === 'horario-grado' && (
            <div>
              {/* Selector */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: 20, flexWrap: 'wrap', background: 'var(--surface-2)', padding: '14px 16px', borderRadius: 10, border: '1px solid var(--border)' }}>
                <div className="form-group" style={{ marginBottom: 0, minWidth: 160 }}>
                  <label className="form-label">Grado</label>
                  <select className="form-input" value={hGradoId}
                    onChange={e => { setHGradoId(e.target.value); setHGradoCargado(false); }}>
                    <option value="">Seleccionar grado...</option>
                    {grados.map(g => <option key={g.id} value={g.id}>{g.nombre} — {g.nivel}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Año vigente</label>
                  <input type="number" className="form-input" style={{ width: 100 }}
                    value={hGradoAnio} min={2020} max={2035}
                    onChange={e => { setHGradoAnio(+e.target.value); setHGradoCargado(false); }} />
                </div>
                <button className="btn btn-ghost" onClick={cargarHorarioGrado}
                  disabled={!hGradoId || hGradoLoading}>
                  <i className={`fas ${hGradoLoading ? 'fa-spinner fa-spin' : 'fa-rotate'}`} /> Cargar
                </button>
                <button className="btn btn-primary" style={{ marginLeft: 'auto' }}
                  onClick={saveHorarioGrado}
                  disabled={!hGradoId || !hGradoCargado || hGradoGuardando}>
                  <i className={`fas ${hGradoGuardando ? 'fa-spinner fa-spin' : 'fa-floppy-disk'}`} />
                  {hGradoGuardando ? ' Guardando…' : ' Guardar Horario'}
                </button>
              </div>

              {!hGradoId ? (
                <div className="empty-state">
                  <i className="fas fa-table" />
                  <p>Selecciona un grado y haz clic en <strong>Cargar</strong> para ver o editar su horario</p>
                </div>
              ) : hGradoLoading ? (
                <div className="loading-state"><div className="loading-spinner" /><p>Cargando horario...</p></div>
              ) : hGradoCargado ? (
                renderGrilla('grado', hGradoCells)
              ) : (
                <div className="empty-state">
                  <i className="fas fa-rotate" />
                  <p>Haz clic en <strong>Cargar</strong> para ver el horario</p>
                </div>
              )}
            </div>
          )}

          {/* ── HORARIO POR DOCENTE ── */}
          {tab === 'horario-docente' && (
            <div>
              {/* Selector */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: 20, flexWrap: 'wrap', background: 'var(--surface-2)', padding: '14px 16px', borderRadius: 10, border: '1px solid var(--border)' }}>
                <div className="form-group" style={{ marginBottom: 0, minWidth: 220 }}>
                  <label className="form-label">Docente</label>
                  <select className="form-input" value={hDocId}
                    onChange={e => { setHDocId(e.target.value); setHDocCargado(false); }}>
                    <option value="">Seleccionar docente...</option>
                    {docentes.map(d => <option key={d.id} value={d.id}>{d.nombre_completo}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Año vigente</label>
                  <input type="number" className="form-input" style={{ width: 100 }}
                    value={hDocAnio} min={2020} max={2035}
                    onChange={e => { setHDocAnio(+e.target.value); setHDocCargado(false); }} />
                </div>
                <button className="btn btn-ghost" onClick={cargarHorarioDocente}
                  disabled={!hDocId || hDocLoading}>
                  <i className={`fas ${hDocLoading ? 'fa-spinner fa-spin' : 'fa-rotate'}`} /> Cargar
                </button>
                <button className="btn btn-primary" style={{ marginLeft: 'auto' }}
                  onClick={saveHorarioDocente}
                  disabled={!hDocId || !hDocCargado || hDocGuardando}>
                  <i className={`fas ${hDocGuardando ? 'fa-spinner fa-spin' : 'fa-floppy-disk'}`} />
                  {hDocGuardando ? ' Guardando…' : ' Guardar Horario'}
                </button>
              </div>

              {!hDocId ? (
                <div className="empty-state">
                  <i className="fas fa-user-clock" />
                  <p>Selecciona un docente y haz clic en <strong>Cargar</strong> para ver o editar su horario</p>
                </div>
              ) : hDocLoading ? (
                <div className="loading-state"><div className="loading-spinner" /><p>Cargando horario...</p></div>
              ) : hDocCargado ? (
                renderGrilla('docente', hDocCells)
              ) : (
                <div className="empty-state">
                  <i className="fas fa-rotate" />
                  <p>Haz clic en <strong>Cargar</strong> para ver el horario</p>
                </div>
              )}
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
                    <label className="form-label">Hora inicio *</label>
                    <input type="time" className="form-input" required
                      value={fBloque.horaInicio}
                      onChange={e => setFBloque(p => ({ ...p, horaInicio: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Hora fin *</label>
                    <input type="time" className="form-input" required
                      value={fBloque.horaFin}
                      onChange={e => setFBloque(p => ({ ...p, horaFin: e.target.value }))} />
                  </div>
                </div>
                {fBloque.horaInicio && fBloque.horaFin && (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: -8, marginBottom: 12 }}>
                    <i className="fas fa-clock" style={{ marginRight: 5 }} />
                    Bloque: <strong style={{ color: 'var(--text-primary)' }}>{fBloque.horaInicio} - {fBloque.horaFin}</strong>
                  </p>
                )}
                <div className="form-group">
                  <label className="form-label">Orden</label>
                  <input type="number" min={1} className="form-input" value={fBloque.orden}
                    onChange={e => setFBloque(p => ({ ...p, orden: +e.target.value }))} />
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

      {/* ── Modal Asignatura ── */}
      {showAsignatura && (
        <div className="modal-overlay">
          <div className="modal" style={{ width: 460 }}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-book" style={{ color: 'var(--accent)' }} />{' '}
                {fAsignatura.id ? 'Editar Asignatura' : 'Nueva Asignatura'}
              </h3>
              <button className="modal-close" onClick={() => setShowAsignatura(false)}>
                <i className="fas fa-xmark" />
              </button>
            </div>
            <form onSubmit={submitAsignatura}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nombre *</label>
                  <input className="form-input" placeholder="Ej: Matemáticas" required
                    value={fAsignatura.nombre}
                    onChange={e => setFAsignatura(p => ({ ...p, nombre: e.target.value }))} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Código</label>
                    <input className="form-input" placeholder="Ej: MAT" style={{ fontFamily: 'monospace' }}
                      value={fAsignatura.codigo}
                      onChange={e => setFAsignatura(p => ({ ...p, codigo: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Color</label>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input type="color" value={fAsignatura.color}
                        onChange={e => setFAsignatura(p => ({ ...p, color: e.target.value }))}
                        style={{ width: 40, height: 36, padding: 2, border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', background: 'var(--surface)' }} />
                      <input className="form-input" value={fAsignatura.color}
                        onChange={e => setFAsignatura(p => ({ ...p, color: e.target.value }))}
                        style={{ fontFamily: 'monospace', flex: 1 }} />
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Área Curricular</label>
                  <input className="form-input" placeholder="Ej: Matemática, Comunicación, Ciencias..."
                    value={fAsignatura.area_curricular}
                    onChange={e => setFAsignatura(p => ({ ...p, area_curricular: e.target.value }))} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowAsignatura(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={guardando}>
                  {guardando ? <><i className="fas fa-spinner fa-spin" /> Guardando…</> : <><i className="fas fa-save" /> Guardar</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Celda (asignar curso/docente/grado) ── */}
      {celda && (
        <div className="modal-overlay" onClick={() => setCelda(null)}>
          <div className="modal" style={{ width: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-calendar-pen" style={{ color: 'var(--accent)' }} />{' '}
                {DIAS_LABEL[celda.dia]} — {bloques.find(b => b.id === celda.bloque_id)?.hora}
              </h3>
              <button className="modal-close" onClick={() => setCelda(null)}><i className="fas fa-xmark" /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Asignatura / Curso</label>
                <select className="form-input"
                  value={getCeldaActual().asignatura_id || ''}
                  onChange={e => updateCelda('asignatura_id', e.target.value)}>
                  <option value="">— Sin asignatura —</option>
                  {asignaturas.map(a => (
                    <option key={a.id} value={a.id}>{a.nombre}</option>
                  ))}
                </select>
              </div>
              {celda.tipo === 'grado' ? (
                <div className="form-group">
                  <label className="form-label">Docente responsable</label>
                  <select className="form-input"
                    value={getCeldaActual().docente_id || ''}
                    onChange={e => updateCelda('docente_id', e.target.value)}>
                    <option value="">— Sin docente —</option>
                    {docentes.map(d => (
                      <option key={d.id} value={d.id}>{d.nombre_completo}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">Grado que atiende</label>
                  <select className="form-input"
                    value={getCeldaActual().grado_id || ''}
                    onChange={e => updateCelda('grado_id', e.target.value)}>
                    <option value="">— Sin grado —</option>
                    {grados.map(g => (
                      <option key={g.id} value={g.id}>{g.nombre} — {g.nivel}</option>
                    ))}
                  </select>
                </div>
              )}
              <div style={{ textAlign: 'right', marginTop: 4 }}>
                <button className="btn btn-ghost btn-sm" onClick={clearCelda}>
                  <i className="fas fa-eraser" /> Limpiar celda
                </button>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setCelda(null)}>
                <i className="fas fa-check" /> Listo
              </button>
            </div>
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
