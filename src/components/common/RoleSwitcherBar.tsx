import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { UserCheck, RefreshCw, Shield, ChevronDown, LogOut, Check } from 'lucide-react';
import { dbStore } from '../../db/store';

interface RoleOption {
  role: UserRole;
  label: string;
  name: string;
  badge: string;
}

interface RoleSwitcherBarProps {
  onSwitchRole?: (role: UserRole | 'guest') => void;
}

export const RoleSwitcherBar: React.FC<RoleSwitcherBarProps> = ({ onSwitchRole }) => {
  const { currentUser, quickSwitchRole, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Hide completely in production unless explicitly enabled via ?demo=true
  const isDemoMode = typeof window !== 'undefined' && window.location.search.includes('demo=true');
  if (import.meta.env.PROD && !isDemoMode) {
    return null;
  }

  const roles: RoleOption[] = [
    { role: 'client', label: 'Client', name: 'Eleanor Vance', badge: 'Client' },
    { role: 'parent_guardian', label: 'Parent / Guardian', name: 'Marcus Chen', badge: 'Family' },
    { role: 'provider', label: 'Staff Provider (LPC)', name: 'Dr. Sarah Jenkins', badge: 'Clinical' },
    { role: 'intake_coordinator', label: 'Intake Coordinator', name: 'Maria Santos', badge: 'Intake' },
    { role: 'super_admin', label: 'Executive Administrator', name: 'David Ross', badge: 'Admin' },
  ];

  // Close dropdown on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleResetData = () => {
    if (window.confirm('Reset all demo data back to default initial records?')) {
      dbStore.resetToFactoryDemo();
      window.location.reload();
    }
  };

  const currentRoleName = currentUser
    ? `${currentUser.firstName} ${currentUser.lastName} (${currentUser.role.replace('_', ' ')})`
    : 'Public Guest / Visitor';

  return (
    <div
      id="dev-utility-bar"
      className="relative z-50 h-[34px] bg-[#102D29] text-white border-b border-[#216761]/50 text-xs select-none"
      role="region"
      aria-label="Development Role & Persona Controls"
    >
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 xl:px-10 h-full flex items-center justify-between gap-3">
        {/* Left: Active Role Indicator */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#C6A66B] shrink-0">
            <Shield className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Active Persona:</span>
          </span>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#173F3A] border border-[#216761] text-white font-mono text-[11px] truncate max-w-[200px] xs:max-w-[280px] sm:max-w-[380px]">
            <UserCheck className="w-3 h-3 text-[#C6A66B] shrink-0" aria-hidden="true" />
            <span className="truncate">{currentRoleName}</span>
          </div>
        </div>

        {/* Right: Controls & Persona Selector */}
        <div className="flex items-center gap-2 shrink-0" ref={menuRef}>
          {/* Reset Demo Data Button */}
          <button
            type="button"
            onClick={handleResetData}
            title="Reset storage to default test records"
            className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded border border-[#216761] text-[11px] text-[#A9C2B2] hover:text-[#C6A66B] hover:border-[#C6A66B]/50 transition-colors focus-visible:ring-1 focus-visible:ring-[#C6A66B] focus-visible:outline-none"
          >
            <RefreshCw className="w-2.5 h-2.5" aria-hidden="true" />
            <span>Reset Demo Data</span>
          </button>

          {/* Switch Persona Trigger */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-haspopup="true"
            aria-label="Switch test user persona"
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#173F3A] hover:bg-[#216761] border border-[#216761] text-white text-[11px] font-medium transition-colors focus-visible:ring-1 focus-visible:ring-[#C6A66B] focus-visible:outline-none"
          >
            <span className="hidden xs:inline text-[#C6A66B]">Switch Persona</span>
            <span className="xs:hidden text-[#C6A66B]">Switch</span>
            <ChevronDown
              className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>

          {/* Floating Dropdown Menu */}
          {isOpen && (
            <div
              className="absolute top-[34px] right-6 sm:right-8 xl:right-10 w-72 sm:w-80 bg-[#173F3A] border border-[#216761] rounded-xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-1 duration-150 text-white"
              role="menu"
              aria-orientation="vertical"
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#216761]">
                <span className="text-[11px] font-bold text-[#C6A66B] uppercase tracking-wider">
                  Test Personas (RBAC)
                </span>
                <span className="text-[10px] text-[#A9C2B2]">Click to preview</span>
              </div>

              <div className="space-y-1">
                {roles.map((item) => {
                  const isSelected = currentUser?.role === item.role;
                  return (
                    <button
                      key={item.role}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        quickSwitchRole(item.role);
                        if (onSwitchRole) onSwitchRole(item.role);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'bg-[#C6A66B] text-[#173F3A] font-bold shadow-xs'
                          : 'text-[#F8F5EE] hover:bg-[#216761]'
                      }`}
                    >
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold truncate">{item.name}</span>
                          <span
                            className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-mono ${
                              isSelected ? 'bg-[#173F3A] text-[#C6A66B]' : 'bg-[#102D29] text-[#A9C2B2]'
                            }`}
                          >
                            {item.badge}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] truncate ${
                            isSelected ? 'text-[#173F3A]/80' : 'text-[#A9C2B2]'
                          }`}
                        >
                          {item.label}
                        </span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 shrink-0 text-[#173F3A]" />}
                    </button>
                  );
                })}
              </div>

              {/* Guest & Reset actions */}
              <div className="pt-2 mt-2 border-t border-[#216761] flex items-center justify-between gap-2">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    logout();
                    if (onSwitchRole) onSwitchRole('guest');
                    setIsOpen(false);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] text-rose-300 hover:text-rose-100 px-2 py-1 rounded hover:bg-rose-950/40 transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Sign Out to Guest</span>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    handleResetData();
                    setIsOpen(false);
                  }}
                  className="md:hidden inline-flex items-center gap-1 text-[11px] text-[#A9C2B2] hover:text-[#C6A66B] px-2 py-1 rounded hover:bg-[#216761]/40 transition-colors"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                  <span>Reset Data</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
