import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { Wrench, MapPin, Calendar, CheckCircle2, FileText, Camera, RefreshCw } from 'lucide-react';

interface Ticket {
  id: number;
  ticket_number: string;
  judul: string;
  kategori: string;
  lokasi: string;
  prioritas: string;
  deskripsi: string;
  status: string;
  catatan_perbaikan: string;
  foto_selesai: string;
  tgl_selesai: string;
  pelapor_nama?: string;
}

const RiwayatTugasTeknisi: React.FC = () => {
  const [completedTickets, setCompletedTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchHistory = async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);

    try {
      const data = await apiFetch('/tickets');
      if (data && Array.isArray(data)) {
        // Filter only completed and closed tasks
        const completed = data.filter((t: Ticket) => t.status === 'selesai_teknisi' || t.status === 'tertutup');
        setCompletedTickets(completed);
        setError(null);
      } else {
        setError('Gagal memuat riwayat tugas');
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
            <CheckCircle2 className="text-emerald-600" size={22} />
            Riwayat Tugas Terselesaikan
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar tugas perbaikan yang telah Anda selesaikan dan dilaporkan ke sistem.
          </p>
        </div>
        <button
          onClick={() => fetchHistory(true)}
          disabled={isRefreshing}
          className={`p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-xs font-semibold ${
            isRefreshing ? 'animate-spin' : ''
          }`}
        >
          <RefreshCw size={16} />
          {isRefreshing ? 'Menyegarkan...' : 'Segarkan'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-700 rounded-lg text-sm border border-rose-100">
          {error}
        </div>
      )}

      {loading && completedTickets.length === 0 ? (
        <div className="flex items-center justify-center py-20 gap-2 text-slate-400 text-sm bg-white rounded-xl border border-slate-200">
          <RefreshCw className="animate-spin text-blue-600" size={18} />
          Memuat riwayat tugas...
        </div>
      ) : completedTickets.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-400">
          Belum ada riwayat tugas yang diselesaikan.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {completedTickets.map((t) => (
            <div key={t.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
              <div className="p-6 border-b border-slate-100 flex-1">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    {t.ticket_number}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                    t.status === 'tertutup' 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    {t.status === 'tertutup' ? 'TERTUTUP (ARSIP)' : 'SELESAI TEKNISI'}
                  </span>
                </div>
                
                <h4 className="font-bold text-slate-800 text-lg mb-2">{t.judul}</h4>
                
                <div className="grid grid-cols-2 gap-3 text-xs text-slate-500 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Wrench size={14} className="text-slate-400" />
                    <span className="truncate">{t.kategori}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-slate-400" />
                    <span className="truncate">{t.lokasi}</span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2">
                    <Calendar size={14} className="text-slate-400" />
                    <span className="truncate">Selesai: {formatDate(t.tgl_selesai)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block mb-1">DESKRIPSI KERUSAKAN</span>
                    <p className="text-xs text-slate-600 line-clamp-2">{t.deskripsi}</p>
                  </div>
                  
                  <div className="border-t border-slate-100 pt-3">
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mb-1">
                      <FileText size={12} className="text-emerald-500" />
                      CATATAN PERBAIKAN ANDA
                    </span>
                    <p className="text-xs text-slate-700 font-medium bg-emerald-50/50 p-2.5 rounded border border-emerald-100/50">
                      {t.catatan_perbaikan || 'Tidak ada catatan.'}
                    </p>
                  </div>
                </div>
              </div>

              {t.foto_selesai && (
                <div className="relative h-44 bg-slate-900 border-t border-slate-100 overflow-hidden">
                  <img 
                    src={t.foto_selesai} 
                    alt="Bukti Penyelesaian" 
                    className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute bottom-2 left-2 bg-slate-950/70 backdrop-blur-sm text-[10px] text-white px-2 py-1 rounded flex items-center gap-1 font-semibold">
                    <Camera size={12} />
                    Foto Bukti Penyelesaian
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RiwayatTugasTeknisi;
