import React from 'react';
import { AppointmentStatus, ServiceRequestStatus } from '../../types';

interface StatusBadgeProps {
  status: AppointmentStatus | ServiceRequestStatus | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let bg = 'bg-gray-100 text-gray-800 border-gray-200';
  let label = status.replace(/_/g, ' ');

  switch (status) {
    case 'confirmed':
    case 'completed':
    case 'approved':
    case 'active':
      bg = 'bg-[#216761]/15 text-[#173F3A] border-[#216761]/30 font-semibold';
      break;
    case 'requested':
    case 'submitted':
    case 'under_review':
    case 'pending_review':
      bg = 'bg-amber-50 text-amber-900 border-amber-300 font-medium';
      break;
    case 'rescheduled':
    case 'assigned':
    case 'checked_in':
      bg = 'bg-sky-50 text-sky-900 border-sky-300 font-medium';
      break;
    case 'client_canceled':
    case 'staff_canceled':
    case 'no_show':
    case 'declined':
    case 'suspended':
      bg = 'bg-rose-50 text-rose-800 border-rose-200 font-medium';
      break;
    case 'more_info_required':
    case 'additional_info_needed':
      bg = 'bg-orange-50 text-orange-900 border-orange-300 font-medium';
      break;
    default:
      bg = 'bg-[#F8F5EE] text-[#202826] border-[#A9C2B2]/40';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border capitalize tracking-wide ${bg}`}>
      {label}
    </span>
  );
};
