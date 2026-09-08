import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbStore } from '../../db/store';
import { INITIAL_SERVICES } from '../../db/initialData';
import { DeliveryMethod } from '../../types';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  Video,
  Home,
  Building,
  ArrowRight,
  Shield,
  Download,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { CalendarExport } from '../common/CalendarExport';

interface AppointmentBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledServiceName?: string;
  prefilledProviderName?: string;
}

export const AppointmentBookingModal: React.FC<AppointmentBookingModalProps> = ({
  isOpen,
  onClose,
  prefilledServiceName,
  prefilledProviderName,
}) => {
  const { currentUser } = useAuth();

  const [step, setStep] = useState<number>(1);
  const [selectedService, setSelectedService] = useState<string>(
    prefilledServiceName || INITIAL_SERVICES[0].name
  );
  const [selectedFormat, setSelectedFormat] = useState<DeliveryMethod>('office');
  const [selectedProvider, setSelectedProvider] = useState<string>(
    prefilledProviderName || 'Dr. Sarah Jenkins'
  );
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('10:00 AM');
  const [clientNotes, setClientNotes] = useState<string>('');

  // Guest fields if not logged in
  const [guestName, setGuestName] = useState<string>('');
  const [guestEmail, setGuestEmail] = useState<string>('');
  const [guestPhone, setGuestPhone] = useState<string>('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdAppointment, setCreatedAppointment] = useState<any | null>(null);

  const availableSlots = [
    '09:00 AM',
    '10:00 AM',
    '11:30 AM',
    '01:30 PM',
    '02:30 PM',
    '03:45 PM',
    '04:45 PM',
  ];

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      const activeUser = currentUser || {
        id: `guest_${Date.now()}`,
        firstName: guestName.split(' ')[0] || 'Community',
        lastName: guestName.split(' ')[1] || 'Client',
        email: guestEmail || 'guest@hopecommunitysupport.com',
        role: 'client' as const,
        phone: guestPhone,
        status: 'active' as const,
        mfaEnabled: false,
        createdAt: new Date().toISOString(),
      };

      const matchedService = INITIAL_SERVICES.find((s) => s.name === selectedService);
      const token = typeof window !== 'undefined' ? localStorage.getItem('hcs_auth_token') : null;

      if (token) {
        try {
          const apiRes = await fetch('/api/appointments', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              serviceId: matchedService ? matchedService.id : 'srv_01',
              serviceName: selectedService,
              deliveryMethod: selectedFormat,
              participantType: 'individual',
              appointmentDate: selectedDate,
              timeSlot: selectedTimeSlot,
              notes: clientNotes,
            }),
          });
          if (apiRes.status === 409) {
            const conflict = await apiRes.json();
            throw new Error(conflict.error || 'This appointment slot is already booked.');
          }
        } catch (apiErr: any) {
          if (apiErr.message?.includes('booked') || apiErr.message?.includes('slot')) {
            throw apiErr;
          }
        }
      }

      const newApt = dbStore.createAppointment(
        {
          clientId: activeUser.id,
          clientName: `${activeUser.firstName} ${activeUser.lastName}`,
          clientEmail: activeUser.email,
          clientPhone: activeUser.phone,
          serviceId: matchedService ? matchedService.id : 'srv_01',
          serviceName: selectedService,
          providerId: selectedProvider.includes('Jenkins') ? 'usr_provider_1' : 'usr_provider_2',
          providerName: selectedProvider,
          date: selectedDate,
          timeSlot: selectedTimeSlot,
          durationMinutes: matchedService ? matchedService.durationMinutes : 50,
          deliveryMethod: selectedFormat,
          participantType: 'individual',
          notes: clientNotes,
        },
        activeUser
      );

      setCreatedAppointment(newApt);
      setStep(3); // Success step
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while booking appointment.');
    }
  };

  const handleResetAndClose = () => {
    setStep(1);
    setCreatedAppointment(null);
    setErrorMsg(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetAndClose}
      title={step === 3 ? 'Appointment Requested' : 'Schedule an Appointment'}
      subtitle={step === 3 ? 'Confirmation details and calendar export' : 'Hope Community Support • Confidential Care'}
      maxWidth="xl"
    >
      {step === 3 && createdAppointment ? (
        <div className="space-y-6 py-2">
          <div className="p-6 bg-[#216761]/10 border border-[#216761]/30 rounded-xl text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#216761] text-white flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="font-serif font-bold text-xl text-[#173F3A]">
              Appointment Request Submitted!
            </h4>
            <p className="text-xs text-[#66736F] max-w-md mx-auto leading-relaxed">
              Your appointment request for <strong>{createdAppointment.serviceName}</strong> has been logged into our clinical calendar. Our intake coordinator will review and confirm your details.
            </p>
          </div>

          {/* Appointment Summary Card */}
          <div className="bg-[#F8F5EE] rounded-xl p-5 border border-[#A9C2B2]/40 text-xs space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[#66736F] block">Service:</span>
                <strong className="text-[#173F3A] font-serif text-sm">{createdAppointment.serviceName}</strong>
              </div>
              <div>
                <span className="text-[#66736F] block">Provider:</span>
                <strong className="text-[#173F3A]">{createdAppointment.providerName}</strong>
              </div>
              <div>
                <span className="text-[#66736F] block">Date & Time:</span>
                <strong className="text-[#173F3A]">{createdAppointment.date} at {createdAppointment.timeSlot}</strong>
              </div>
              <div>
                <span className="text-[#66736F] block">Format:</span>
                <strong className="text-[#173F3A] capitalize">{createdAppointment.deliveryMethod}</strong>
              </div>
            </div>

            {createdAppointment.telehealthLink && (
              <div className="p-2.5 bg-white rounded border border-[#A9C2B2]/40 mt-2">
                <span className="text-[11px] font-bold text-[#216761] block">Secure Telehealth Room:</span>
                <span className="text-xs font-mono text-[#173F3A] break-all">{createdAppointment.telehealthLink}</span>
              </div>
            )}

            {createdAppointment.deliveryMethod === 'office' && (
              <div className="p-2.5 bg-white rounded border border-[#A9C2B2]/40 mt-2">
                <span className="text-[11px] font-bold text-[#216761] block">Office Location:</span>
                <span className="text-xs text-[#173F3A]">331 E Main Street Downtown, Suite 200, Rock Hill, SC 29730</span>
              </div>
            )}
          </div>

          {/* Calendar Export */}
          <div className="border-t border-[#F1ECE1] pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-[#173F3A] block">Add to Your Calendar:</span>
              <p className="text-[11px] text-[#66736F]">Never miss your session time.</p>
            </div>
            <CalendarExport appointment={createdAppointment} />
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={handleResetAndClose}
              className="px-6 py-2.5 bg-[#173F3A] text-white text-xs font-bold rounded-lg hover:bg-[#216761] transition-colors"
            >
              Done & View Portal
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleBooking} className="space-y-6">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Step indicator */}
          <div className="flex items-center justify-between border-b border-[#F1ECE1] pb-3 text-xs">
            <span className={`font-semibold ${step === 1 ? 'text-[#216761]' : 'text-[#66736F]'}`}>
              1. Service & Format
            </span>
            <span className="text-[#C6A66B]">→</span>
            <span className={`font-semibold ${step === 2 ? 'text-[#216761]' : 'text-[#66736F]'}`}>
              2. Date, Time & Details
            </span>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              {/* Service Selection */}
              <div>
                <label className="block text-xs font-semibold text-[#173F3A] mb-1.5">
                  Select Service Modality *
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-[#A9C2B2]/60 focus:ring-2 focus:ring-[#216761] focus:outline-none"
                >
                  {INITIAL_SERVICES.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.durationMinutes} min)
                    </option>
                  ))}
                </select>
              </div>

              {/* Delivery Format */}
              <div>
                <label className="block text-xs font-semibold text-[#173F3A] mb-1.5">
                  Preferred Delivery Method *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedFormat('office')}
                    className={`p-3 rounded-lg border text-left text-xs transition-colors flex flex-col justify-between ${
                      selectedFormat === 'office'
                        ? 'bg-[#216761]/10 border-[#216761] text-[#173F3A] font-bold'
                        : 'border-[#A9C2B2]/50 hover:bg-[#F8F5EE]'
                    }`}
                  >
                    <Building className="w-4 h-4 mb-2 text-[#216761]" />
                    <span>In-Office</span>
                    <span className="text-[10px] text-[#66736F] font-normal">Rock Hill Clinic</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedFormat('telehealth')}
                    className={`p-3 rounded-lg border text-left text-xs transition-colors flex flex-col justify-between ${
                      selectedFormat === 'telehealth'
                        ? 'bg-[#216761]/10 border-[#216761] text-[#173F3A] font-bold'
                        : 'border-[#A9C2B2]/50 hover:bg-[#F8F5EE]'
                    }`}
                  >
                    <Video className="w-4 h-4 mb-2 text-[#216761]" />
                    <span>Telehealth</span>
                    <span className="text-[10px] text-[#66736F] font-normal">Secure Video</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedFormat('in_home')}
                    className={`p-3 rounded-lg border text-left text-xs transition-colors flex flex-col justify-between ${
                      selectedFormat === 'in_home'
                        ? 'bg-[#216761]/10 border-[#216761] text-[#173F3A] font-bold'
                        : 'border-[#A9C2B2]/50 hover:bg-[#F8F5EE]'
                    }`}
                  >
                    <Home className="w-4 h-4 mb-2 text-[#216761]" />
                    <span>In-Home</span>
                    <span className="text-[10px] text-[#66736F] font-normal">York & SC</span>
                  </button>
                </div>
              </div>

              {/* Provider Selection */}
              <div>
                <label className="block text-xs font-semibold text-[#173F3A] mb-1.5">
                  Requested Provider (Optional)
                </label>
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-[#A9C2B2]/60 focus:ring-2 focus:ring-[#216761] focus:outline-none"
                >
                  <option value="Dr. Sarah Jenkins">Dr. Sarah Jenkins (Ph.D., LPC - Clinical Director)</option>
                  <option value="Marcus Vance">Marcus Vance (MSW, LISW-CP - Family Intervention)</option>
                  <option value="Any Available Provider">First Available Licensed Provider</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-lg bg-[#216761] text-white text-xs font-bold hover:bg-[#173F3A] inline-flex items-center gap-1.5"
                >
                  Continue to Schedule
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {/* Date & Time Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                    Select Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={selectedDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-[#A9C2B2]/60 focus:ring-2 focus:ring-[#216761] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                    Available Time Slot *
                  </label>
                  <select
                    value={selectedTimeSlot}
                    onChange={(e) => setSelectedTimeSlot(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-[#A9C2B2]/60 focus:ring-2 focus:ring-[#216761] focus:outline-none"
                  >
                    {availableSlots.map((slot) => {
                      const isAvailable = dbStore.isSlotAvailable(selectedDate, slot);
                      return (
                        <option key={slot} value={slot} disabled={!isAvailable}>
                          {slot} {!isAvailable ? '(Unavailable - Booked)' : '(Open)'}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Guest client fields if unauthenticated */}
              {!currentUser && (
                <div className="p-4 bg-[#F8F5EE] rounded-xl border border-[#A9C2B2]/40 space-y-3">
                  <span className="text-xs font-bold text-[#173F3A] block">
                    Client Contact Details
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#173F3A] mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="Eleanor Vance"
                        className="w-full px-2.5 py-1.5 text-xs bg-white rounded border border-[#A9C2B2]/60 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#173F3A] mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="client@example.com"
                        className="w-full px-2.5 py-1.5 text-xs bg-white rounded border border-[#A9C2B2]/60 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#173F3A] mb-1">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        placeholder="(803) 555-0199"
                        className="w-full px-2.5 py-1.5 text-xs bg-white rounded border border-[#A9C2B2]/60 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Client Notes */}
              <div>
                <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                  Reason for Visit / Any Specific Requests
                </label>
                <textarea
                  rows={3}
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                  placeholder="Share any background details you'd like your provider to know..."
                  className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-[#A9C2B2]/60 focus:ring-2 focus:ring-[#216761] focus:outline-none"
                />
              </div>

              <div className="p-2.5 bg-white rounded border border-[#A9C2B2]/30 text-[11px] text-[#66736F] flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#216761] shrink-0" />
                <span>
                  <strong>24-Hour Notice Policy:</strong> Cancellations must be submitted at least 24 hours in advance via your portal or by calling (803) 701-9332.
                </span>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-semibold text-[#66736F] hover:text-[#173F3A]"
                >
                  ← Back to Services
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-[#216761] text-white text-xs font-bold hover:bg-[#173F3A] transition-colors"
                >
                  Confirm & Request Appointment
                </button>
              </div>
            </div>
          )}
        </form>
      )}
    </Modal>
  );
};
