import { useState, useEffect } from 'react';
import { Users, FileText, CheckCircle, AlertCircle, Clock, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ 
    total: 0, 
    menunggu: 0, 
    diproses: 0, 
    selesai: 0,
    teknisiAktif: 0
  });
  const [criticalTickets, setCriticalTickets] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('sipekall_token');
      const [statsRes, ticketsRes, usersRes] = await Promise.all([
        fetch('/.netlify/functions/dashboard', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/.netlify/functions/tickets', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/.netlify/functions/users?role=teknisi', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      const statsData = await statsRes.json().catch(() => ({ menunggu: 0, diproses: 0, selesai: 0 }));
      const ticketsData = await ticketsRes.json().catch(() => []);
      const usersData = await usersRes.json().catch(() => []);
      
      if (statsRes.ok) {
        setStats({
          ...(statsData || {}),
          total: (statsData?.menunggu || 0) + (statsData?.diproses || 0) + (statsData?.selesai || 0),
          teknisiAktif: Array.isArray(usersData) ? usersData.length : 0
        });
      }
      
      if (ticketsRes.ok) {
        const critical = Array.isArray(ticketsData) ? ticketsData.filter((t: any) => 
          (t?.prioritas === 'Tinggi' || t?.prioritas === 'Darurat') && t?.status === 'menunggu'
        ).slice(0, 3) : [];
        setCriticalTickets(critical);
      }

      if (usersRes.ok) {
        setTechnicians(Array.isArray(usersData) ? usersData : []);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">DASHBOARD ADMIN</h1>
          <p className="text-slate-500 mt-1">Ringkasan performa pemeliharaan fasilitas & aktivitas teknisi.</p>
        </div>
        <button onClick={fetchData} className="p-2 text-slate-500 hover:text-primary transition-colors">
          <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><FileText size={24} /></div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-800">{stats.total}</h3>
            <p className="text-slate-500 text-sm font-medium mt-1">Total Tiket Masuk</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-orange-50 text-orange-500 rounded-lg"><AlertCircle size={24} /></div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-800">{stats.menunggu}</h3>
            <p className="text-slate-500 text-sm font-medium mt-1">Tiket Menunggu (Pending)</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-indigo-50 text-indigo-500 rounded-lg"><Users size={24} /></div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-800">{stats.teknisiAktif}</h3>
            <p className="text-slate-500 text-sm font-medium mt-1">Teknisi Terdaftar</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-lg"><CheckCircle size={24} /></div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-800">{stats.selesai}</h3>
            <p className="text-slate-500 text-sm font-medium mt-1">Laporan Terselesaikan</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Daftar Teknisi</h2>
          <div className="space-y-4">
            {technicians.length === 0 ? (
              <p className="text-sm text-slate-500 italic py-4 text-center">Tidak ada teknisi terdaftar.</p>
            ) : (
              technicians.map((t, i) => (
                <div key={i} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                      {t?.nama_lengkap?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{t?.nama_lengkap || 'Unknown'}</p>
                      <p className="text-xs text-slate-500">{t?.email || '-'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">Aktif</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-800">Tiket Kritis (Menunggu)</h2>
          </div>
          <div className="space-y-3">
            {criticalTickets.length === 0 ? (
              <p className="text-sm text-slate-500 italic py-4 text-center">Tidak ada tiket kritis saat ini.</p>
            ) : (
              criticalTickets.map((t, i) => (
                <div key={i} className="p-4 border border-red-200 bg-red-50/50 rounded-lg flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <AlertCircle size={20} className="text-red-500" />
                    <div>
                      <p className="font-bold text-slate-800">{t?.judul || 'Tanpa Judul'}</p>
                      <p className="text-xs font-semibold text-slate-600">ID: {t?.ticket_number || '-'}</p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">
                      <Clock size={12} /> {t?.created_at ? new Date(t.created_at).toLocaleTimeString() : '-'}
                    </span>
                    <Link to="/admin/tickets" className="mt-2 text-xs font-bold text-primary bg-white px-3 py-1 border border-primary/20 rounded hover:bg-primary hover:text-white transition-colors">
                      Assign
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
