import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar
} from 'lucide-react';
import { apiFetch } from '../lib/api';

const TicketDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [catatan, setCatatan] = useState('');
  const [fotoSelesai, setFotoSelesai] = useState('');
  const [showCompleteForm, setShowCompleteForm] = useState(false);

  const fetchTicket = async () => {
    const data = await apiFetch(`/tickets?id=${id}`);
    if (data && data.length > 0) {
      // Find specific ticket since /tickets returns array
      const found = data.find((t: any) => t.id === parseInt(id!));
      setTicket(found);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const handleClose = async () => {
    const result = await apiFetch('/tickets', {
      method: 'POST',
      body: JSON.stringify({ action: 'close', ticket_id: ticket.id })
    });
    if (result) fetchTicket();
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await apiFetch('/tickets', {
      method: 'POST',
      body: JSON.stringify({
        action: 'complete',
        ticket_id: ticket.id,
        catatan_perbaikan: catatan,
        foto_selesai: fotoSelesai
      })
    });
    if (result) {
      setShowCompleteForm(false);
      fetchTicket();
    }
  };

  if (loading) return <div className="p-20 text-center">Memuat...</div>;
  if (!ticket) return <div className="p-20 text-center text-red-500">Tiket tidak ditemukan.</div>;

  return (
    <>
      <Layout role={user.role}>
      <div className="max-w-4xl mx-auto space-y-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={20} /> Kembali
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="p-8 border-b border-slate-100 bg-slate-50/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
                  {ticket.ticket_number}
                </span>
                <h1 className="text-3xl font-bold text-slate-900 mt-2">{ticket.judul}</h1>
                <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1"><MapPin size={16}/> {ticket.lokasi}</span>
                  <span className="flex items-center gap-1"><Calendar size={16}/> {new Date(ticket.tgl_kejadian).toLocaleDateString('id-ID')}</span>
                  <span className="flex items-center gap-1 font-bold text-red-500 underline decoration-red-200">{ticket.prioritas}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`px-4 py-2 rounded-xl font-bold text-sm shadow-sm ${
                  ticket.status === 'tertutup' ? 'bg-emerald-500 text-white' : 
                  ticket.status === 'diproses' ? 'bg-amber-500 text-white' : 
                  'bg-blue-600 text-white'
                }`}>
                  {ticket.status === 'diproses' ? 'SEDANG DIKERJAKAN' : ticket.status.replace('_', ' ').toUpperCase()}
                </span>
                {user.role === 'user' && ticket.status === 'selesai_teknisi' && (
                  <button 
                    onClick={handleClose}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all"
                  >
                    Konfirmasi & Tutup Tiket
                  </button>
                )}
                {user.role === 'teknisi' && ticket.status === 'diproses' && (
                  <button 
                    onClick={() => setShowCompleteForm(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all"
                  >
                    Selesaikan Tugas
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Deskripsi Masalah</h3>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {ticket.deskripsi}
                </p>
              </div>
              
              {ticket.foto_kerusakan && (
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Foto Kerusakan</h3>
                  <img src={ticket.foto_kerusakan} alt="Kerusakan" className="rounded-xl border border-slate-200 max-h-64 object-cover" />
                </div>
              )}
            </div>

            <div className="space-y-8">
              <div className="relative pl-8 border-l-2 border-slate-100 space-y-8">
                {/* Status Timeline - Simplified */}
                <div className="relative">
                  <div className="absolute -left-[41px] top-0 w-5 h-5 rounded-full bg-blue-600 border-4 border-white shadow-sm"></div>
                  <p className="text-xs font-bold text-slate-400">LAPORAN DIBUAT</p>
                  <p className="text-sm font-medium text-slate-800">{ticket.pelapor_nama || 'User'}</p>
                </div>

                {ticket.teknisi_id && (
                  <div className="relative">
                    <div className="absolute -left-[41px] top-0 w-5 h-5 rounded-full bg-indigo-600 border-4 border-white shadow-sm"></div>
                    <p className="text-xs font-bold text-slate-400">PETUGAS DITUGASKAN</p>
                    <p className="text-sm font-medium text-slate-800">{ticket.teknisi_nama}</p>
                  </div>
                )}

                {ticket.status === 'selesai_teknisi' || ticket.status === 'tertutup' ? (
                  <div className="relative">
                    <div className="absolute -left-[41px] top-0 w-5 h-5 rounded-full bg-emerald-600 border-4 border-white shadow-sm"></div>
                    <p className="text-xs font-bold text-slate-400">PEKERJAAN SELESAI</p>
                    <div className="mt-2 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                      <p className="text-sm font-bold text-emerald-800 mb-1">Catatan Teknisi:</p>
                      <p className="text-sm text-emerald-700 italic">"{ticket.catatan_perbaikan}"</p>
                      {ticket.foto_selesai && (
                        <img src={ticket.foto_selesai} alt="Hasil" className="mt-3 rounded-lg border border-emerald-200 max-h-32 object-cover" />
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
      
      {/* Completion Modal */}
      {showCompleteForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-slate-50">
              <h2 className="text-xl font-bold text-slate-900">Selesaikan Tugas</h2>
              <p className="text-sm text-slate-500 mt-1">Isi laporan hasil perbaikan untuk tiket {ticket.ticket_number}</p>
            </div>
            <form onSubmit={handleComplete} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Catatan Perbaikan</label>
                <textarea 
                  required
                  rows={3}
                  className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Deskripsikan tindakan yang telah dilakukan..."
                  value={catatan}
                  onChange={e => setCatatan(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">URL Foto Hasil (Opsional)</label>
                <input 
                  type="url"
                  className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="https://..."
                  value={fotoSelesai}
                  onChange={e => setFotoSelesai(e.target.value)}
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowCompleteForm(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-bold"
                >
                  Kirim Laporan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default TicketDetail;
