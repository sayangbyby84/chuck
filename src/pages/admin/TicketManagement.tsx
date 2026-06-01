import { useState, useEffect } from 'react';
import { Search, RefreshCw, UserPlus, X, Printer } from 'lucide-react';

export default function TicketManagement() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('semua');
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [technicians, setTechnicians] = useState<any[]>([]);

  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('sipekall_token');
      const [ticketsRes, usersRes] = await Promise.all([
        fetch('/api/tickets', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/users?role=teknisi', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      if (ticketsRes.ok) {
        const data = await ticketsRes.json().catch(() => []);
        setTickets(Array.isArray(data) ? data : []);
      }

      if (usersRes.ok) {
        const data = await usersRes.json().catch(() => []);
        setTechnicians(Array.isArray(data) ? data : []);
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

  const handleAssign = async (ticketId: number, techId: number, techName: string) => {
    try {
      const token = localStorage.getItem('sipekall_token');
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'diproses',
          teknisi_id: techId
        })
      });
      if (res.ok) {
        setShowAssignModal(false);
        setShowDetail(false);
        fetchData();
        console.log(`Tiket berhasil ditugaskan ke ${techName}`);
      }
    } catch (error) {
      console.error('Assign error:', error);
    }
  };

  const safeTickets = Array.isArray(tickets) ? tickets : [];
  const filteredTickets = safeTickets.filter((t: any) => {
    if (activeTab === 'semua') return true;
    if (activeTab === 'selesai') return t?.status === 'selesai_teknisi' || t?.status === 'tertutup';
    return t?.status?.toLowerCase() === activeTab.toLowerCase();
  });

  const getStatsCount = (status: string) => {
    if (status === 'semua') return safeTickets.length;
    if (status === 'selesai') return safeTickets.filter((t: any) => t?.status === 'selesai_teknisi' || t?.status === 'tertutup').length;
    return safeTickets.filter((t: any) => t?.status === status).length;
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Manajemen Tiket</h1>
          <p className="text-slate-500 mt-1">Disposisi dan pantau laporan kerusakan dari seluruh unit.</p>
        </div>
        <button onClick={fetchData} className="p-2 text-slate-500 hover:text-primary transition-colors">
           <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-200 overflow-x-auto bg-slate-50/30">
          {[
            { id: 'semua', label: 'Semua' },
            { id: 'menunggu', label: 'Menunggu' },
            { id: 'diproses', label: 'Diproses' },
            { id: 'selesai', label: 'Selesai / Tutup' }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 font-bold text-xs uppercase tracking-widest whitespace-nowrap border-b-2 transition-all ${
                activeTab === tab.id 
                  ? 'border-primary text-primary bg-white' 
                  : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label} <span className="ml-2 bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-[10px]">{getStatsCount(tab.id)}</span>
            </button>
          ))}
        </div>

        <div className="p-5">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Cari ID atau Judul..." 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white transition-all text-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-y border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <tr>
                  <th className="px-5 py-4">ID Tiket</th>
                  <th className="px-5 py-4">Laporan / Lokasi</th>
                  <th className="px-5 py-4">Prioritas</th>
                  <th className="px-5 py-4">Teknisi</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center">
                      <RefreshCw size={24} className="animate-spin mx-auto text-slate-300" />
                    </td>
                  </tr>
                ) : filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-slate-500 font-medium">
                      Belum ada tiket dalam kategori ini.
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-5 py-4 font-bold text-primary">{t.ticket_number}</td>
                      <td className="px-5 py-4">
                        <p className="text-slate-800 font-bold">{t.judul}</p>
                        <p className="text-xs text-slate-500">{t.lokasi}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                          t.prioritas === 'Tinggi' || t.prioritas === 'Darurat' ? 'bg-red-100 text-red-700' :
                          t.prioritas === 'Sedang' ? 'bg-orange-100 text-orange-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {t.prioritas}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {!t.teknisi_id ? (
                          <div className="relative group/select">
                            <select 
                              onChange={(e) => {
                                const techId = parseInt(e.target.value);
                                if (techId) {
                                  const tech = technicians.find(u => u.id === techId);
                                  handleAssign(t.id, techId, tech?.nama_lengkap || 'Teknisi');
                                }
                              }}
                              className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all appearance-none cursor-pointer hover:bg-white"
                              defaultValue=""
                            >
                              <option value="" disabled>Pilih Teknisi...</option>
                              {technicians.map((tech) => (
                                <option key={tech.id} value={tech.id}>{tech.nama_lengkap}</option>
                              ))}
                            </select>
                            <UserPlus size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                          </div>
                        ) : (
                          <span className="text-slate-700 font-bold flex items-center gap-2 text-xs">
                             <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                               {t.teknisi_nama?.[0] || 'T'}
                             </div>
                             {t.teknisi_nama}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          t?.status === 'menunggu' ? 'bg-white border border-slate-200 text-slate-500' :
                          t?.status === 'diproses' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                          t?.status === 'selesai_teknisi' ? 'bg-blue-50 text-primary border border-blue-100' :
                          'bg-green-50 text-green-600 border border-green-100'
                        }`}>
                          {t?.status?.replace('_', ' ') || '-'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button 
                          onClick={() => { setSelectedTicket(t); setShowDetail(true); }}
                          className="text-primary hover:text-blue-800 font-bold text-xs uppercase tracking-widest border border-primary/20 px-3 py-1.5 rounded-lg bg-white shadow-sm hover:bg-primary/5 transition-all"
                        >
                          DETAIL
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetail && selectedTicket && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">Detail Tiket Maintenance</h3>
                <p className="text-sm text-slate-500 font-medium">#{selectedTicket.ticket_number} • Dilaporkan pada {new Date(selectedTicket.created_at).toLocaleString()}</p>
              </div>
              <button onClick={() => setShowDetail(false)} className="text-slate-400 hover:text-slate-600">
                <X size={28} />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Informasi Pelaporan</h4>
                    <div className="bg-slate-50 rounded-2xl p-6 space-y-4 border border-slate-100">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Pelapor</p>
                          <p className="font-bold text-slate-800">{selectedTicket.pelapor_nama}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Lokasi</p>
                          <p className="font-bold text-slate-800">{selectedTicket.lokasi}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Judul Keluhan</p>
                        <p className="font-bold text-primary text-lg">{selectedTicket.judul}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Deskripsi</p>
                        <p className="text-slate-600 leading-relaxed">{selectedTicket.deskripsi}</p>
                      </div>
                    </div>
                  </div>

                  {selectedTicket.foto_kerusakan && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Foto Lampiran</h4>
                      <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-lg">
                        <img src={selectedTicket.foto_kerusakan} alt="Lampiran" className="w-full h-auto object-cover max-h-64" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Status & Penanganan</h4>
                    <div className="border border-slate-200 rounded-2xl p-6 space-y-6">
                      <div className="flex items-center justify-between">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${
                          selectedTicket.status === 'menunggu' ? 'bg-red-50 text-red-600' :
                          selectedTicket.status === 'diproses' ? 'bg-orange-50 text-orange-600' :
                          'bg-green-50 text-green-600'
                        }`}>
                          {selectedTicket.status.replace('_', ' ')}
                        </span>
                        <span className={`text-xs font-bold px-3 py-1 rounded ${
                          selectedTicket.prioritas === 'Darurat' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          PRIORITAS: {selectedTicket.prioritas.toUpperCase()}
                        </span>
                      </div>

                      <div className="pt-4 border-t border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">Teknisi Penanggung Jawab</p>
                        {selectedTicket.teknisi_id ? (
                          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl">
                            <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl shadow-sm">
                              {selectedTicket.teknisi_nama?.[0]}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800">{selectedTicket.teknisi_nama}</p>
                              <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Teknisi Ahli</p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-2xl">
                             <p className="text-slate-400 font-medium mb-4">Belum ada teknisi ditugaskan</p>
                             <button 
                               onClick={() => setShowAssignModal(true)}
                               className="bg-primary text-white px-6 py-2 rounded-lg font-bold text-sm shadow-md hover:bg-blue-800 transition-all"
                             >
                               TUGASKAN SEKARANG
                             </button>
                          </div>
                        )}
                      </div>

                      {(selectedTicket.status === 'selesai_teknisi' || selectedTicket.status === 'tertutup') && (
                        <div className="pt-4 border-t border-slate-100 space-y-4">
                          <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Laporan Perbaikan</p>
                          <div className="bg-green-50/50 rounded-xl p-5 border border-green-100">
                            <p className="text-xs text-green-700 font-bold mb-2">CATATAN HASIL:</p>
                            <p className="text-sm text-slate-700 italic">"{selectedTicket.catatan_perbaikan || 'Tidak ada catatan.'}"</p>
                            
                            {selectedTicket.foto_selesai && (
                              <div className="mt-4">
                                <p className="text-xs text-green-700 font-bold mb-2">DOKUMENTASI SELESAI:</p>
                                <img src={selectedTicket.foto_selesai} alt="Hasil" className="w-full rounded-lg border border-green-200 shadow-sm" />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDetail(false)}
                  className="px-6 py-2 font-bold text-slate-500 hover:text-slate-700 uppercase tracking-widest text-xs"
                >
                  TUTUP
                </button>
                {(selectedTicket.status === 'selesai_teknisi' || selectedTicket.status === 'tertutup') && (
                  <button 
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-6 py-2 font-bold text-primary hover:bg-primary/5 rounded-lg transition-all uppercase tracking-widest text-xs border border-primary/20"
                  >
                    <Printer size={16} />
                    CETAK LAPORAN
                  </button>
                )}
              </div>
              {selectedTicket.status === 'menunggu' && (
                <button 
                  onClick={() => setShowAssignModal(true)}
                  className="bg-primary text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-800 transition-all shadow-lg text-sm uppercase tracking-widest"
                >
                  DISPOSISI TIKET
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Print-only View */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-section, .print-section * { visibility: visible; }
          .print-section { position: absolute; left: 0; top: 0; width: 100%; padding: 40px; }
          .no-print { display: none !important; }
        }
      `}</style>
      
      {selectedTicket && (
        <div className="print-section hidden print:block bg-white text-slate-900">
          <div className="border-b-4 border-primary pb-6 mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-black text-primary tracking-tighter">SIPEKAL</h1>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Sistem Informasi Pemeliharaan & Perbaikan Fasilitas</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">LAPORAN MAINTENANCE</p>
              <p className="text-sm text-slate-500">#{selectedTicket.ticket_number}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 mb-10">
            <div>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">Detail Pelaporan</h2>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-slate-50">
                  <tr><td className="py-2 text-slate-500">Pelapor</td><td className="py-2 font-bold">{selectedTicket.pelapor_nama}</td></tr>
                  <tr><td className="py-2 text-slate-500">Judul</td><td className="py-2 font-bold text-primary">{selectedTicket.judul}</td></tr>
                  <tr><td className="py-2 text-slate-500">Lokasi</td><td className="py-2 font-bold">{selectedTicket.lokasi}</td></tr>
                  <tr><td className="py-2 text-slate-500">Waktu Lapor</td><td className="py-2 font-bold">{new Date(selectedTicket.created_at).toLocaleString()}</td></tr>
                  <tr><td className="py-2 text-slate-500">Prioritas</td><td className="py-2 font-bold uppercase">{selectedTicket.prioritas}</td></tr>
                </tbody>
              </table>
              <div className="mt-6">
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Deskripsi Kerusakan</p>
                <div className="bg-slate-50 p-4 rounded border border-slate-100 italic text-sm text-slate-700">
                  "{selectedTicket.deskripsi}"
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">Penanganan & Perbaikan</h2>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-slate-50">
                  <tr><td className="py-2 text-slate-500">Teknisi</td><td className="py-2 font-bold">{selectedTicket.teknisi_nama || '-'}</td></tr>
                  <tr><td className="py-2 text-slate-500">Status Akhir</td><td className="py-2 font-bold uppercase text-green-600">{selectedTicket.status.replace('_', ' ')}</td></tr>
                  <tr><td className="py-2 text-slate-500">Waktu Selesai</td><td className="py-2 font-bold">{selectedTicket.tgl_selesai ? new Date(selectedTicket.tgl_selesai).toLocaleString() : '-'}</td></tr>
                </tbody>
              </table>
              <div className="mt-6">
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Catatan Perbaikan</p>
                <div className="bg-green-50 p-4 rounded border border-green-100 italic text-sm text-green-800">
                  "{selectedTicket.catatan_perbaikan || 'Tidak ada catatan tambahan.'}"
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-12 border-t border-slate-200 flex justify-between">
            <div className="text-center w-48">
              <p className="text-xs text-slate-500 mb-16 uppercase font-bold tracking-widest">Pelapor</p>
              <div className="border-b border-slate-300 mx-4"></div>
              <p className="mt-2 text-sm font-bold text-slate-800">{selectedTicket.pelapor_nama}</p>
            </div>
            <div className="text-center w-48">
              <p className="text-xs text-slate-500 mb-16 uppercase font-bold tracking-widest">Teknisi</p>
              <div className="border-b border-slate-300 mx-4"></div>
              <p className="mt-2 text-sm font-bold text-slate-800">{selectedTicket.teknisi_nama || '...................'}</p>
            </div>
            <div className="text-center w-48">
              <p className="text-xs text-slate-500 mb-16 uppercase font-bold tracking-widest">Mengetahui, Admin</p>
              <div className="border-b border-slate-300 mx-4"></div>
              <p className="mt-2 text-sm font-bold text-slate-800">SIPEKAL System</p>
            </div>
          </div>

          <div className="fixed bottom-10 left-0 right-0 text-center text-[10px] text-slate-400 uppercase tracking-widest italic">
            Dokumen ini dihasilkan secara otomatis oleh sistem SIPEKAL pada {new Date().toLocaleString()}
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Pilih Teknisi</h3>
                <p className="text-sm text-slate-500">Tiket #{selectedTicket?.ticket_number}</p>
              </div>
              <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-2">
              {technicians.length === 0 ? (
                <p className="text-center py-10 text-slate-400 font-medium italic">Tidak ada teknisi aktif.</p>
              ) : (
                technicians.map((tech: any) => (
                  <button
                    key={tech.id}
                    onClick={() => handleAssign(selectedTicket.id, tech.id, tech.nama_lengkap)}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-primary hover:text-white border border-slate-100 rounded-xl transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-primary shadow-sm group-hover:text-primary">
                        {tech?.nama_lengkap?.charAt(0) || 'T'}
                      </div>
                      <div className="text-left">
                        <p className="font-bold">{tech?.nama_lengkap || 'Teknisi'}</p>
                        <p className="text-[10px] opacity-70 font-bold uppercase tracking-widest">Tersedia</p>
                      </div>
                    </div>
                    <UserPlus size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))
              )}
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setShowAssignModal(false)}
                className="px-6 py-2 font-bold text-slate-500 hover:text-slate-700 text-sm"
              >
                BATAL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
