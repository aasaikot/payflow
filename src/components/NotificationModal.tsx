import React, { useState } from 'react';
import {
  X,
  Bell,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  ShieldAlert,
  FileText,
  CheckCheck,
  Trash2,
  Clock,
} from 'lucide-react';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'salary' | 'bonus' | 'deduction' | 'slip' | 'system';
  read: boolean;
  amount?: number;
}

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'August 2026 Salary Disbursed',
    message: 'Your monthly net salary of ৳52,345.00 has been credited successfully.',
    time: '2 hours ago',
    type: 'salary',
    read: false,
    amount: 52345,
  },
  {
    id: 'n2',
    title: 'Overtime Allowance Added',
    message: '৳4,500.00 overtime compensation has been approved and added to your pay slip.',
    time: 'Yesterday, 4:30 PM',
    type: 'bonus',
    read: false,
    amount: 4500,
  },
  {
    id: 'n3',
    title: 'Income Tax Deduction (TDS)',
    message: 'Standard statutory tax deduction ৳2,200.00 was recorded for the current pay cycle.',
    time: 'Aug 28, 2026',
    type: 'deduction',
    read: true,
    amount: 2200,
  },
  {
    id: 'n4',
    title: 'July 2026 Pay Slip Generated',
    message: 'Official digitally verified monthly salary slip is ready for download in PDF format.',
    time: 'Aug 01, 2026',
    type: 'slip',
    read: true,
  },
  {
    id: 'n5',
    title: 'Security Audit & Cloud Backup',
    message: 'Your salary ledger database was securely backed up to Firebase Cloud Storage.',
    time: 'Jul 25, 2026',
    type: 'system',
    read: true,
  },
];

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  setNotifications: React.Dispatch<React.SetStateAction<NotificationItem[]>>;
  onNavigateToRecord?: (monthId?: string) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  setNotifications,
  onNavigateToRecord,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredList =
    filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'salary':
        return <DollarSign size={18} className="text-[#008F5B]" />;
      case 'bonus':
        return <TrendingUp size={18} className="text-[#008F5B]" />;
      case 'deduction':
        return <ShieldAlert size={18} className="text-[#D83B3B]" />;
      case 'slip':
        return <FileText size={18} className="text-[#0284C7]" />;
      default:
        return <CheckCircle2 size={18} className="text-[#008F5B]" />;
    }
  };

  const getIconBg = (type: NotificationItem['type']) => {
    switch (type) {
      case 'salary':
        return 'bg-[#E8F7F0] border-[#C8EADB]';
      case 'bonus':
        return 'bg-[#E6F8F0] border-[#BDEBD5]';
      case 'deduction':
        return 'bg-[#FFF0F0] border-[#FCD4D4]';
      case 'slip':
        return 'bg-[#F0F9FF] border-[#BAE6FD]';
      default:
        return 'bg-[#F4F6F5] border-[#E2E8E5]';
    }
  };

  return (
    <div
      id="notification-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="notification-modal-sheet"
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-[#E2ECE7] flex flex-col max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom-6 duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#EDF3F0] flex items-center justify-between bg-gradient-to-b from-[#FAFDFB] to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#E8F7F0] border border-[#C5EBDB] flex items-center justify-center text-[#008F5B]">
              <Bell size={20} className="stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[17px] font-black text-[#17211D] tracking-tight">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[#D83B3B] text-white text-[10px] font-black">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="text-[11.5px] text-[#6E7974] font-medium">Salary updates & pay slips</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F0F5F2] hover:bg-[#E2ECE7] flex items-center justify-center text-[#4A5550] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Filter & Action Bar */}
        <div className="px-4 py-2.5 bg-[#F8FAF9] border-b border-[#EDF3F0] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-[#008F5B] text-white shadow-xs'
                  : 'bg-white text-[#5C6E66] border border-[#E2ECE7] hover:bg-[#E8F7F0]'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                filter === 'unread'
                  ? 'bg-[#008F5B] text-white shadow-xs'
                  : 'bg-white text-[#5C6E66] border border-[#E2ECE7] hover:bg-[#E8F7F0]'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {notifications.length > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1 text-[11px] font-bold text-[#008F5B] hover:text-[#007047] transition-colors cursor-pointer"
            >
              <CheckCheck size={14} />
              Mark all read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
          {filteredList.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center px-4">
              <div className="w-14 h-14 rounded-full bg-[#F0F7F4] flex items-center justify-center text-[#9BB1A6] mb-3">
                <Bell size={24} />
              </div>
              <h4 className="text-sm font-bold text-[#2A3631]">No notifications found</h4>
              <p className="text-xs text-[#7A8A83] mt-1">You are all caught up with your salary records!</p>
            </div>
          ) : (
            filteredList.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleRead(item.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer relative flex items-start gap-3 ${
                  !item.read
                    ? 'bg-[#F5FAF7] border-[#C8EADB] shadow-xs'
                    : 'bg-white border-[#E8EFEA] hover:bg-[#F9FBFA]'
                }`}
              >
                {/* Type Icon */}
                <div
                  className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${getIconBg(
                    item.type
                  )}`}
                >
                  {getIcon(item.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h4
                      className={`text-[13px] tracking-tight truncate ${
                        !item.read ? 'font-black text-[#17211D]' : 'font-bold text-[#4A5550]'
                      }`}
                    >
                      {item.title}
                    </h4>
                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-[#008F5B] shrink-0" />
                    )}
                  </div>

                  <p className="text-[11.5px] text-[#5C6E66] leading-relaxed line-clamp-2">
                    {item.message}
                  </p>

                  <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-[#8C9B94] font-semibold">
                    <Clock size={11} />
                    <span>{item.time}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 bg-[#FAFDFB] border-t border-[#EDF3F0] flex items-center justify-between text-[11px] text-[#6E7974] px-4">
            <span>Showing latest PayFlow activity</span>
            <button
              onClick={clearAll}
              className="text-[#D83B3B] hover:text-[#B52525] font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Trash2 size={12} />
              Clear all
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
