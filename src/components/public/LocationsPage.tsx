import React from 'react';
import { MapPin, Phone, Mail, Clock, Car, Bus, Video, Home, Shield, ExternalLink } from 'lucide-react';
import { EmergencyBanner } from '../common/EmergencyBanner';

interface LocationsPageProps {
  onOpenBooking: () => void;
}

export const LocationsPage: React.FC<LocationsPageProps> = ({ onOpenBooking }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <EmergencyBanner compact />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-xs font-bold text-[#216761] uppercase tracking-widest">
          Accessible Throughout South Carolina
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#173F3A] mt-1">
          Locations, In-Home Reach & Telehealth
        </h1>
        <p className="text-sm sm:text-base text-[#66736F] mt-3 leading-relaxed">
          From our downtown Rock Hill clinic to in-home care across the Piedmont and encrypted telehealth statewide, Hope Community Support is always within reach.
        </p>
      </div>

      {/* 3 Core Access Pillars */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Office */}
        <div className="bg-white rounded-2xl border border-[#A9C2B2]/40 p-8 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-[#173F3A] text-[#C6A66B] flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-xl text-[#173F3A] mb-2">
              Rock Hill Main Clinic
            </h3>
            <p className="text-xs text-[#66736F] leading-relaxed mb-6">
              Our peaceful downtown suite is fully accessible, ADA-compliant, and equipped with private consultation rooms designed for serenity.
            </p>

            <div className="space-y-3 text-xs text-[#202826] mb-6">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#216761] shrink-0 mt-0.5" />
                <span>
                  <strong>331 E Main Street Downtown</strong>
                  <br />
                  Suite 200, Rock Hill, SC 29730
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#216761] shrink-0" />
                <a href="tel:8037019332" className="hover:underline font-medium">803-701-9332</a>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-[#216761] shrink-0 mt-0.5" />
                <span>
                  Mon – Thu: 8:30 AM – 6:00 PM
                  <br />
                  Friday: 9:00 AM – 4:00 PM
                  <br />
                  Saturday: By Appointment
                </span>
              </div>
            </div>

            <div className="p-3 bg-[#F8F5EE] rounded-lg border border-[#A9C2B2]/30 text-[11px] text-[#66736F] space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-[#173F3A]">
                <Car className="w-3.5 h-3.5 text-[#216761]" />
                Parking & Transit
              </div>
              <p>Free client parking in designated rear spaces and street parking on East Main Street. Located 2 blocks from the downtown Rock Hill My Ride bus stop.</p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#F1ECE1]">
            <button
              onClick={onOpenBooking}
              className="w-full py-2.5 rounded-lg bg-[#216761] text-white text-xs font-bold hover:bg-[#173F3A] transition-colors"
            >
              Book Office Session
            </button>
          </div>
        </div>

        {/* In-Home Services */}
        <div className="bg-white rounded-2xl border border-[#A9C2B2]/40 p-8 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-[#216761] text-white flex items-center justify-center mb-4">
              <Home className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-xl text-[#173F3A] mb-2">
              In-Home Support Services
            </h3>
            <p className="text-xs text-[#66736F] leading-relaxed mb-6">
              When transportation, medical conditions, or family logistics make clinic travel burdensome, our credentialed staff bring behavioral support directly to your home.
            </p>

            <div className="space-y-3 text-xs text-[#202826] mb-6">
              <div>
                <strong className="text-[#173F3A] block mb-1">Primary Counties Served:</strong>
                <ul className="grid grid-cols-2 gap-1 text-[#66736F]">
                  <li>• York County</li>
                  <li>• Chester County</li>
                  <li>• Lancaster County</li>
                  <li>• Surrounding Areas</li>
                </ul>
              </div>
              <div className="pt-2">
                <strong className="text-[#173F3A] block mb-1">Safety & Confidentiality:</strong>
                <p className="text-[#66736F] leading-relaxed">
                  All in-home specialists undergo comprehensive criminal background reviews, DSS registry checks, and follow strict in-home safety and privacy protocols.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#F1ECE1]">
            <button
              onClick={onOpenBooking}
              className="w-full py-2.5 rounded-lg bg-[#216761] text-white text-xs font-bold hover:bg-[#173F3A] transition-colors"
            >
              Request In-Home Evaluation
            </button>
          </div>
        </div>

        {/* Telehealth */}
        <div className="bg-white rounded-2xl border border-[#A9C2B2]/40 p-8 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-[#173F3A] text-[#C6A66B] flex items-center justify-center mb-4">
              <Video className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-xl text-[#173F3A] mb-2">
              Statewide Telehealth
            </h3>
            <p className="text-xs text-[#66736F] leading-relaxed mb-6">
              Receive confidential clinical therapy and counseling from the comfort of your home or private office anywhere within the state of South Carolina.
            </p>

            <div className="space-y-3 text-xs text-[#202826] mb-6">
              <div className="p-3 bg-[#F8F5EE] rounded-lg border border-[#A9C2B2]/30 space-y-1">
                <span className="font-semibold text-[#173F3A] block">Zero Installation Required</span>
                <p className="text-[#66736F]">Join appointments with a single secure link sent directly via SMS or the client portal on iOS, Android, Mac, or Windows.</p>
              </div>
              <div>
                <strong className="text-[#173F3A] block mb-1">HIPAA & HITECH Compliant:</strong>
                <p className="text-[#66736F]">End-to-end encrypted audio/video feeds ensure your sessions remain 100% confidential and unrecorded.</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#F1ECE1]">
            <button
              onClick={onOpenBooking}
              className="w-full py-2.5 rounded-lg bg-[#216761] text-white text-xs font-bold hover:bg-[#173F3A] transition-colors"
            >
              Schedule Telehealth Visit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
