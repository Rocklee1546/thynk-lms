import React, { useState } from 'react';
import { useLMS } from '../context/LMSContext';
import { ChevronDown, HelpCircle, ShieldAlert } from 'lucide-react';

export default function FAQPage() {
  const { faqs } = useLMS();
  const [openFaqId, setOpenFaqId] = useState(faqs[0]?.id || null);

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="text-center space-y-3">
          <span className="bg-electric-50 text-electric-600 font-extrabold text-xs uppercase px-3.5 py-1 rounded-full border border-electric-200 inline-flex items-center space-x-1">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>HELP & SUPPORT CENTER</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Find instant answers to common questions about courses, Tamil sessions, live doubt solving, certificates, and our No-Refund policy.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map(faq => (
            <div key={faq.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <button
                onClick={() => setOpenFaqId(openFaqId === faq.id ? null : faq.id)}
                className="w-full text-left p-5 hover:bg-slate-50 font-bold text-slate-900 text-sm flex items-center justify-between transition-colors"
              >
                <span>{faq.question}</span>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openFaqId === faq.id ? 'rotate-180 text-electric-600' : ''}`} />
              </button>
              {openFaqId === faq.id && (
                <div className="p-5 bg-slate-50 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-amber-50 p-6 rounded-3xl border border-amber-200 text-amber-900 text-xs space-y-2">
          <div className="flex items-center space-x-2 font-extrabold text-amber-800">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>NO REFUND POLICY NOTICE</span>
          </div>
          <p className="leading-relaxed">
            Please note that THYNK LMS maintains a strict <strong>No-Refund Policy</strong>. We encourage all prospective students to inspect free lesson previews and syllabus details prior to purchasing.
          </p>
        </div>

      </div>
    </div>
  );
}
