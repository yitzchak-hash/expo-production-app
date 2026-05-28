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
      const auth = sessionStorage.getItem(SESSION_KEY);
      if (auth === 'true') {
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
      <div className="min-h-screen flex items-center justify-center bg-navy-950">
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
        style={{
          background: 'radial-gradient(ellipse at 30% 20%, #0d2255 0%, #04091a 60%)',
        }}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #00b8d4, transparent)' }}
          />
          <div
            className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full opacity-8"
            style={{ background: 'radial-gradient(circle, #f5a623, transparent)' }}
          />
        </div>

        <div className="relative w-full max-w-sm">
          {/* Card */}
          <div
            className="rounded-3xl p-8 text-center"
            style={{
              background: 'rgba(12, 21, 48, 0.95)',
              border: '1px solid rgba(0, 184, 212, 0.2)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0, 184, 212, 0.05)',
            }}
          >
            {/* Logo area */}
            <div className="mb-8">
              {/* SVG Logo */}
              <div className="flex justify-center mb-4">
                <TzviAirLogo />
              </div>
              <div className="text-xs text-slate-500 font-medium tracking-widest uppercase mt-3">
                Expo Production Dashboard
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">Enter Access Code</label>
                <input
                  type="password"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={8}
                  className="pin-input w-full bg-navy-900 border rounded-xl px-4 py-3 text-xl font-bold text-slate-100 focus:outline-none transition-colors"
                  style={{
                    borderColor: error ? '#f87171' : code ? 'rgba(0, 184, 212, 0.6)' : 'rgba(30, 48, 96, 1)',
                  }}
                  placeholder="••••"
                  autoFocus
                />
              </div>

              {error && (
                <div className="text-sm text-red-400 bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={!code}
                className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: code ? 'linear-gradient(135deg, #00b8d4, #0097a7)' : 'rgba(0, 184, 212, 0.2)',
                  color: '#fff',
                  boxShadow: code ? '0 4px 20px rgba(0, 184, 212, 0.3)' : 'none',
                }}
              >
                Enter Dashboard
              </button>
            </form>

            <p className="text-xs text-slate-600 mt-6">
              TzviAir Internal — Architects Expo 2025
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function TzviAirLogo() {
  return (
    <svg width="200" height="80" viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Swoosh lines */}
      <path d="M60 18 Q100 8 150 14" stroke="#f5a623" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.9"/>
      <path d="M56 25 Q100 13 154 20" stroke="#1a4b8f" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.85"/>
      <path d="M52 32 Q100 18 158 26" stroke="#00b8d4" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8"/>
      {/* Tzvi text */}
      <text x="38" y="58" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="32" fill="#1a2e6e" fontStyle="italic">Tzvi</text>
      {/* Air text */}
      <text x="118" y="58" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="32" fill="#00b8d4" fontStyle="italic">Air</text>
      {/* Underline swoosh */}
      <path d="M38 64 Q100 72 162 62" stroke="#00b8d4" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5"/>
    </svg>
  );
}
