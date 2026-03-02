import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth';

/**
 * useAutoLogout
 * Cierra la sesión automáticamente si el usuario no tiene actividad
 * durante el tiempo especificado en TIMEOUT_MS.
 *
 * Eventos que reinician el contador:
 *   mousemove, mousedown, keydown, scroll, touchstart, click, wheel
 *
 * 2 minutos antes de cerrar sesión muestra una advertencia visual.
 */

const TIMEOUT_MS  = 15 * 60 * 1000;   // 15 minutos de inactividad → logout
const WARNING_MS  =  2 * 60 * 1000;   // Advertencia 2 min antes
const EVENTS      = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click', 'wheel'];

// ── Singleton del banner de advertencia (fuera de React) ──────────────────
let warningEl = null;

const showWarning = (secondsLeft, onExtend) => {
  removeWarning();
  warningEl = document.createElement('div');
  warningEl.id = 'auto-logout-warning';

  // Container principal
  const containerDiv = document.createElement('div');
  containerDiv.style.cssText = 'position:fixed; bottom:24px; left:50%; transform:translateX(-50%); background:#1c2333; border:1px solid rgba(248,81,73,.5); border-radius:12px; padding:16px 20px; display:flex; align-items:center; gap:14px; box-shadow:0 8px 32px rgba(0,0,0,.5); z-index:9999; font-family:"Sora",sans-serif; animation: slideUp .3s cubic-bezier(.4,0,.2,1); min-width:340px;';

  // Icono
  const iconDiv = document.createElement('div');
  iconDiv.style.cssText = 'width:40px; height:40px; border-radius:50%; background:rgba(248,81,73,.15); border:1px solid rgba(248,81,73,.3); display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:18px; color:#f85149;';
  iconDiv.textContent = '⏱';

  // Contenedor de texto
  const textDiv = document.createElement('div');
  textDiv.style.cssText = 'flex:1;';

  const titleDiv = document.createElement('div');
  titleDiv.style.cssText = 'font-size:13px; font-weight:700; color:#e6edf3; margin-bottom:2px;';
  titleDiv.textContent = 'Sesión por expirar';

  const countdownDiv = document.createElement('div');
  countdownDiv.id = 'auto-logout-countdown';
  countdownDiv.style.cssText = 'font-size:12px; color:#adbac7;';

  const countdownText = document.createElement('span');
  countdownText.textContent = 'Tu sesión cerrará en ';

  const strongCountdown = document.createElement('strong');
  strongCountdown.id = 'auto-logout-seconds';
  strongCountdown.style.color = '#f85149';
  strongCountdown.textContent = secondsLeft + 's';

  const endText = document.createElement('span');
  endText.textContent = ' por inactividad';

  countdownDiv.appendChild(countdownText);
  countdownDiv.appendChild(strongCountdown);
  countdownDiv.appendChild(endText);

  textDiv.appendChild(titleDiv);
  textDiv.appendChild(countdownDiv);

  // Botón
  const button = document.createElement('button');
  button.id = 'auto-logout-extend';
  button.style.cssText = 'background:#2f81f7; color:#fff; border:none; border-radius:8px; padding:8px 14px; font-size:12px; font-weight:700; cursor:pointer; font-family:"Sora",sans-serif; white-space:nowrap;';
  button.textContent = 'Continuar';
  button.addEventListener('click', () => {
    removeWarning();
    onExtend();
  });

  containerDiv.appendChild(iconDiv);
  containerDiv.appendChild(textDiv);
  containerDiv.appendChild(button);
  warningEl.appendChild(containerDiv);

  // Agregar estilos de animación
  const style = document.createElement('style');
  style.textContent = '@keyframes slideUp { from { opacity:0; transform:translateX(-50%) translateY(20px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }';
  document.head.appendChild(style);

  document.body.appendChild(warningEl);
};

const updateCountdown = (secondsLeft) => {
  const secondsEl = document.getElementById('auto-logout-seconds');
  if (secondsEl) {
    secondsEl.textContent = secondsLeft + 's';
  }
};

const removeWarning = () => {
  if (warningEl) { warningEl.remove(); warningEl = null; }
};

// ─────────────────────────────────────────────────────────────────────────────

export default function useAutoLogout() {
  const navigate       = useNavigate();
  const timerRef       = useRef(null);   // logout timer
  const warnTimerRef   = useRef(null);   // warning timer
  const countdownRef   = useRef(null);   // countdown interval
  const lastActivityRef = useRef(Date.now());

  const doLogout = useCallback(() => {
    removeWarning();
    clearTimeout(timerRef.current);
    clearTimeout(warnTimerRef.current);
    clearInterval(countdownRef.current);
    authService.logout();
    navigate('/login', { replace: true, state: { reason: 'inactividad' } });
  }, [navigate]);

  const startCountdown = useCallback((seconds) => {
    let s = seconds;
    showWarning(s, resetTimers);
    countdownRef.current = setInterval(() => {
      s--;
      if (s <= 0) {
        clearInterval(countdownRef.current);
      } else {
        updateCountdown(s);
      }
    }, 1000);
  }, []); // eslint-disable-line

  const resetTimers = useCallback(() => {
    removeWarning();
    clearTimeout(timerRef.current);
    clearTimeout(warnTimerRef.current);
    clearInterval(countdownRef.current);
    lastActivityRef.current = Date.now();

    // Advertencia WARNING_MS antes del logout
    warnTimerRef.current = setTimeout(() => {
      startCountdown(Math.round(WARNING_MS / 1000));
    }, TIMEOUT_MS - WARNING_MS);

    // Logout definitivo
    timerRef.current = setTimeout(doLogout, TIMEOUT_MS);
  }, [doLogout, startCountdown]);

  useEffect(() => {
    const onActivity = () => {
      // Solo resetear si NO está mostrando la advertencia
      if (!warningEl) resetTimers();
    };

    EVENTS.forEach(ev => window.addEventListener(ev, onActivity, { passive: true }));
    resetTimers(); // iniciar al montar

    return () => {
      EVENTS.forEach(ev => window.removeEventListener(ev, onActivity));
      clearTimeout(timerRef.current);
      clearTimeout(warnTimerRef.current);
      clearInterval(countdownRef.current);
      removeWarning();
    };
  }, [resetTimers]);

  // Exponer tiempo restante (opcional para mostrar en UI)
  const getRemainingMs = () => {
    return Math.max(0, TIMEOUT_MS - (Date.now() - lastActivityRef.current));
  };

  return { resetTimers, getRemainingMs };
}