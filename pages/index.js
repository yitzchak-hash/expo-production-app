import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const ACCESS_CODE = '2141';
const SESSION_KEY = 'tzviair_auth';

export default function LoginPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (sessionStorage.getItem(SESSION_KEY) === 'true') {
        router.replace('/dashboard');
      } else {
        setChecking(false);
      }
    }
  }, [router]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code === ACCESS_CODE) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      router.push('/dashboard');
    } else {
      setError('Incorrect code. Please try again.');
      setCode('');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-navy-950 bg-slate-50">
        <div className="w-6 h-6 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>TzviAir — Expo Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: 'radial-gradient(ellipse at 30% 20%, #0d2255 0%, #04091a 65%)' }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #00b8d4, transparent)' }} />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full opacity-8"
            style={{ background: 'radial-gradient(circle, #f5a623, transparent)' }} />
        </div>

        <div className="relative w-full max-w-sm">
          <div className="rounded-3xl p-8 text-center"
            style={{
              background: 'rgba(12, 21, 48, 0.96)',
              border: '1px solid rgba(0, 184, 212, 0.2)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,184,212,0.05)',
            }}>
            <div className="mb-8">
              <LogoImage className="h-16 w-auto mx-auto" />
              <div className="text-xs text-slate-500 font-medium tracking-widest uppercase mt-3">
                Expo Production Dashboard
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">Enter Access Code</label>
                <input
                  type="password"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={8}
                  className="pin-input w-full bg-navy-900 border rounded-xl px-4 py-3 text-xl font-bold text-slate-100 focus:outline-none transition-colors"
                  style={{ borderColor: error ? '#f87171' : code ? 'rgba(0,184,212,0.6)' : 'rgba(30,48,96,1)' }}
                  placeholder="••••"
                  autoFocus
                />
              </div>
              {error && (
                <div className="text-sm text-red-400 bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">{error}</div>
              )}
              <button
                type="submit"
                disabled={!code}
                className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed text-white"
                style={{
                  background: code ? 'linear-gradient(135deg,#00b8d4,#0097a7)' : 'rgba(0,184,212,0.2)',
                  boxShadow: code ? '0 4px 20px rgba(0,184,212,0.3)' : 'none',
                }}
              >
                Enter Dashboard
              </button>
            </form>
            <p className="text-xs text-slate-600 mt-6">TzviAir Internal — Architects Expo 2025</p>
          </div>
        </div>
      </div>
    </>
  );
}

export function LogoImage({ className = '' }) {
  const [imgError, setImgError] = useState(false);
  if (!imgError) {
    return (
      <img
        src="/tzviair-logo.png"
        alt="TzviAir"
        className={className}
        onError={() => setImgError(true)}
      />
    );
  }
  // SVG fallback
  return (
    <svg className={className} viewBox="0 0 200 70" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 14 Q100 4 148 10" stroke="#f5a623" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M46 21 Q100 9 152 17" stroke="#1a4b8f" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M42 28 Q100 14 156 22" stroke="#00b8d4" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <text x="28" y="52" fontFamily="Arial" fontWeight="900" fontSize="28" fill="#1a3a8f" fontStyle="italic">Tzvi</text>
      <text x="104" y="52" fontFamily="Arial" fontWeight="700" fontSize="28" fill="#00b8d4" fontStyle="italic">Air</text>
      <path d="M28 58 Q100 67 156 56" stroke="#00b8d4" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4"/>
    </svg>
  );
}
