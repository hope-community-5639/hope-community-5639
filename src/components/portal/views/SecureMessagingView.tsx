import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Shield,
  Clock,
  Paperclip,
  CheckCheck,
  Download,
  AlertCircle,
  PhoneCall,
  UserCheck,
} from 'lucide-react';
import { Conversation, SecureMessage, User } from '../../../types';

interface SecureMessagingViewProps {
  conversations: Conversation[];
  selectedConversationId: string;
  onSelectConversation: (id: string) => void;
  messages: SecureMessage[];
  onSendMessage: (text: string) => void;
  currentUser: User | null;
  onOpenCrisisModal: () => void;
}

export const SecureMessagingView: React.FC<SecureMessagingViewProps> = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  messages,
  onSendMessage,
  currentUser,
  onOpenCrisisModal,
}) => {
  const [inputText, setInputText] = useState('');

  const currentConv = conversations.find((c) => c.id === selectedConversationId) || conversations[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-[#D9E1DC] p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#216761]/10 text-[#216761] text-xs font-bold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" />
              <span>End-to-End Encrypted Clinical Channel</span>
            </div>
            <h1 className="text-2xl font-serif font-bold text-[#173F3A]">
              Secure Provider Communications
            </h1>
            <p className="text-xs text-[#5F6F6B]">
              Direct communication with your primary therapist, behavioral specialist, and care coordinator.
            </p>
          </div>

          <button
            onClick={onOpenCrisisModal}
            className="px-4 py-2 rounded-lg bg-[#B3392F]/10 border border-[#B3392F]/30 text-[#B3392F] text-xs font-bold hover:bg-[#B3392F]/20 transition-colors flex items-center gap-2 self-start md:self-auto"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Crisis Notice: Dial 988</span>
          </button>
        </div>
      </div>

      {/* Communications Window Container */}
      <div className="bg-white rounded-2xl border border-[#D9E1DC] shadow-xs overflow-hidden flex flex-col md:flex-row min-h-[560px]">
        {/* Left: Threads list */}
        <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-[#D9E1DC] bg-[#F8F5EE]/50 flex flex-col shrink-0">
          <div className="p-4 border-b border-[#D9E1DC] flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5F6F6B]">
              Care Team Conversations
            </span>
            <span className="text-[11px] font-mono text-[#5F6F6B]">
              {conversations.length} Active
            </span>
          </div>

          <div className="divide-y divide-[#D9E1DC]/60 overflow-y-auto flex-1">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#5F6F6B]">
                No conversation threads yet.
              </div>
            ) : (
              conversations.map((conv) => {
                const isSelected = conv.id === currentConv?.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => onSelectConversation(conv.id)}
                    className={`w-full text-left p-4 transition-colors ${
                      isSelected
                        ? 'bg-white border-l-4 border-l-[#216761] shadow-2xs'
                        : 'hover:bg-[#EFEAE0]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#173F3A] truncate">
                        {conv.staffName || (conv as any).participantNames?.join(', ') || 'Clinical Care Team'}
                      </span>
                      {conv.unreadCountClient && conv.unreadCountClient > 0 ? (
                        <span className="w-4 h-4 rounded-full bg-[#B3392F] text-white text-[10px] font-bold flex items-center justify-center">
                          {conv.unreadCountClient}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-[11px] text-[#5F6F6B] truncate">
                      {conv.lastMessage || 'Secure conversation active'}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-[#5F6F6B] mt-1.5 font-mono">
                      <Clock className="w-3 h-3 text-[#216761]" />
                      <span>{conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleDateString() : 'Active'}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="p-3 border-t border-[#D9E1DC] bg-[#F8F5EE] text-[11px] text-[#5F6F6B] text-center">
            Standard response: 1 business day
          </div>
        </div>

        {/* Right: Message history & composer */}
        <div className="flex-1 flex flex-col justify-between min-h-[460px]">
          {/* Active recipient header */}
          <div className="p-4 border-b border-[#D9E1DC] bg-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#173F3A] text-white flex items-center justify-center font-serif font-bold text-xs">
                SJ
              </div>
              <div>
                <h3 className="text-sm font-serif font-bold text-[#173F3A]">
                  Dr. Sarah Jenkins, LPC (Primary Care Coordinator)
                </h3>
                <div className="flex items-center gap-1.5 text-[11px] text-[#216761]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Licensed Provider Verified • Routine Inquiries Only</span>
                </div>
              </div>
            </div>
          </div>

          {/* Messages list */}
          <div className="flex-1 p-5 space-y-4 overflow-y-auto max-h-[380px] bg-[#F8F5EE]/20">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-2 text-[#5F6F6B]">
                <MessageSquare className="w-8 h-8 text-[#216761]/40" />
                <p className="text-xs font-semibold text-[#17312E]">No messages yet in this conversation</p>
                <p className="text-[11px] max-w-sm">
                  Send non-urgent questions about session scheduling, care plan goals, or homework exercises.
                </p>
              </div>
            ) : (
              messages.map((m) => {
                const isMine = m.senderId === currentUser?.id;
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-lg p-4 rounded-2xl text-xs leading-relaxed ${
                        isMine
                          ? 'bg-[#216761] text-white rounded-br-xs shadow-2xs'
                          : 'bg-white text-[#17312E] rounded-bl-xs border border-[#D9E1DC] shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 mb-1 text-[11px] font-semibold opacity-80">
                        <span>{m.senderName}</span>
                        <span className="text-[10px] font-mono opacity-70">
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="whitespace-pre-line">{m.content}</p>

                      {m.attachmentName && (
                        <div className="mt-2.5 pt-2 border-t border-white/20 flex items-center gap-2 text-[11px] font-mono">
                          <Download className="w-3.5 h-3.5" />
                          <span>{m.attachmentName} ({m.attachmentSize || '140 KB'})</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Input form */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-[#D9E1DC] bg-white space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your confidential clinical inquiry..."
                className="flex-1 text-xs p-3 rounded-xl border border-[#D9E1DC] bg-[#F8F5EE] focus:border-[#216761] focus:ring-1 focus:ring-[#216761] outline-none"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="px-5 py-3 rounded-xl bg-[#216761] text-white text-xs font-bold hover:bg-[#173F3A] transition-colors disabled:opacity-40 flex items-center gap-2 shadow-2xs shrink-0"
              >
                <Send className="w-3.5 h-3.5 text-[#C6A66B]" />
                <span>Send</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#5F6F6B] px-1">
              <span>Do not use for emergencies. Call 988 for crisis support.</span>
              <span className="font-mono">256-bit TLS Encrypted</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
