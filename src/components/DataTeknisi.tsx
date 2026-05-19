import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { Users, Mail, Shield, RefreshCw } from 'lucide-react';

interface Technician {
  id: number;
  nama_lengkap: string;
  email: string;
  status_teknisi: 'aktif' | 'sedang bekerja' | 'non-aktif';
}

const DataTeknisi: React.FC = () => {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchTechnicians = async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);
    
    try {
      const data = await apiFetch('/users');
      if (data && Array.isArray(data)) {
        // Filter only technician role
        const techsOnly = data.filter((u: any) => u.role === 'teknisi');
        setTechnicians(techsOnly);
        setLastUpdated(new Date());
        setError(null);
      } else {
        setError('Gagal memuat data teknisi');
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTechnicians();
    const interval = setInterval(() => {
      fetchTechnicians(true);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: Technician['status_teknisi']) => {
    switch (status) {
      case 'aktif':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Aktif
          </span>
        );
      case 'sedang bekerja':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="h-2 w-2 rounded-full bg-amber-500"></span>
            Sedang Bekerja
          </span>
        );
      case 'non-aktif':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-500 border border-slate-200">
            <span className="h-2 w-2 rounded-full bg-slate-400"></span>
            Non-Aktif
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Users className="text-blue-600" size={20} />
            Data Manajemen Teknisi
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Status riil dan penugasan seluruh staf teknisi lapangan SIPEKAL.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 font-mono">
            Pembaruan terakhir: {lastUpdated.toLocaleTimeString()}
          </span>
          <button 
            onClick={() => fetchTechnicians(true)}
            disabled={isRefreshing}
            className={`p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-50 transition-colors ${
              isRefreshing ? 'animate-spin text-blue-600' : ''
            }`}
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 mx-6 mt-4 bg-rose-50 text-rose-700 rounded-lg text-sm border border-rose-100">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4">Nama Lengkap</th>
              <th className="px-6 py-4">Kontak / Email</th>
              <th className="px-6 py-4">Role / Otoritas</th>
              <th className="px-6 py-4">Status Kerja</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && technicians.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center">
                  <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
                    <RefreshCw className="animate-spin text-blue-600" size={18} />
                    Memuat data teknisi...
                  </div>
                </td>
              </tr>
            ) : technicians.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-slate-400 text-sm">
                  Tidak ada teknisi yang terdaftar.
                </td>
              </tr>
            ) : (
              technicians.map((tech) => (
                <tr key={tech.id} className="hover:bg-slate-50 text-sm transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                        {tech.nama_lengkap.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{tech.nama_lengkap}</p>
                        <p className="text-[10px] font-mono text-slate-400">ID: TEK-{tech.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-slate-600">
                      <Mail size={14} className="text-slate-400" />
                      <span>{tech.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                      <Shield size={12} />
                      Teknisi Lapangan
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(tech.status_teknisi)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTeknisi;
