import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLMS } from '../context/LMSContext';
import { Award, CheckCircle, Search, ShieldCheck, Download, Share2 } from 'lucide-react';

export default function CertificateVerify() {
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get('id') || 'THYNK-DM-2026-8841';
  
  const { certificates } = useLMS();
  const [certIdInput, setCertIdInput] = useState(initialId);
  const [searchedCert, setSearchedCert] = useState(() => {
    return certificates.find(c => c.certificateId.toUpperCase() === initialId.toUpperCase()) || certificates[0];
  });

  const handleSearch = (e) => {
    e.preventDefault();
    const found = certificates.find(c => c.certificateId.trim().toUpperCase() === certIdInput.trim().toUpperCase());
    setSearchedCert(found || null);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Title */}
        <div className="text-center space-y-3">
          <span className="bg-emerald-50 text-emerald-600 font-extrabold text-xs uppercase px-3 py-1 rounded-full border border-emerald-200 inline-flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>THYNK LMS CERTIFICATE VERIFIER</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Verify Official Student Certificate
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
            Enter the unique Certificate ID printed on the student credential to verify its authenticity.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
          <input
            type="text"
            value={certIdInput}
            onChange={(e) => setCertIdInput(e.target.value)}
            placeholder="Enter Certificate ID (e.g. THYNK-DM-2026-8841)"
            className="flex-1 p-3 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 shadow-sm"
          />
          <button
            type="submit"
            className="bg-electric-600 hover:bg-electric-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md flex items-center space-x-1.5"
          >
            <Search className="w-4 h-4" />
            <span>Verify</span>
          </button>
        </form>

        {/* Certificate Display Card */}
        {searchedCert ? (
          <div className="bg-white rounded-3xl border-4 border-slate-900 p-8 sm:p-12 shadow-2xl space-y-8 relative overflow-hidden text-center">
            
            <div className="absolute top-4 right-4 bg-emerald-50 border border-emerald-200 text-emerald-700 font-extrabold text-xs px-3 py-1 rounded-full flex items-center space-x-1">
              <CheckCircle className="w-4 h-4" />
              <span>OFFICIALLY VERIFIED CREDENTIAL</span>
            </div>

            {/* Brand Header */}
            <div className="space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-electric-600 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-electric-600/30">
                T
              </div>
              <h2 className="font-black text-2xl text-slate-900 tracking-tight">THYNK DIGITAL SOLUTIONS</h2>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">THYNK ACADEMY CERTIFICATE OF COMPLETION</p>
            </div>

            <div className="space-y-2 border-y border-slate-100 py-6 max-w-2xl mx-auto">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">THIS CERTIFICATE IS PROUDLY PRESENTED TO</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-electric-600 underline decoration-electric-300 underline-offset-8">
                {searchedCert.studentName}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 pt-3">
                for successfully completing all practical modules, projects, and assessments in:
              </p>
              <h4 className="text-lg font-black text-slate-900 pt-1">{searchedCert.courseTitle}</h4>
              <p className="text-xs text-slate-400 italic">Language Medium: Tamil (தமிழ்)</p>
            </div>

            {/* Footer Signatures & QR Metadata */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 text-xs">
              <div className="text-left space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">CERTIFICATE ID:</span>
                <span className="font-mono font-bold text-slate-900 text-xs">{searchedCert.certificateId}</span>
                <span className="text-[10px] text-slate-400 block">Issued On: {searchedCert.issueDate}</span>
              </div>

              <div className="text-right space-y-1">
                <div className="w-32 h-0.5 bg-slate-900 mx-auto sm:ml-auto" />
                <span className="font-bold text-slate-900 block text-xs">Founder & Mentor Signature</span>
                <span className="text-[10px] text-slate-500 block">THYNK DIGITAL SOLUTIONS</span>
              </div>
            </div>

          </div>
        ) : (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-3">
            <h3 className="font-extrabold text-slate-800 text-base">Certificate Not Found</h3>
            <p className="text-xs text-slate-500">Please check the ID code and search again.</p>
          </div>
        )}

      </div>
    </div>
  );
}
