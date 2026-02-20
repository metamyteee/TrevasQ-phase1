import { useState, useEffect, useRef } from "react";
import "./App.css";

const API = "http://127.0.0.1:8000";

function ParticleField() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    const pts = Array.from({ length: 70 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.4 + 0.4,
      a: Math.random() * 0.45 + 0.15,
    }));

    let raf: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      pts.forEach((p) => {
        p.x = (p.x + p.vx + canvas.width) % canvas.width;
        p.y = (p.y + p.vy + canvas.height) % canvas.height;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,179,237,${p.a})`;
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} className="particle-canvas" />;
}



function Spinner() {
  return <span className="spinner" />;
}


export default function App() {
  const [message, setMessage] = useState("");
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [secretKey, setSecretKey] = useState<string | null>(null);
  const [ciphertext, setCiphertext] = useState<string | null>(null);
  const [decrypted, setDecrypted] = useState("");
  const [loading, setLoading] = useState("");
  const [err, setErr] = useState("");

  const wrap =
    (fn: () => Promise<void>, key: string) => async () => {
      setLoading(key);
      setErr("");

      try {
        await fn();
      } catch (e: unknown) {
        if (e instanceof Error) {
          setErr(e.message);
        } else {
          setErr("Request failed");
        }
      }

      setLoading("");
    };

  const generateKeys = wrap(async () => {
    const r = await fetch(`${API}/keygen`, { method: "POST" });
    const d = await r.json();

    setPublicKey(d.public_key);
    setSecretKey(d.secret_key);
    setCiphertext(null);
    setDecrypted("");
  }, "keygen");

  const encrypt = wrap(async () => {
    if (!publicKey) throw new Error("Generate keys first!");
    if (!message.trim()) throw new Error("Enter a message!");

    const r = await fetch(`${API}/encrypt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ public_key: publicKey, message }),
    });

    const d = await r.json();
    setCiphertext(d.ciphertext);
    setDecrypted("");
  }, "encrypt");

  const decrypt = wrap(async () => {
    if (!secretKey || !ciphertext)
      throw new Error("Nothing to decrypt!");

    const r = await fetch(`${API}/decrypt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret_key: secretKey,
        ciphertext,
      }),
    });

    const d = await r.json();
    setDecrypted(d.plaintext);
  }, "decrypt");

  return (
    <div className="app">
      <ParticleField />

      <div className="container">
        <h1>🛡️ Post-Quantum LWE Encryption</h1>

        <button
          className="btn btn-blue"
          onClick={generateKeys}
          disabled={loading === "keygen"}
        >
          {loading === "keygen" ? (
            <>
              Generating <Spinner />
            </>
          ) : (
            "Generate Keys"
          )}
        </button>

        <textarea
          className="msg-input"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <button
          className="btn btn-green"
          onClick={encrypt}
          disabled={!publicKey || loading === "encrypt"}
        >
          {loading === "encrypt" ? (
            <>
              Encrypting <Spinner />
            </>
          ) : (
            "Encrypt"
          )}
        </button>

        {ciphertext && (
          <pre className="cipher-pre">
            {JSON.stringify(ciphertext, null, 2)}
          </pre>
        )}

        {ciphertext && (
          <button
            className="btn btn-purple"
            onClick={decrypt}
            disabled={loading === "decrypt"}
          >
            {loading === "decrypt" ? (
              <>
                Decrypting <Spinner />
              </>
            ) : (
              "Decrypt"
            )}
          </button>
        )}

        {decrypted && (
          <div className="result-box">
            <strong>Recovered:</strong> {decrypted}
          </div>
        )}

        {err && <div className="error-box">⚠️ {err}</div>}
      </div>
    </div>
  );
}
