import React from 'react';
import { Calendar, Download, ExternalLink } from 'lucide-react';
import { Appointment } from '../../types';

interface CalendarExportProps {
  appointment: Appointment;
}

export const CalendarExport: React.FC<CalendarExportProps> = ({ appointment }) => {
  const downloadIcs = () => {
    const timeMatch = appointment.timeSlot.match(/(\d+):(\d+)\s*(AM|PM)/i);
    let hours = 10;
    let minutes = 0;
    if (timeMatch) {
      hours = parseInt(timeMatch[1], 10);
      minutes = parseInt(timeMatch[2], 10);
      if (timeMatch[3].toUpperCase() === 'PM' && hours < 12) hours += 12;
      if (timeMatch[3].toUpperCase() === 'AM' && hours === 12) hours = 0;
    }

    const pad = (n: number) => n.toString().padStart(2, '0');
    const [year, month, day] = appointment.date.split('-');

    const startDateStr = `${year}${month}${day}T${pad(hours)}${pad(minutes)}00`;
    const endHours = hours + Math.floor(appointment.durationMinutes / 60);
    const endMinutes = (minutes + (appointment.durationMinutes % 60)) % 60;
    const endDateStr = `${year}${month}${day}T${pad(endHours)}${pad(endMinutes)}00`;

    const summary = `Hope Community Support: ${appointment.serviceName}`;
    const description = `Appointment with Hope Community Support (${appointment.deliveryMethod}). Notes: ${appointment.notes || 'Routine appointment'}`;
    const location =
      appointment.deliveryMethod === 'office'
        ? '331 E Main Street Downtown, Suite 200, Rock Hill, SC 29730'
        : appointment.deliveryMethod === 'telehealth'
        ? appointment.telehealthLink || 'Telehealth Virtual Room'
        : 'In-Home Visit';

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Hope Community Support//Appointments//EN',
      'BEGIN:VEVENT',
      `UID:${appointment.id}@hopecommunitysupport.com`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART:${startDateStr}`,
      `DTEND:${endDateStr}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `HCS-Appointment-${appointment.date}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getGoogleCalendarUrl = () => {
    const timeMatch = appointment.timeSlot.match(/(\d+):(\d+)\s*(AM|PM)/i);
    let hours = 10;
    let minutes = 0;
    if (timeMatch) {
      hours = parseInt(timeMatch[1], 10);
      minutes = parseInt(timeMatch[2], 10);
      if (timeMatch[3].toUpperCase() === 'PM' && hours < 12) hours += 12;
      if (timeMatch[3].toUpperCase() === 'AM' && hours === 12) hours = 0;
    }
    const pad = (n: number) => n.toString().padStart(2, '0');
    const [year, month, day] = appointment.date.split('-');
    const startDateStr = `${year}${month}${day}T${pad(hours)}${pad(minutes)}00`;
    const endHours = hours + Math.floor(appointment.durationMinutes / 60);
    const endMinutes = (minutes + (appointment.durationMinutes % 60)) % 60;
    const endDateStr = `${year}${month}${day}T${pad(endHours)}${pad(endMinutes)}00`;

    const title = encodeURIComponent(`Hope Community Support: ${appointment.serviceName}`);
    const details = encodeURIComponent(`Appointment with Hope Community Support (${appointment.deliveryMethod}). Provider: ${appointment.providerName || 'Staff'}`);
    const location = encodeURIComponent(
      appointment.deliveryMethod === 'office'
        ? '331 E Main Street Downtown, Suite 200, Rock Hill, SC 29730'
        : 'Telehealth Room'
    );

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDateStr}/${endDateStr}&details=${details}&location=${location}`;
  };

  return (
    <div className="flex items-center gap-2 text-xs">
      <button
        onClick={downloadIcs}
        type="button"
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#F8F5EE] border border-[#A9C2B2]/60 text-[#173F3A] hover:bg-[#EFEAE0] transition-colors font-medium"
        title="Download .ics for Apple / Outlook / Google"
      >
        <Download className="w-3.5 h-3.5 text-[#216761]" />
        Export .ICS
      </button>
      <a
        href={getGoogleCalendarUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-[#F8F5EE] border border-[#A9C2B2]/60 text-[#173F3A] hover:bg-[#EFEAE0] transition-colors font-medium"
      >
        <Calendar className="w-3.5 h-3.5 text-[#216761]" />
        Google Calendar
        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
      </a>
    </div>
  );
};
