import { useState, useEffect, useRef } from "react";
import "./App.css";

const API = "https://trevasq-phase1.onrender.com";
const CIPHER_TTL = 60; 

function Spin() { return <span className="spin" />; }

function RoomSvg({ color, variant }: { color: string; variant: number }) {
  const v = variant % 4;
  return (
    <svg className="room-svg" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
      <rect width="600" height="400" fill="currentColor" opacity="0.0" />
      
      <rect x="150" y="80" width="300" height="220" fill="none" stroke={color} strokeWidth="1.5" opacity="0.5" />
      
      <line x1="0" y1="400" x2="150" y2="300" stroke={color} strokeWidth="0.8" opacity="0.3" />
      <line x1="600" y1="400" x2="450" y2="300" stroke={color} strokeWidth="0.8" opacity="0.3" />
      <line x1="150" y1="300" x2="450" y2="300" stroke={color} strokeWidth="0.8" opacity="0.3" />
      
      <line x1="0" y1="0" x2="150" y2="80" stroke={color} strokeWidth="0.8" opacity="0.3" />
      <line x1="600" y1="0" x2="450" y2="80" stroke={color} strokeWidth="0.8" opacity="0.3" />
      
      {v === 0 && <>
        <rect x="230" y="160" width="140" height="140" fill="none" stroke={color} strokeWidth="1.5" opacity="0.7" />
        <rect x="248" y="178" width="104" height="104" fill={color} opacity="0.08" />
        <line x1="300" y1="160" x2="300" y2="300" stroke={color} strokeWidth="0.5" opacity="0.4" />
      </>}
      {v === 1 && <>
        <circle cx="300" cy="210" r="70" fill="none" stroke={color} strokeWidth="1.5" opacity="0.6" />
        <circle cx="300" cy="210" r="45" fill={color} opacity="0.06" />
        <circle cx="300" cy="210" r="5" fill={color} opacity="0.5" />
      </>}
      {v === 2 && <>
        <rect x="240" y="150" width="120" height="160" fill="none" stroke={color} strokeWidth="1.5" opacity="0.7" />
        <rect x="255" y="165" width="90" height="130" fill={color} opacity="0.07" />
        <line x1="300" y1="150" x2="300" y2="310" stroke={color} strokeWidth="0.5" opacity="0.5" />
        <line x1="240" y1="230" x2="360" y2="230" stroke={color} strokeWidth="0.5" opacity="0.5" />
      </>}
      {v === 3 && <>
        <polygon points="300,130 380,280 220,280" fill="none" stroke={color} strokeWidth="1.5" opacity="0.6" />
        <polygon points="300,160 360,270 240,270" fill={color} opacity="0.07" />
      </>}
      
      <line x1="0" y1="350" x2="600" y2="350" stroke={color} strokeWidth="0.5" opacity="0.2" />
      <line x1="0" y1="380" x2="600" y2="380" stroke={color} strokeWidth="0.5" opacity="0.12" />
      
      <ellipse cx="300" cy="85" rx="60" ry="10" fill={color} opacity="0.12" />
    </svg>
  );
}

function BgGrid() {
  const cells = [
    { cls: "bg-cell-1", color: "rgba(232,80,60,0.6)",   variant: 0 },
    { cls: "bg-cell-2", color: "rgba(120,210,80,0.45)",  variant: 1 },
    { cls: "bg-cell-3", color: "rgba(200,200,200,0.35)", variant: 2 },
    { cls: "bg-cell-4", color: "rgba(180,100,240,0.45)", variant: 3 },
  ];
  return (
    <div className="bg-grid">
      {cells.map((c) => (
        <div key={c.cls} className={`bg-cell ${c.cls}`}>
          <RoomSvg color={c.color} variant={c.variant} />
        </div>
      ))}
    </div>
  );
}

function formatTime(secs: number) {
  const s = Math.max(0, secs);
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

export default function App() {
  const [message, setMessage]       = useState("");
  const [publicKey, setPublicKey]   = useState<string | null>(null);
  const [secretKey, setSecretKey]   = useState<string | null>(null);
  const [ciphertext, setCiphertext] = useState<string | null>(null);
  const [decrypted, setDecrypted]   = useState("");
  const [loading, setLoading]       = useState("");
  const [err, setErr]               = useState("");

  // Timer state
  const [timeLeft, setTimeLeft]     = useState<number | null>(null);
  const [timerMax]                  = useState(CIPHER_TTL);
  const timerRef                    = useRef<ReturnType<typeof setInterval> | null>(null);
  const [cipherExpired, setCipherExpired] = useState(false);

  const startTimer = () => {
    setCipherExpired(false);
    setTimeLeft(CIPHER_TTL);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setCipherExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(null);
    setCipherExpired(false);
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const wrap = (fn: () => Promise<void>, key: string) => async () => {
    setLoading(key); setErr("");
    try { await fn(); }
    catch (e: unknown) { setErr(e instanceof Error ? e.message : "Request failed"); }
    setLoading("");
  };

  const generateKeys = wrap(async () => {
    const r = await fetch(`${API}/keygen`, { method: "POST" });
    const d = await r.json();
    setPublicKey(d.public_key);
    setSecretKey(d.secret_key);
    setCiphertext(null);
    setDecrypted("");
    stopTimer();
  }, "keygen");

  const encrypt = wrap(async () => {
    if (!publicKey)      throw new Error("Generate keys first");
    if (!message.trim()) throw new Error("Enter a message to encrypt");
    const r = await fetch(`${API}/encrypt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ public_key: publicKey, message }),
    });
    const d = await r.json();
    setCiphertext(d.ciphertext);
    setDecrypted("");
    setCipherExpired(false);
    startTimer();
  }, "encrypt");

  const decrypt = wrap(async () => {
    if (!secretKey || !ciphertext) throw new Error("No encrypted data found");
    if (cipherExpired) throw new Error("Cipher window expired — re-encrypt");
    const r = await fetch(`${API}/decrypt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret_key: secretKey, ciphertext }),
    });
    const d = await r.json();
    setDecrypted(d.plaintext);
    stopTimer();
  }, "decrypt");

  // Timer display logic
  const pct      = timeLeft !== null ? (timeLeft / timerMax) * 100 : 0;
  const isUrgent = timeLeft !== null && timeLeft <= 10 && timeLeft > 0;
  const isWarn   = timeLeft !== null && timeLeft <= 25 && timeLeft > 10;
  const isSafe   = timeLeft !== null && timeLeft > 25;
  const timerBarClass = isSafe ? "safe" : isWarn ? "warn" : "urgent";
  const timerNumClass = cipherExpired ? "expired" : isUrgent ? "urgent" : timeLeft !== null ? "" : "idle";
  const timerStatusText = cipherExpired
    ? "⚠ CIPHER EXPIRED"
    : isUrgent ? "⚡ DECRYPT IMMEDIATELY"
    : isWarn   ? "— WINDOW CLOSING"
    : timeLeft !== null ? "● CIPHER ACTIVE"
    : "— AWAITING CIPHER";
  const timerStatusClass = cipherExpired
    ? "expired-state"
    : isUrgent ? "urgent-state"
    : isWarn   ? "warn-state"
    : timeLeft !== null ? "active-state" : "";

  return (
    <>
      <BgGrid />
      <div className="bg-veil" />
      <div className="noise" />
      <div className="scanline" />

      <div className="shell">
        
        <header className="hdr">
          <div className="hdr-logo">LWE SHIELD</div>
          <nav className="hdr-nav">
            <button className="hdr-nav-item">Protocol</button>
            <button className="hdr-nav-item">Cipher</button>
            <button className="hdr-nav-item">Keys</button>
            <button className="hdr-nav-item">Docs</button>
          </nav>
          <div className="hdr-right">
            <div className="sys-badge">
              <div className="sys-dot" />
              System Online
            </div>
          </div>
        </header>

        
        <div className="main">

          
          <div className="left-col">
            <div className="hero">
              <div className="hero-eyebrow">Post-Quantum Encryption Protocol</div>
              <h1 className="hero-title">
                LWE <em>Quantum</em><br />Shield
              </h1>
              <p className="hero-sub">
                A lattice-based encryption system where ciphertexts have a finite decryption window — execute in time or the cipher breaks.
              </p>
              <div className="hero-line" />
            </div>

            <div className="steps-wrap">
              
              <div className={`step ${publicKey ? "done" : ""}`}>
                <div className="step-num">01</div>
                <div className="step-body">
                  <div className="step-cat">Initialize</div>
                  <div className="step-title">Generate Protocol Keys</div>
                  <div className="step-chips">
                    <span className="chip">LWE</span>
                    <span className="chip">Keygen</span>
                  </div>
                </div>
                <div className="step-cta">
                  <button className="btn btn-white" onClick={generateKeys} disabled={loading === "keygen"}>
                    {loading === "keygen" ? <><Spin /> Working</> : "Generate"}
                  </button>
                </div>
              </div>

              
              <div className={`step-ta ${message ? "done" : ""}`} style={{ position: "relative" }}>
                {message && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: "var(--red)", boxShadow: "0 0 8px var(--red-glow)" }} />}
                <div className="step-ta-inner">
                  <div className="step-num" style={{ minHeight: 58, paddingTop: 18 }}>02</div>
                  <div className="step-body" style={{ paddingBottom: 8 }}>
                    <div className="step-cat">Compose</div>
                    <div className="step-title" style={{ color: message ? "var(--red)" : undefined }}>Message Payload</div>
                  </div>
                </div>
                <div className="step-ta-field">
                  <textarea
                    className="msg-ta"
                    placeholder="Enter plaintext message…"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={2}
                  />
                </div>
              </div>

              
              <div className={`step ${ciphertext ? "done" : ""}`}>
                <div className="step-num">03</div>
                <div className="step-body">
                  <div className="step-cat">Execute</div>
                  <div className="step-title">Encrypt Payload</div>
                  <div className="step-chips">
                    <span className="chip">LWE Cipher</span>
                    <span className="chip">Public Key</span>
                  </div>
                </div>
                <div className="step-cta">
                  <button className="btn btn-white" onClick={encrypt} disabled={!publicKey || loading === "encrypt"}>
                    {loading === "encrypt" ? <><Spin /> Encrypting</> : "Encrypt"}
                  </button>
                </div>
              </div>

              
              <div className={`step ${decrypted ? "done" : ""}`}>
                <div className="step-num">04</div>
                <div className="step-body">
                  <div className="step-cat">Recover</div>
                  <div className="step-title">Decrypt Ciphertext</div>
                  <div className="step-chips">
                    <span className="chip">Secret Key</span>
                    <span className="chip">Time-Bound</span>
                  </div>
                </div>
                <div className="step-cta">
                  <button className="btn btn-red" onClick={decrypt}
                    disabled={!ciphertext || cipherExpired || loading === "decrypt"}>
                    {loading === "decrypt" ? <><Spin /> Decrypting</> : "Decrypt"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          
          <div className="rpanel">

            
            <div className="rsec">
              <div className="r-eyebrow">Key Integrity</div>
              <div className="r-title">Protocol State</div>
              <div className="krows">
                <div className={`krow ${publicKey ? "active" : ""}`}>
                  <span>Public Key</span>
                  <div className="k-dot" />
                </div>
                <div className={`krow ${secretKey ? "active" : ""}`}>
                  <span>Secret Key</span>
                  <div className="k-dot" />
                </div>
                <div className={`krow cipher ${ciphertext ? "active" : ""}`}>
                  <span>Ciphertext</span>
                  <div className="k-dot" />
                </div>
              </div>
            </div>

            
            <div className="rsec">
              <div className="r-eyebrow">Decryption Window</div>
              <div className="timer-block">
                <div className={`timer-display ${timerNumClass}`}>
                  {timeLeft !== null ? formatTime(timeLeft) : "--:--"}
                </div>
                <div className="timer-bar-wrap">
                  <div
                    className={`timer-bar ${timerBarClass}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="timer-meta">
                  <span>00:00</span>
                  <span>{formatTime(timerMax)}</span>
                </div>
                <div className={`timer-status ${timerStatusClass}`}>
                  {timerStatusText}
                </div>
              </div>
            </div>

            
            {ciphertext && (
              <div className="rsec">
                <div className="r-eyebrow">Encrypted Payload</div>
                {cipherExpired && (
                  <div className="expired-warning" style={{ marginBottom: 8 }}>
                    ⚠ Window expired — re-encrypt to decrypt
                  </div>
                )}
                <div className="cipher-block">{JSON.stringify(ciphertext)}</div>
              </div>
            )}

            
            {decrypted && (
              <div className="rsec">
                <div className="r-eyebrow">Recovered Plaintext</div>
                <div className="result-block">
                  <div className="result-text">{decrypted}</div>
                </div>
              </div>
            )}

            
            {err && (
              <div className="rsec">
                <div className="err-block">⚠ {err}</div>
              </div>
            )}

          </div>
        </div>

        <div className="foot">
          <span>LWE — Post-Quantum Encryption</span>
          <span className="foot-dot">◆</span>
          <span className="foot-red">Cipher Window: {CIPHER_TTL}s</span>
          <span className="foot-dot">◆</span>
          <span>Secured</span>
        </div>
      </div>
    </>
  );
}
