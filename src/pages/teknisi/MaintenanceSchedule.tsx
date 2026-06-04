import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { apiFetch } from '../../lib/api';
import { Clock, MapPin, ShieldCheck } from 'lucide-react';

const MaintenanceSchedule: React.FC = () => {
  const [schedules, setSchedules] = useState<any[]>([]);

  const fetchData = async () => {
    const s = await apiFetch('/maintenance');
    if (s) setSchedules(s);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Layout role="teknisi">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="text-blue-600" /> Jadwal Pemeliharaan Saya
          </h1>
          <p className="text-slate-500">Daftar aset dan fasilitas yang menjadi tanggung jawab Anda untuk pemeliharaan rutin.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schedules.length === 0 ? (
            <div className="col-span-full bg-white p-12 text-center rounded-xl border border-dashed border-slate-300 text-slate-400 font-medium">
              Belum ada jadwal pemeliharaan rutin yang ditugaskan kepada Anda.
            </div>
          ) : (
            schedules.map(s => {
              const nextDate = new Date(s.tgl_berikutnya);
              const isDueSoon = (nextDate.getTime() - Date.now()) < (7 * 24 * 60 * 60 * 1000); // due in 7 days
              
              return (
                <div key={s.id} className={`bg-white p-6 rounded-xl shadow-sm border-t-4 transition-all hover:shadow-md ${isDueSoon ? 'border-t-orange-500 border-x border-b border-slate-200' : 'border-t-blue-500 border-x border-b border-slate-200'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 rounded">
                      {s.kategori_alat}
                    </span>
                    {isDueSoon && (
                      <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-600 rounded animate-pulse">
                        Mendekati Waktu
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 mb-2">{s.nama_alat}</h3>
                  
                  <div className="space-y-2 mt-4 text-sm text-slate-600">
                    <p className="flex items-center gap-2"><MapPin size={16} className="text-slate-400"/> {s.lokasi_ruangan}</p>
                    <p className="flex items-center gap-2"><Clock size={16} className="text-slate-400"/> Tiap {s.frekuensi_bulan} Bulan</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-xs">
                      <p className="text-slate-500">Jadwal Berikutnya:</p>
                      <p className={`font-bold font-mono text-sm ${isDueSoon ? 'text-orange-600' : 'text-slate-800'}`}>
                        {nextDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MaintenanceSchedule;
