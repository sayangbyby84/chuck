import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  FileText,
  Inbox,
  Archive,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { apiFetch } from '../lib/api';

const UserDashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab');

  const [stats, setStats] = useState({ total: 0, completed: 0, process: 0 });
  const [tickets, setTickets] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Filter state inside the UI
  const [subTab, setSubTab] = useState<'active' | 'history'>('active');

  // Form states
  const [judul, setJudul] = useState('');
  const [kategori, setKategori] = useState('Alat Medis');
  const [lokasi, setLokasi] = useState('');
  const [prioritas, setPrioritas] = useState('Sedang');
  const [deskripsi, setDeskripsi] = useState('');

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    const dashData = await apiFetch('/dashboard');
    if (dashData) setStats(dashData.stats);
    
    const ticketData = await apiFetch('/tickets');
    if (ticketData) setTickets(ticketData);
    if (!silent) setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData(true);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Sync state with URL parameter tab
  useEffect(() => {
    if (currentTab === 'history') {
      setSubTab('history');
    } else {
      setSubTab('active');
    }
  }, [currentTab]);

  const handleSubTabChange = (tab: 'active' | 'history') => {
    setSubTab(tab);
    if (tab === 'history') {
      setSearchParams({ tab: 'history' });
    } else {
      setSearchParams({});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await apiFetch('/tickets', {
      method: 'POST',
      body: JSON.stringify({
        action: 'create',
        judul, kategori, lokasi, prioritas, deskripsi,
        tgl_kejadian: new Date().toISOString()
      })
    });

    if (result) {
      setShowForm(false);
      setJudul('');
      setLokasi('');
      setDeskripsi('');
      fetchData();
    }
  };

  const handleClose = async (ticketId: number) => {
    if (!confirm('Apakah Anda yakin masalah ini sudah terselesaikan? Tiket akan ditutup dan masuk ke arsip.')) return;
    const result = await apiFetch('/tickets', {
      method: 'POST',
      body: JSON.stringify({
        action: 'close',
        ticket_id: ticketId
      })
    });
    if (result) fetchData();
  };

  // Filter tickets based on sub-tab
  // 'active' includes: menunggu, ditugaskan, diproses, selesai_teknisi
  // 'history' includes: tertutup
  const filteredTickets = tickets.filter((t: any) => {
    if (subTab === 'active') {
      return t.status !== 'tertutup';
    } else {
      return t.status === 'tertutup';
    }
  });

  return (
    <Layout role="user">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard Unit Pelapor</h1>
            <p className="text-slate-500 text-sm mt-0.5">Pantau dan laporkan kerusakan sarana prasarana di unit kerja Anda.</p>
          </div>
          <button 
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 font-semibold text-sm self-start sm:self-auto"
          >
            <PlusCircle size={18} />
            Buat Laporan Baru
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl"><FileText size={22} /></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Laporan</p>
              <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl"><Clock size={22} /></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dalam Proses</p>
              <p className="text-2xl font-bold text-slate-800">{stats.process}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle2 size={22} /></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Terselesaikan</p>
              <p className="text-2xl font-bold text-slate-800">{stats.completed}</p>
            </div>
          </div>
        </div>

        {/* Tickets Section with Tab Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              {subTab === 'active' ? (
                <>
                  <Inbox className="text-blue-600" size={20} />
                  Laporan Aktif
                </>
              ) : (
                <>
                  <Archive className="text-emerald-600" size={20} />
                  Arsip Laporan Selesai
                </>
              )}
            </h3>
            
            {/* Sub-tab selection */}
            <div className="flex bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
              <button 
                onClick={() => handleSubTabChange('active')}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
                  subTab === 'active' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Inbox size={14} />
                Laporan Aktif ({tickets.filter((t: any) => t.status !== 'tertutup').length})
              </button>
              <button 
                onClick={() => handleSubTabChange('history')}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
                  subTab === 'history' 
                    ? 'bg-white text-emerald-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Archive size={14} />
                Arsip Selesai ({tickets.filter((t: any) => t.status === 'tertutup').length})
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Tiket</th>
                  <th className="px-6 py-4">Judul / Kategori</th>
                  <th className="px-6 py-4">Lokasi</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Teknisi</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center">
                      <div className="flex items-center justify-center gap-2 text-slate-400 text-sm font-semibold">
                        <RefreshCw className="animate-spin text-blue-600" size={18} />
                        Memuat data tiket...
                      </div>
                    </td>
                  </tr>
                ) : filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">
                      {subTab === 'active' 
                        ? 'Tidak ada laporan aktif saat ini.' 
                        : 'Belum ada arsip laporan selesai.'}
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((t: any) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors text-sm">
                      <td className="px-6 py-4 font-mono font-bold text-blue-600">{t.ticket_number}</td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800">{t.judul}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{t.kategori}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        <span className="flex items-center gap-1"><MapPin size={12} className="text-slate-400" />{t.lokasi}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          t.status === 'menunggu' ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                          t.status === 'ditugaskan' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                          t.status === 'diproses' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                          t.status === 'selesai_teknisi' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                          'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        }`}>
                          {t.status === 'selesai_teknisi' && (
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500"></span>
                            </span>
                          )}
                          {t.status === 'diproses' ? 'SEDANG DIKERJAKAN' : t.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {t.teknisi_nama ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[9px]">
                              {t.teknisi_nama[0].toUpperCase()}
                            </div>
                            <span>{t.teknisi_nama}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Belum ditentukan</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {t.status === 'selesai_teknisi' && (
                            <button 
                              onClick={() => handleClose(t.id)}
                              className="bg-emerald-600 text-white hover:bg-emerald-700 px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-md shadow-emerald-500/10"
                            >
                              Verifikasi
                            </button>
                          )}
                          <button 
                            onClick={() => window.location.href = `/tickets/${t.id}`}
                            className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg text-xs font-semibold transition-colors"
                          >
                            Detail
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Form */}
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="text-xl font-bold text-slate-900">Buat Laporan Baru</h2>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Judul Kerusakan</label>
                  <input 
                    required value={judul} onChange={e => setJudul(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Contoh: AC Ruang Perawatan Mati Total"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Kategori</label>
                    <select 
                      value={kategori} onChange={e => setKategori(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option>Alat Medis</option>
                      <option>Alat Non-Medis</option>
                      <option>Fasilitas Gedung</option>
                      <option>Lingkungan</option>
                      <option>Lainnya</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Prioritas</label>
                    <select 
                      value={prioritas} onChange={e => setPrioritas(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option>Rendah</option>
                      <option>Sedang</option>
                      <option>Tinggi</option>
                      <option>Darurat</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Lokasi / Ruangan</label>
                  <input 
                    required value={lokasi} onChange={e => setLokasi(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Contoh: Ruang Radiologi Lt. 2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Deskripsi Kerusakan</label>
                  <textarea 
                    required value={deskripsi} onChange={e => setDeskripsi(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Jelaskan detail kerusakan yang terjadi agar teknisi cepat memahami..."
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button" onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-semibold"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-bold shadow-lg shadow-blue-500/20"
                  >
                    Kirim Laporan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default UserDashboard;
