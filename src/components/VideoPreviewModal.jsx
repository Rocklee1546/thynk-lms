import React from 'react';
import { X, PlayCircle, ShieldAlert } from 'lucide-react';

export default function VideoPreviewModal({ course, onClose }) {
  if (!course) return null;

  // Find first preview lesson or fallback
  const firstModule = course.modules && course.modules[0];
  const previewLesson = firstModule?.lessons?.find(l => l.isPreview) || firstModule?.lessons?.[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-brand-navy rounded-3xl border border-slate-700 w-full max-w-3xl overflow-hidden shadow-2xl relative text-white">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full">
              FREE PREVIEW LESSON
            </span>
            <span className="text-xs font-semibold text-slate-300">தமிழ் (Tamil)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Screen */}
        <div className="relative aspect-video bg-black flex items-center justify-center">
          {previewLesson?.videoUrl ? (
            <iframe
              src={previewLesson.videoUrl}
              title={previewLesson.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="text-center p-8 space-y-3">
              <PlayCircle className="w-16 h-16 text-electric-500 mx-auto animate-bounce" />
              <h4 className="font-bold text-lg text-white">Tamil Preview Video Demo</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                "SEO & Digital Marketing Fundamentals in Tamil" - Sample lesson preview for {course.title}.
              </p>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="p-5 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-extrabold text-sm text-white">{previewLesson?.title || course.title}</h4>
            <p className="text-xs text-slate-400 mt-0.5">Full course includes 40+ recorded lessons, assignments & live doubt solving.</p>
          </div>

          <a
            href={`/checkout?course=${course.id}`}
            className="w-full sm:w-auto bg-electric-600 hover:bg-electric-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-lg shadow-electric-600/30 text-center shrink-0"
          >
            ENROLL NOW (₹{course.price})
          </a>
        </div>

      </div>
    </div>
  );
}
