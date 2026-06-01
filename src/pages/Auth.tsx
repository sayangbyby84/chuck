import React, { useState } from 'react';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      
      localStorage.setItem('sipekall_token', data.token);
      localStorage.setItem('sipekall_role', data.user.role);
      localStorage.setItem('sipekall_user', JSON.stringify(data.user));
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-primary/10 rounded-2xl mb-4">
            <h1 className="text-4xl font-black text-primary tracking-tighter">SIPEKAL</h1>
          </div>
          <p className="text-slate-500 text-sm font-semibold">Sistem Informasi Pemeliharaan Alat Kesehatan & Lingkungan</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-bold border border-red-100 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-600 rounded-full"></span>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1 tracking-wider">Email Address</label>
            <input 
              type="email" 
              required
              disabled={loading}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-slate-800 font-medium placeholder:text-slate-300"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@sipekal.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1 tracking-wider">Password</label>
            <input 
              type="password" 
              required
              disabled={loading}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-slate-800 font-medium placeholder:text-slate-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full bg-primary hover:bg-blue-800 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-primary/30 active:scale-[0.98] flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                MEMVERIFIKASI...
              </>
            ) : 'MASUK KE SISTEM'}
          </button>
        </form>

        <div className="mt-8 space-y-3">
          <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Akses Cepat (Demo)</p>
          <div className="grid grid-cols-1 gap-2">
            <button 
              onClick={() => { setEmail('admin@sipekal.com'); setPassword('admin123'); }}
              className="flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">AD</div>
                <span className="text-sm font-bold text-slate-700">Administrator</span>
              </div>
              <span className="text-[10px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">GUNAKAN</span>
            </button>
            <button 
              onClick={() => { setEmail('unit.it@sipekal.com'); setPassword('user123'); }}
              className="flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center font-bold text-xs">UP</div>
                <span className="text-sm font-bold text-slate-700">Unit Pelapor</span>
              </div>
              <span className="text-[10px] font-bold text-green-600 opacity-0 group-hover:opacity-100 transition-opacity">GUNAKAN</span>
            </button>
            <button 
              onClick={() => { setEmail('budi@sipekal.com'); setPassword('teknisi123'); }}
              className="flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">TK</div>
                <span className="text-sm font-bold text-slate-700">Teknisi</span>
              </div>
              <span className="text-[10px] font-bold text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity">GUNAKAN</span>
            </button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-center text-xs text-slate-400 font-medium leading-relaxed">
            Aplikasi ini dilindungi oleh sistem keamanan internal.<br />
            Lupa password? Hubungi Admin IT Rumah Sakit.
          </p>
        </div>
      </div>
    </div>
  );
}
