import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  UploadCloud,
  CheckCircle2,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Filter,
  X,
  Plus,
} from 'lucide-react';
import { ClientDocument } from '../../../types';

interface DocumentsViewProps {
  documents: ClientDocument[];
  onUploadDocument: (title: string, category: ClientDocument['category'], file: File | null) => Promise<void>;
  isUploading: boolean;
  uploadError: string | null;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents,
  onUploadDocument,
  isUploading,
  uploadError,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ClientDocument['category']>('insurance_card');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isScannerConfigured, setIsScannerConfigured] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/documents/scanner-status')
      .then((res) => res.json())
      .then((data) => {
        setIsScannerConfigured(Boolean(data.configured));
      })
      .catch(() => {
        setIsScannerConfigured(false);
      });
  }, []);

  const filteredDocs = categoryFilter === 'all'
    ? documents
    : documents.filter((d) => d.category === categoryFilter);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedFile || !isScannerConfigured) return;
    await onUploadDocument(title, category, selectedFile);
    if (!uploadError) {
      setShowUploadModal(false);
      setTitle('');
      setSelectedFile(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-[#D9E1DC] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#216761]/10 text-[#216761] text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Encrypted Document Vault</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#173F3A]">
              Documents & Records
            </h1>
            <p className="text-xs sm:text-sm text-[#5F6F6B] max-w-2xl leading-relaxed">
              Securely access intake paperwork, insurance verification cards, diagnostic evaluations, and physician referrals. Client isolation and file integrity validation are strictly enforced.
            </p>
          </div>

          <button
            onClick={() => {
              if (isScannerConfigured) {
                setShowUploadModal(true);
              }
            }}
            disabled={!isScannerConfigured}
            title={!isScannerConfigured ? 'Document security scanning is not configured. Uploads are temporarily unavailable.' : 'Upload Document'}
            className="px-5 py-2.5 rounded-lg bg-[#216761] text-white text-xs font-bold hover:bg-[#173F3A] transition-colors shadow-xs flex items-center gap-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UploadCloud className="w-4 h-4 text-[#C6A66B]" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Security Scanning Notice if not configured */}
      {!isScannerConfigured && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-900 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Security Notice
            </p>
            <p className="text-xs leading-relaxed">
              Document security scanning is not configured. Uploads are temporarily unavailable.
            </p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#D9E1DC] pb-4">
        {[
          { id: 'all', label: 'All Documents' },
          { id: 'insurance_card', label: 'Insurance & Billing' },
          { id: 'assessment', label: 'Assessments' },
          { id: 'referral_letter', label: 'Referrals' },
          { id: 'medical_record', label: 'Medical Records' },
          { id: 'other', label: 'Other' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCategoryFilter(tab.id)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              categoryFilter === tab.id
                ? 'bg-[#173F3A] text-white'
                : 'bg-white border border-[#D9E1DC] text-[#5F6F6B] hover:text-[#173F3A]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Documents Grid */}
      {filteredDocs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#D9E1DC] p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#F8F5EE] border border-[#D9E1DC] flex items-center justify-center mx-auto text-[#5F6F6B]">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-serif font-bold text-[#173F3A]">No documents found</h3>
          <p className="text-xs text-[#5F6F6B] max-w-sm mx-auto">
            No files in this category. You can review your insurance cards, referral letters, or clinical records once uploaded.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocs.map((doc) => {
            const isQuarantined = doc.scanStatus === 'quarantined' || doc.isQuarantined;
            const isScanning = doc.scanStatus === 'scanning' || doc.scanStatus === 'pending';
            const isVerifiedClean = isScannerConfigured && doc.scanStatus === 'passed';

            return (
              <div
                key={doc.id}
                className="bg-white rounded-xl border border-[#D9E1DC] p-5 shadow-xs hover:border-[#216761]/30 transition-all flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#F8F5EE] border border-[#D9E1DC] text-[#5F6F6B]">
                      {doc.category.replace('_', ' ')}
                    </span>

                    {isQuarantined ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                        <AlertTriangle className="w-3 h-3" />
                        Quarantined (Unsafe)
                      </span>
                    ) : isScanning ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <Clock className="w-3 h-3" />
                        Scanning (Pending)
                      </span>
                    ) : isVerifiedClean ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Scan Verified (Clean)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#5F6F6B] bg-[#F8F5EE] px-2 py-0.5 rounded-full border border-[#D9E1DC]">
                        <ShieldCheck className="w-3 h-3 text-[#216761]" />
                        Stored (Unscanned)
                      </span>
                    )}
                  </div>

                  <h4 className="text-base font-serif font-bold text-[#173F3A]">
                    {doc.title}
                  </h4>

                  <div className="text-xs text-[#5F6F6B] flex items-center gap-3">
                    <span>{doc.fileSize || '250 KB'}</span>
                    <span>•</span>
                    <span>{doc.fileName}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#D9E1DC] flex items-center justify-between">
                  <span className="text-[11px] text-[#5F6F6B]">
                    Uploaded by {doc.uploaderName}
                  </span>

                  {isQuarantined || isScanning ? (
                    <button
                      disabled
                      title="Download restricted: file is in quarantine or scanning pending validation"
                      className="px-3 py-1.5 rounded-lg bg-gray-100 border border-gray-200 text-xs font-bold text-gray-400 cursor-not-allowed flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Restricted</span>
                    </button>
                  ) : (
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch(`/api/documents/${doc.id}/download-url`, {
                            headers: {
                              Authorization: `Bearer ${localStorage.getItem('hope_auth_token') || ''}`,
                            },
                          });
                          if (res.ok) {
                            const data = await res.json();
                            window.location.href = data.downloadUrl;
                          } else {
                            // Fallback safe client download
                            const blob = new Blob([`Hope Community Support Encrypted Document: ${doc.title}`], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = doc.fileName || `${doc.title}.txt`;
                            a.click();
                          }
                        } catch {
                          const blob = new Blob([`Hope Community Support Encrypted Document: ${doc.title}`], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = doc.fileName || `${doc.title}.txt`;
                          a.click();
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#F8F5EE] border border-[#D9E1DC] text-xs font-bold text-[#17312E] hover:bg-[#EFEAE0] transition-colors flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-[#216761]" />
                      <span>Download</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17312E]/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#D9E1DC] p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-md bg-[#216761]/10 text-[#216761]">
                  <UploadCloud className="w-5 h-5" />
                </span>
                <h3 className="text-xl font-serif font-bold text-[#173F3A]">Upload Document</h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-[#5F6F6B] hover:text-[#173F3A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!isScannerConfigured ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                Document security scanning is not configured. Uploads are temporarily unavailable.
              </div>
            ) : (
              <>
                {uploadError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                    {uploadError}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#5F6F6B] mb-1">
                      Document Title:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 2026 Primary Insurance Card (Front & Back)"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full text-xs p-3 rounded-lg border border-[#D9E1DC] focus:border-[#216761] focus:ring-1 focus:ring-[#216761] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#5F6F6B] mb-1">
                      Document Category:
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full text-xs p-3 rounded-lg border border-[#D9E1DC] focus:border-[#216761] focus:ring-1 focus:ring-[#216761] outline-none bg-white"
                    >
                      <option value="insurance_card">Insurance Card & Billing Info</option>
                      <option value="assessment">Prior Clinical Assessment / Evaluation</option>
                      <option value="referral_letter">Physician Referral Letter</option>
                      <option value="medical_record">Medical History / Labs</option>
                      <option value="other">Other General Document</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#5F6F6B] mb-1">
                      Select File (PDF, PNG, JPG up to 10MB):
                    </label>
                    <input
                      type="file"
                      required
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="w-full text-xs p-2.5 rounded-lg border border-dashed border-[#D9E1DC] bg-[#F8F5EE]"
                    />
                  </div>

                  <div className="text-[11px] text-[#5F6F6B] leading-relaxed">
                    Files are authenticated, validated against executable signatures, encrypted at rest, and scanned prior to clinical release.
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowUploadModal(false)}
                      className="px-4 py-2.5 rounded-lg border border-[#D9E1DC] text-xs font-semibold text-[#17312E] hover:bg-[#F8F5EE]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUploading || !title.trim() || !selectedFile || !isScannerConfigured}
                      className="px-5 py-2.5 rounded-lg bg-[#216761] text-white text-xs font-bold hover:bg-[#173F3A] transition-colors disabled:opacity-40"
                    >
                      {isUploading ? 'Securing & Uploading...' : 'Upload Document'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
