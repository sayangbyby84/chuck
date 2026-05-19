import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import RiwayatTugasTeknisi from '../components/RiwayatTugasTeknisi';
import { 
  ClipboardCheck, 
  Wrench, 
  Clock, 
  CheckCircle2,
  Camera,
  MapPin
} from 'lucide-react';
import { apiFetch } from '../lib/api';

const TeknisiDashboard: React.FC = () => {
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get('tab');

  const [stats, setStats] = useState({ total: 0, completed: 0, process: 0, new: 0 });
  const [tickets, setTickets] = useState<any[]>([]);
  const [statusTeknisi, setStatusTeknisi] = useState<'aktif' | 'sedang bekerja' | 'non-aktif'>('aktif');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Completion form state
  const [completingTicket, setCompletingTicket] = useState<any>(null);
  const [acceptingTicket, setAcceptingTicket] = useState<any>(null);
  const [catatan, setCatatan] = useState('');
  const [fotoSelesai, setFotoSelesai] = useState('');

  const fetchData = async () => {
    // Fetch stats
    const dashData = await apiFetch('/dashboard');
    if (dashData) setStats(dashData.stats);
    
    // Fetch technician tickets
    const ticketData = await apiFetch('/tickets');
    if (ticketData) setTickets(ticketData);

    // Fetch technician self profile for status
    const profileData = await apiFetch('/users');
    if (profileData && Array.isArray(profileData) && profileData.length > 0) {
      setStatusTeknisi(profileData[0].status_teknisi);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleStatus = async () => {
    if (statusTeknisi === 'sedang bekerja') return; // Cannot toggle while working on a ticket
    
    const newStatus = statusTeknisi === 'aktif' ? 'non-aktif' : 'aktif';
    setIsUpdatingStatus(true);

    try {
      const result = await apiFetch('/users', {
        method: 'POST',
        body: JSON.stringify({
          action: 'update_status',
          status_teknisi: newStatus
        })
      });

      if (result && result.success) {
        setStatusTeknisi(newStatus);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAccept = async () => {
    const ticketId = acceptingTicket?.id;
    if (!ticketId) return;
    
    try {
      const result = await apiFetch('/tickets', {
        method: 'POST',
        body: JSON.stringify({
          action: 'accept',
          ticket_id: ticketId
        })
      });
      if (result) {
        setAcceptingTicket(null);
        fetchData();
      }
    } catch (err) {
      console.error('Failed to accept ticket:', err);
    }
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await apiFetch('/tickets', {
        method: 'POST',
        body: JSON.stringify({
          action: 'complete',
          ticket_id: completingTicket.id,
          catatan_perbaikan: catatan,
          foto_selesai: fotoSelesai
        })
      });

      if (result) {
        setCompletingTicket(null);
        setCatatan('');
        setFotoSelesai('');
        fetchData();
      }
    } catch (err) {
      console.error('Failed to complete ticket:', err);
    }
  };

  // Find any new assigned tickets to display in the floating banner
  const newAssignedTicket = tickets.find((t: any) => t.status === 'ditugaskan');

  return (
    <Layout role="teknisi">
      <div className="flex flex-col gap-8 relative">
        {/* Floating banner for new tasks */}
        {newAssignedTicket && (
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-4 rounded-xl shadow-xl border border-blue-500 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-pulse duration-1000">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
              <div>
                <span className="text-[10px] font-bold bg-amber-400 text-blue-900 px-2 py-0.5 rounded-full font-mono">TUGAS BARU DITUGASKAN</span>
                <h4 className="font-bold text-sm md:text-base mt-1">{newAssignedTicket.judul} ({newAssignedTicket.ticket_number})</h4>
                <p className="text-xs text-blue-100">Lokasi: {newAssignedTicket.lokasi} | Prioritas: {newAssignedTicket.prioritas}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end md:self-auto">
              <button 
                onClick={() => setAcceptingTicket(newAssignedTicket)}
                className="bg-white text-blue-700 hover:bg-amber-400 hover:text-blue-900 px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md"
              >
                Terima Tugas
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Header with Switch Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {currentTab === 'history' ? 'Riwayat Kerja Teknisi' : 'Panel Utama Teknisi'}
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {currentTab === 'history' ? 'Pantau daftar penyelesaian tugas perbaikan Anda.' : 'Kelola tugas perbaikan dan laporkan hasil pengerjaan Anda.'}
            </p>
          </div>
          
          {/* Switch Status */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status Ketersediaan:</span>
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                disabled={statusTeknisi === 'sedang bekerja' || isUpdatingStatus}
                onClick={handleToggleStatus}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusTeknisi === 'aktif'
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                    : 'text-slate-500 hover:text-slate-800'
                } disabled:opacity-50`}
              >
                {statusTeknisi === 'aktif' ? (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                    </span>
                    Aktif (Siap Kerja)
                  </>
                ) : (
                  'Aktif'
                )}
              </button>
              <button
                disabled={statusTeknisi === 'sedang bekerja' || isUpdatingStatus}
                onClick={handleToggleStatus}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusTeknisi === 'non-aktif'
                    ? 'bg-slate-500 text-white shadow-sm'
                    : statusTeknisi === 'sedang bekerja'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                } disabled:opacity-50`}
              >
                {statusTeknisi === 'sedang bekerja' ? (
                  <>
                    <span className="h-2 w-2 rounded-full bg-white"></span>
                    Sedang Bekerja
                  </>
                ) : (
                  'Istirahat (Non-Aktif)'
                )}
              </button>
            </div>
          </div>
        </div>

        {currentTab === 'history' ? (
          <RiwayatTugasTeknisi />
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><ClipboardCheck size={20} /></div>
                  <span className="text-xs font-bold text-slate-400">TUGAS BARU</span>
                </div>
                <p className="text-2xl font-bold">{stats.new}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Wrench size={20} /></div>
                  <span className="text-xs font-bold text-slate-400">PROSES</span>
                </div>
                <p className="text-2xl font-bold">{stats.process}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle2 size={20} /></div>
                  <span className="text-xs font-bold text-slate-400">SELESAI</span>
                </div>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-slate-50 text-slate-600 rounded-lg"><Clock size={20} /></div>
                  <span className="text-xs font-bold text-slate-400">TOTAL</span>
                </div>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>

            {/* Tasks List */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                  <ClipboardCheck className="text-blue-600" size={20} />
                  Daftar Tugas Anda
                </h3>
                <span className="text-xs text-slate-400 font-mono">Pembaruan Real-Time</span>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {tickets.length === 0 ? (
                  <div className="bg-white p-12 text-center rounded-xl border border-dashed border-slate-300 text-slate-400 font-medium">
                    Belum ada tugas yang ditugaskan kepada Anda.
                  </div>
                ) : (
                  tickets.map((t: any) => (
                    <div key={t.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{t.ticket_number}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.status === 'ditugaskan' ? 'bg-blue-100 text-blue-600' :
                            t.status === 'diproses' ? 'bg-amber-100 text-amber-600' :
                            t.status === 'selesai_teknisi' ? 'bg-indigo-100 text-indigo-600' :
                            'bg-emerald-100 text-emerald-600'
                          }`}>
                            {t.status === 'diproses' ? 'SEDANG DIKERJAKAN' : t.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-lg">{t.judul}</h4>
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-md"><Wrench size={14}/> {t.kategori}</span>
                          <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-md"><MapPin size={14}/> {t.lokasi}</span>
                          <span className={`px-2.5 py-1 rounded-md font-bold uppercase ${
                            t.prioritas === 'Darurat' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                            t.prioritas === 'Tinggi' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                            'bg-slate-100 text-slate-600'
                          }`}>{t.prioritas}</span>
                        </div>
                        <p className="text-sm text-slate-600 mt-3 line-clamp-2">{t.deskripsi}</p>
                      </div>

                      <div className="flex items-center gap-3 self-end md:self-auto border-t md:border-t-0 pt-4 md:pt-0 w-full md:w-auto justify-end">
                        {t.status === 'ditugaskan' && (
                          <button 
                            onClick={() => setAcceptingTicket(t)}
                            className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-500/10"
                          >
                            Terima Tugas
                          </button>
                        )}
                        {t.status === 'diproses' && (
                          <button 
                            onClick={() => setCompletingTicket(t)}
                            className="bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-500/10"
                          >
                            Selesaikan
                          </button>
                        )}
                        <button 
                          onClick={() => window.location.href = `/tickets/${t.id}`}
                          className="text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                        >
                          Detail
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {/* Accept Modal */}
        {acceptingTicket && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-900">Mulai Kerjakan?</h2>
                <p className="text-sm text-slate-500 mt-1">Status ketersediaan Anda akan diubah otomatis menjadi "Sedang Bekerja".</p>
              </div>
              <div className="p-6 pt-4 flex gap-3">
                <button 
                  onClick={() => setAcceptingTicket(null)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-semibold"
                >
                  Batal
                </button>
                <button 
                  onClick={handleAccept}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-bold shadow-md shadow-blue-500/20"
                >
                  Ya, Mulai Kerja
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Completion Modal */}
        {completingTicket && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-900">Selesaikan Perbaikan</h2>
                <p className="text-sm text-slate-500 mt-1">Masukkan hasil pengerjaan untuk {completingTicket.ticket_number}</p>
              </div>
              <form onSubmit={handleComplete} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Catatan Perbaikan</label>
                  <textarea 
                    required value={catatan} onChange={e => setCatatan(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Jelaskan detail apa saja yang sudah diperbaiki..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">URL Foto Bukti Selesai (Opsional)</label>
                  <div className="relative">
                    <input 
                      value={fotoSelesai} onChange={e => setFotoSelesai(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="https://..."
                    />
                    <Camera size={18} className="absolute left-3 top-2.5 text-slate-400" />
                  </div>
                </div>
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button" onClick={() => setCompletingTicket(null)}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-semibold"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-bold shadow-lg shadow-emerald-500/20"
                  >
                    Simpan & Selesai
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

export default TeknisiDashboard;
