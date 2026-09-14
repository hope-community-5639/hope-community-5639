import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  Building,
  Home,
  MapPin,
  CheckCircle2,
  AlertCircle,
  X,
  Plus,
  RotateCcw,
  Sparkles,
  Wifi,
  ExternalLink,
} from 'lucide-react';
import { Appointment } from '../../../types';
import { StatusBadge } from '../../common/StatusBadge';
import { CalendarExport } from '../../common/CalendarExport';

interface AppointmentsViewProps {
  appointments: Appointment[];
  onRequestBooking: () => void;
  onJoinTelehealth: (apt: Appointment) => void;
  onOpenConnectionTest: () => void;
  onCancelAppointment: (apt: Appointment, reason: string) => void;
  onRescheduleRequest: (apt: Appointment) => void;
}

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({
  appointments,
  onRequestBooking,
  onJoinTelehealth,
  onOpenConnectionTest,
  onCancelAppointment,
  onRescheduleRequest,
}) => {
  const [filter, setFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [cancelModalApt, setCancelModalApt] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const nowStr = new Date().toISOString().split('T')[0];

  const upcomingList = appointments
    .filter((a) => a && !['client_canceled', 'staff_canceled', 'completed'].includes(a.status))
    .sort((a, b) => ((a.date || '') > (b.date || '') ? 1 : -1));

  const pastList = appointments
    .filter((a) => a && (['completed', 'client_canceled', 'staff_canceled'].includes(a.status) || a.date < nowStr))
    .sort((a, b) => ((a.date || '') < (b.date || '') ? 1 : -1));

  const displayList = filter === 'upcoming' ? upcomingList : filter === 'past' ? pastList : appointments;

  const handleConfirmCancel = () => {
    if (!cancelModalApt) return;
    onCancelAppointment(cancelModalApt, cancelReason || 'Canceled by client via portal');
    setCancelModalApt(null);
    setCancelReason('');
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-[#D9E1DC] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#216761]/10 text-[#216761] text-xs font-bold uppercase tracking-wider">
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Session Scheduling & Telehealth</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#173F3A]">
              My Appointments
            </h1>
            <p className="text-xs sm:text-sm text-[#5F6F6B] max-w-2xl leading-relaxed">
              View scheduled individual sessions, family consultations, and telehealth visits. Times are displayed in your local timezone: <strong>Eastern Time (US & Canada)</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onOpenConnectionTest}
              className="px-4 py-2.5 rounded-lg border border-[#D9E1DC] bg-[#F8F5EE] text-[#173F3A] text-xs font-semibold hover:bg-[#EFEAE0] transition-colors flex items-center gap-2"
            >
              <Wifi className="w-4 h-4 text-[#216761]" />
              <span>Test Audio/Video</span>
            </button>
            <button
              onClick={onRequestBooking}
              className="px-5 py-2.5 rounded-lg bg-[#216761] text-white text-xs font-bold hover:bg-[#173F3A] transition-colors shadow-xs flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-[#C6A66B]" />
              <span>Request Appointment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-[#D9E1DC] pb-4">
        <div className="flex items-center gap-2">
          {[
            { id: 'upcoming', label: `Upcoming (${upcomingList.length})` },
            { id: 'past', label: `History (${pastList.length})` },
            { id: 'all', label: `All (${appointments.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
                filter === tab.id
                  ? 'bg-[#173F3A] text-white'
                  : 'bg-white border border-[#D9E1DC] text-[#5F6F6B] hover:text-[#173F3A]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="hidden sm:block text-xs text-[#5F6F6B]">
          Cancellation policy: 24-hour advance notice required
        </div>
      </div>

      {/* Appointment Cards List */}
      {displayList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#D9E1DC] p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#F8F5EE] border border-[#D9E1DC] flex items-center justify-center mx-auto text-[#5F6F6B]">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-serif font-bold text-[#173F3A]">No {filter} appointments found</h3>
          <p className="text-xs text-[#5F6F6B] max-w-sm mx-auto">
            {filter === 'upcoming'
              ? 'You do not have any upcoming visits currently on your schedule.'
              : 'No past appointments on record.'}
          </p>
          <button
            onClick={onRequestBooking}
            className="px-4 py-2 rounded-lg bg-[#216761] text-white text-xs font-bold hover:bg-[#173F3A] transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-[#C6A66B]" />
            <span>Request an Appointment</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {displayList.map((apt) => {
            const isTelehealth = apt.deliveryMethod === 'telehealth';
            const isOffice = apt.deliveryMethod === 'office';
            const isCanceled = ['client_canceled', 'staff_canceled'].includes(apt.status);
            const isCompleted = apt.status === 'completed';

            return (
              <div
                key={apt.id}
                className={`bg-white rounded-2xl border p-6 sm:p-7 shadow-xs transition-all ${
                  isCanceled
                    ? 'border-[#D9E1DC] opacity-75'
                    : 'border-[#D9E1DC] hover:border-[#216761]/40'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left info */}
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <StatusBadge status={apt.status} />
                      <span className="text-xs font-bold uppercase tracking-wider text-[#5F6F6B]">
                        {apt.participantType} session
                      </span>
                      <span className="text-xs text-[#5F6F6B]">• {apt.durationMinutes} min</span>
                    </div>

                    <div>
                      <h3 className="text-xl font-serif font-bold text-[#173F3A]">
                        {apt.serviceName}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#5F6F6B] mt-0.5">
                        Provider: <strong className="text-[#17312E]">{apt.providerName || 'Dr. Sarah Jenkins, LPC'}</strong>
                      </p>
                    </div>

                    {/* Modality and Location */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#17312E]">
                      <div className="flex items-center gap-1.5 font-medium">
                        {isTelehealth ? (
                          <Video className="w-4 h-4 text-[#216761]" />
                        ) : isOffice ? (
                          <Building className="w-4 h-4 text-[#216761]" />
                        ) : (
                          <Home className="w-4 h-4 text-[#216761]" />
                        )}
                        <span className="capitalize">{apt.deliveryMethod}</span>
                      </div>

                      {isOffice && (
                        <div className="flex items-center gap-1.5 text-[#5F6F6B]">
                          <MapPin className="w-3.5 h-3.5 text-[#C6A66B]" />
                          <span>Downtown Clinic Suite 200, 331 E Main St, Rock Hill, SC</span>
                        </div>
                      )}

                      {isTelehealth && (
                        <span className="text-[#216761] font-medium">
                          Encrypted HIPAA-Aligned Video Portal
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Middle: Date & Time */}
                  <div className="lg:border-l lg:border-r border-[#D9E1DC] lg:px-8 py-2 lg:py-0 shrink-0">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#5F6F6B] mb-1">
                      Session Schedule
                    </div>
                    <div className="text-lg font-serif font-bold text-[#173F3A]">
                      {apt.date}
                    </div>
                    <div className="text-xs font-semibold text-[#216761] flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{apt.timeSlot} EST</span>
                    </div>
                  </div>

                  {/* Right actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end justify-center gap-2.5 shrink-0">
                    {!isCanceled && !isCompleted && isTelehealth && (
                      <button
                        onClick={() => onJoinTelehealth(apt)}
                        className="px-5 py-2.5 rounded-lg bg-[#216761] text-white text-xs font-bold hover:bg-[#173F3A] transition-colors flex items-center justify-center gap-2 shadow-xs"
                      >
                        <Video className="w-4 h-4 text-[#C6A66B]" />
                        <span>Join Telehealth Room</span>
                      </button>
                    )}

                    {!isCanceled && !isCompleted && (
                      <div className="flex items-center gap-2">
                        <CalendarExport appointment={apt} />
                        <button
                          onClick={() => setCancelModalApt(apt)}
                          className="px-3 py-2 rounded-lg border border-[#D9E1DC] bg-white text-xs font-semibold text-[#B3392F] hover:bg-red-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    {isCanceled && (
                      <div className="text-xs text-[#B3392F] font-medium italic">
                        Canceled: {apt.cancellationReason || 'Client request'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancelModalApt && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17312E]/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#D9E1DC] p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#B3392F]">
                <AlertCircle className="w-5 h-5" />
                <h3 className="font-serif font-bold text-lg">Cancel Appointment</h3>
              </div>
              <button
                onClick={() => setCancelModalApt(null)}
                className="text-[#5F6F6B] hover:text-[#173F3A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#5F6F6B] leading-relaxed">
              Are you sure you want to cancel your session on{' '}
              <strong className="text-[#17312E]">{cancelModalApt.date} at {cancelModalApt.timeSlot}</strong>? Hope Community Support requests 24 hours notice when possible.
            </p>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5F6F6B] mb-1">
                Reason for cancellation (optional):
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                placeholder="Brief reason or scheduling conflict..."
                className="w-full text-xs p-3 rounded-lg border border-[#D9E1DC] focus:border-[#216761] focus:ring-1 focus:ring-[#216761] outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setCancelModalApt(null)}
                className="px-4 py-2 rounded-lg border border-[#D9E1DC] text-xs font-semibold text-[#17312E] hover:bg-[#F8F5EE]"
              >
                Keep Appointment
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-2 rounded-lg bg-[#B3392F] text-white text-xs font-bold hover:bg-[#8C2C24]"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
