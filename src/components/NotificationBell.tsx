import { useState, useEffect } from 'react';
import { Bell, Check, Clock } from 'lucide-react';

interface Notification {
  id: number;
  title: string;
  message: string;
  is_read: number;
  created_at: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/.netlify/functions/notifications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sipekall_token')}`
        }
      });
      if (response.ok) {
        const data = await response.json().catch(() => []);
        setNotifications(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id?: number) => {
    try {
      await fetch('/.netlify/functions/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sipekall_token')}`
        },
        body: JSON.stringify({ id })
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const unreadCount = safeNotifications.filter(n => n?.is_read === 0).length;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border border-white font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Notifikasi</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={() => markAsRead()}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Tandai semua dibaca
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {safeNotifications.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <Bell size={32} className="mx-auto mb-2 opacity-20" />
                  <p className="text-sm">Belum ada notifikasi</p>
                </div>
              ) : (
                safeNotifications.map((notif) => (
                  <div 
                    key={notif.id}
                    className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors relative group ${notif.is_read === 0 ? 'bg-blue-50/30' : ''}`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-sm font-bold text-slate-800">{notif.title}</h4>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0">
                        <Clock size={10} />
                        {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                    
                    {notif.is_read === 0 && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notif.id);
                        }}
                        className="absolute right-2 bottom-2 p-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Tandai sudah dibaca"
                      >
                        <Check size={14} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-3 text-center border-t border-slate-100">
              <button 
                onClick={() => setIsOpen(false)}
                className="text-xs font-medium text-slate-500 hover:text-slate-800"
              >
                Tutup
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
