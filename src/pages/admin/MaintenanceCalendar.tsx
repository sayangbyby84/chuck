import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { apiFetch } from '../../lib/api';
import { Calendar, Plus, Trash2, Clock, MapPin, ShieldCheck } from 'lucide-react';

const ALAT_MEDIS = [
  { name: 'Ventilator', freq: [1, 2] },
  { name: 'Mesin Anestesi', freq: [2, 3] },
  { name: 'Defibrillator / Alat Kejut Jantung', freq: [1] },
  { name: 'Patient Monitor', freq: [3] },
  { name: 'Mesin X-Ray / CT Scan / MRI', freq: [6] },
  { name: 'Autoclave / Alat Sterilisasi', freq: [3] },
  { name: 'Infuse Pump / Syringe Pump', freq: [6] },
  { name: 'Suction Pump / Alat Sedot Cairan', freq: [6] }
];

const FASILITAS_LINGKUNGAN = [
  { name: 'AC Ruang Operasi (Sistem HEPA Filter / HVAC)', freq: [1, 2] },
  { name: 'Kulkas Medis / Refrigerator (Darah & Vaksin)', freq: [1] },
  { name: 'Genset Rumah Sakit (Generator Cadangan)', freq: [1] },
  { name: 'Sistem UPS Pusat (Kamar Operasi & ICU)', freq: [1] },
  { name: 'Sistem IPAL (Instalasi Pengolahan Air Limbah)', freq: [1] }
];

const MaintenanceCalendar: React.FC = () => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [kategoriAlat, setKategoriAlat] = useState('Alat Medis');
  const [namaAlat, setNamaAlat] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [frekuensi, setFrekuensi] = useState('1');
  const [tglMulai, setTglMulai] = useState('');
  const [teknisiId, setTeknisiId] = useState('');

  const activeEquipmentList = kategoriAlat === 'Alat Medis' ? ALAT_MEDIS : FASILITAS_LINGKUNGAN;

  const fetchData = async () => {
    const s = await apiFetch('/maintenance');
    if (s) setSchedules(s);
    const users = await apiFetch('/users');
    if (users) {
      setTechnicians(users.filter((u: any) => u.role === 'teknisi'));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaAlat || !lokasi || !tglMulai || !teknisiId) return alert('Lengkapi semua data!');

    const res = await apiFetch('/maintenance', {
      method: 'POST',
      body: JSON.stringify({
        kategori_alat: kategoriAlat,
        nama_alat: namaAlat,
        lokasi_ruangan: lokasi,
        frekuensi_bulan: parseInt(frekuensi),
        tgl_mulai: tglMulai,
        teknisi_id: parseInt(teknisiId)
      })
    });

    if (res) {
      setIsModalOpen(false);
      fetchData();
      setNamaAlat(''); setLokasi(''); setTglMulai(''); setTeknisiId('');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Yakin ingin menghapus jadwal ini?')) return;
    await apiFetch('/maintenance', {
      method: 'DELETE',
      body: JSON.stringify({ id })
    });
    fetchData();
  };

  return (
    <Layout role="admin">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="text-blue-600" /> Preventive Maintenance
            </h1>
            <p className="text-slate-500">Kalender Pemeliharaan Berkala Fasilitas & Alat Medis.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 shadow-sm"
          >
            <Plus size={18} /> Tambah Jadwal Rutin
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><Calendar size={18}/> Timeline Jadwal Pemeliharaan</h3>
          </div>
          <div className="p-0">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Aset / Alat</th>
                  <th className="px-6 py-4">Lokasi & Kategori</th>
                  <th className="px-6 py-4">Jadwal & Frekuensi</th>
                  <th className="px-6 py-4">PIC (Teknisi)</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {schedules.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-400">Belum ada jadwal pemeliharaan terdaftar.</td></tr>
                ) : (
                  schedules.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800">{s.nama_alat}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-700 flex items-center gap-1 text-xs"><MapPin size={12}/> {s.lokasi_ruangan}</p>
                        <p className="text-xs text-slate-500 mt-1 px-2 py-0.5 bg-slate-100 rounded inline-block">{s.kategori_alat}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded">
                            Tiap {s.frekuensi_bulan} Bulan
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 flex items-center gap-1 font-mono">
                          <Clock size={12} className="text-orange-500" />
                          Next: {new Date(s.tgl_berikutnya).toLocaleDateString('id-ID')}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                            {s.teknisi_nama?.[0] || '?'}
                          </div>
                          {s.teknisi_nama}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={16} />
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-800">Setup Jadwal Rutin</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Kategori Alat</label>
                  <select 
                    value={kategoriAlat} 
                    onChange={e => { setKategoriAlat(e.target.value); setNamaAlat(''); }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="Alat Medis">Alat Medis</option>
                    <option value="Fasilitas Lingkungan">Fasilitas Lingkungan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Nama Alat</label>
                  <select 
                    value={namaAlat} 
                    onChange={e => setNamaAlat(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="" disabled>-- Pilih Alat --</option>
                    {activeEquipmentList.map(item => (
                      <option key={item.name} value={item.name}>{item.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Lokasi / Ruangan</label>
                <input 
                  type="text" 
                  value={lokasi} onChange={e => setLokasi(e.target.value)}
                  placeholder="Contoh: Ruang ICU Lantai 2" required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Frekuensi (Bulan)</label>
                  <select 
                    value={frekuensi} 
                    onChange={e => setFrekuensi(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="1">1 Bulan Sekali</option>
                    <option value="2">2 Bulan Sekali</option>
                    <option value="3">3 Bulan Sekali</option>
                    <option value="6">6 Bulan Sekali</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Tanggal Mulai Berlaku</label>
                  <input 
                    type="date" 
                    value={tglMulai} onChange={e => setTglMulai(e.target.value)} required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Pilih Teknisi PJ (Penanggung Jawab)</label>
                <select 
                  value={teknisiId} 
                  onChange={e => setTeknisiId(e.target.value)} required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="" disabled>-- Pilih Teknisi --</option>
                  {technicians.map(t => (
                    <option key={t.id} value={t.id}>{t.nama_lengkap}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100">Batal</button>
                <button type="submit" className="px-4 py-2 rounded-lg text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md">Simpan Jadwal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default MaintenanceCalendar;
