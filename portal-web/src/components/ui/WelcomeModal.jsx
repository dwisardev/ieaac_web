import { useEffect, useRef, useState } from "react";
import "../../assets/css/pages/WelcomeModal.css";

const DURATION = 15; // seconds

/* ── Fireworks canvas engine ── */
function useFireworks(canvasRef, active) {
  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let raf;
    let particles = [];

    function resize() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    class Particle {
      constructor(x, y, color) {
        this.x  = x;
        this.y  = y;
        this.vx = (Math.random() - 0.5) * 8;
        this.vy = (Math.random() - 0.5) * 8 - 2;
        this.alpha = 1;
        this.color = color;
        this.radius = Math.random() * 3 + 1.5;
        this.decay = Math.random() * 0.018 + 0.012;
        this.gravity = 0.12;
      }
      update() {
        this.vy  += this.gravity;
        this.x   += this.vx;
        this.y   += this.vy;
        this.alpha -= this.decay;
        this.vx  *= 0.98;
      }
      draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.fillStyle   = this.color;
        ctx.shadowBlur  = 8;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    const COLORS = [
      "#ffd700", "#ff6347", "#00e5ff", "#c8952a",
      "#7fff00", "#ff69b4", "#ffffff", "#1a9fff",
    ];

    function burst() {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height * 0.65;
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      for (let i = 0; i < 60; i++) {
        particles.push(new Particle(x, y, color));
      }
    }

    let burstInterval = setInterval(burst, 800);
    burst(); // immediate first burst

    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles = particles.filter(p => p.alpha > 0);
      particles.forEach(p => { p.update(); p.draw(); });
      raf = requestAnimationFrame(loop);
    }
    loop();

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(burstInterval);
      window.removeEventListener("resize", resize);
    };
  }, [active, canvasRef]);
}

/* ── Web Speech API ── */
const WELCOME_TEXT =
  "¡Bienvenidos a la Institución Educativa Andrés Avelino Cáceres, " +
  "Sirenachayocc, Kimbiri, Cusco! Educando con disciplina, estudio y deporte.";

function buildUtterance() {
  const msg = new SpeechSynthesisUtterance(WELCOME_TEXT);
  msg.lang  = "es-PE";
  msg.rate  = 0.92;
  msg.pitch = 1.05;
  const voices = window.speechSynthesis.getVoices();
  const esVoice = voices.find(v => v.lang.startsWith("es"));
  if (esVoice) msg.voice = esVoice;
  return msg;
}

function speak() {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(buildUtterance());
}

/* ── Component ── */
export default function WelcomeModal() {
  const [visible,   setVisible]   = useState(false);
  const [countdown, setCountdown] = useState(DURATION);
  const [closing,   setClosing]   = useState(false);
  const [speaking,  setSpeaking]  = useState(false);
  const [voiceBlocked, setVoiceBlocked] = useState(false);
  const canvasRef = useRef(null);

  // Show once per session
  useEffect(() => {
    if (sessionStorage.getItem("welcome_shown")) return;
    sessionStorage.setItem("welcome_shown", "1");
    setVisible(true);
  }, []);

  // Try auto-speak once voices are ready; flag if browser blocks it
  useEffect(() => {
    if (!visible || !window.speechSynthesis) return;

    function trySpeak() {
      const msg = buildUtterance();
      msg.onstart = () => { setSpeaking(true); setVoiceBlocked(false); };
      msg.onend   = () => setSpeaking(false);
      msg.onerror = () => { setSpeaking(false); setVoiceBlocked(true); };
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(msg);
      // If still pending after 400ms, browser likely blocked it
      setTimeout(() => {
        if (!window.speechSynthesis.speaking) setVoiceBlocked(true);
      }, 400);
    }

    if (window.speechSynthesis.getVoices().length > 0) {
      trySpeak();
    } else {
      window.speechSynthesis.onvoiceschanged = trySpeak;
    }
    return () => { window.speechSynthesis.cancel(); setSpeaking(false); };
  }, [visible]);

  function handleSpeak() {
    if (!window.speechSynthesis) return;
    const msg = buildUtterance();
    msg.onstart = () => { setSpeaking(true); setVoiceBlocked(false); };
    msg.onend   = () => setSpeaking(false);
    msg.onerror = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(msg);
  }

  // Countdown + auto-close
  useEffect(() => {
    if (!visible) return;
    const tick = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { close(); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [visible]);

  useFireworks(canvasRef, visible);

  function close() {
    window.speechSynthesis.cancel();
    setClosing(true);
    setTimeout(() => setVisible(false), 450);
  }

  if (!visible) return null;

  const progress = ((DURATION - countdown) / DURATION) * 100;

  return (
    <div className={`wm-overlay ${closing ? "wm-overlay--out" : ""}`}>
      <canvas ref={canvasRef} className="wm-canvas" />

      <div className={`wm-card ${closing ? "wm-card--out" : ""}`}>
        {/* Close button */}
        <button className="wm-close" onClick={close} aria-label="Cerrar">
          <i className="bi bi-x-lg" />
        </button>

        {/* Logo */}
        <div className="wm-logo-wrap">
          <img src="/img/logo.jpg" alt="Logo I.E. AACH" className="wm-logo" />
        </div>

        {/* Text */}
        <p className="wm-sub">¡Bienvenidos a la</p>
        <h1 className="wm-title">I.E. Andrés Avelino Cáceres</h1>
        <p className="wm-place">
          <i className="bi bi-geo-alt-fill" /> Sirenachayocc · Kimbiri · Cusco
        </p>
        <p className="wm-slogan">Educando con disciplina, estudio y deporte</p>

        {/* Audio button */}
        {window.speechSynthesis && (
          <button
            className={`wm-audio ${speaking ? "wm-audio--active" : ""}`}
            onClick={handleSpeak}
            title="Escuchar bienvenida"
          >
            <i className={`bi ${speaking ? "bi-volume-up-fill" : "bi-volume-up"}`} />
            {voiceBlocked && !speaking
              ? " Toca para escuchar"
              : speaking
              ? " Reproduciendo..."
              : " Escuchar"}
          </button>
        )}

        {/* Progress bar */}
        <div className="wm-progress-wrap">
          <div className="wm-progress-bar" style={{ width: `${progress}%` }} />
        </div>
        <p className="wm-timer">Se cerrará en {countdown}s</p>

        {/* Enter button */}
        <button className="wm-enter" onClick={close}>
          <i className="bi bi-door-open" /> Ingresar al portal
        </button>
      </div>
    </div>
  );
}
