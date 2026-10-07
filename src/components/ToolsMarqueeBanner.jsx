import React from 'react';
import { Sparkles } from 'lucide-react';

// Crisp custom SVG icons for all digital marketing platforms
const ToolIcons = {
  gsc: () => (
    <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#F1F5F9" />
      <path d="M7 23V17L13 11L18 16L25 9" stroke="#4285F4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 9H25V13" stroke="#4285F4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 23H25" stroke="#34A853" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="13" cy="11" r="2" fill="#FBBC05"/>
      <circle cx="18" cy="16" r="2" fill="#EA4335"/>
    </svg>
  ),
  analytics: () => (
    <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#FFF7ED" />
      <rect x="7" y="18" width="4" height="7" rx="2" fill="#F59E0B" />
      <rect x="14" y="12" width="4" height="13" rx="2" fill="#EA580C" />
      <rect x="21" y="7" width="4" height="18" rx="2" fill="#F97316" />
      <circle cx="9" cy="15" r="2" fill="#FBBF24" />
    </svg>
  ),
  trends: () => (
    <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#EFF6FF" />
      <path d="M6 21L12 14L17 19L26 8" stroke="#2563EB" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20 8H26V14" stroke="#2563EB" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="14" r="1.5" fill="#38BDF8" />
      <circle cx="17" cy="19" r="1.5" fill="#38BDF8" />
    </svg>
  ),
  semrush: () => (
    <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#FFF1EB" />
      <path d="M16 6C16 6 18 10 20 12C22 14 24 16 24 19C24 23.4 20.4 27 16 27C11.6 27 8 23.4 8 19C8 15.5 10.5 12.8 13.5 11.5C13 13.5 14 15 15 15.5C15 13.5 16 9 16 6Z" fill="#FF642D"/>
      <path d="M16 16C16 16 17.5 18 18 19C18.5 20 18.5 21 17.5 22C16.5 23 15 22.5 14.5 22C14 21 14.5 19.5 15 19C15.5 18.5 16 16 16 16Z" fill="#FFB700"/>
    </svg>
  ),
  ahrefs: () => (
    <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#0F172A" />
      <path d="M9 23L16 8L23 23H18.5L16 17.5L13.5 23H9Z" fill="#FF5C35"/>
      <path d="M13.5 17.5H18.5" stroke="#0071E3" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="16" cy="12" r="1.5" fill="#FFFFFF"/>
    </svg>
  ),
  frog: () => (
    <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#ECFDF5" />
      <circle cx="11" cy="11" r="3.5" fill="#10B981"/>
      <circle cx="21" cy="11" r="3.5" fill="#10B981"/>
      <circle cx="11" cy="11" r="1.5" fill="#064E3B"/>
      <circle cx="21" cy="11" r="1.5" fill="#064E3B"/>
      <path d="M8 17C8 13.5 11.5 13 16 13C20.5 13 24 13.5 24 17C24 21.5 20.5 24 16 24C11.5 24 8 21.5 8 17Z" fill="#059669"/>
      <path d="M12 20C13.5 21.5 18.5 21.5 20 20" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  gads: () => (
    <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#F8FAFC" />
      <path d="M8.5 19.5L15.5 7.5C16.3 6.1 18.1 5.6 19.5 6.4C20.9 7.2 21.4 9 20.6 10.4L13.6 22.4C12.8 23.8 11 24.3 9.6 23.5C8.2 22.7 7.7 20.9 8.5 19.5Z" fill="#FBBC04"/>
      <path d="M22.5 19.5L15.5 7.5C14.7 6.1 12.9 5.6 11.5 6.4C10.1 7.2 9.6 9 10.4 10.4L17.4 22.4C18.2 23.8 20 24.3 21.4 23.5C22.8 22.7 23.3 20.9 22.5 19.5Z" fill="#4285F4"/>
      <circle cx="11.5" cy="21.5" r="3.5" fill="#34A853"/>
    </svg>
  ),
  gkp: () => (
    <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#EFF6FF" />
      <circle cx="14" cy="14" r="6" stroke="#2563EB" strokeWidth="2.5"/>
      <path d="M18.5 18.5L25 25" stroke="#EA4335" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M12 14H16M14 12V16" stroke="#FBBC05" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  gtm: () => (
    <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#F0F9FF" />
      <path d="M16 6L25 11.5V22.5L16 28L7 22.5V11.5L16 6Z" fill="#2563EB"/>
      <path d="M16 11L21 14.5V19.5L16 23L11 19.5V14.5L16 11Z" fill="#38BDF8"/>
      <circle cx="16" cy="17" r="2.5" fill="#FFFFFF"/>
    </svg>
  ),
  metaAds: () => (
    <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#EFF6FF" />
      <path d="M7 16C7 13.5 8.5 11 11 11C13.2 11 14.8 12.8 16 14.8C17.2 12.8 18.8 11 21 11C23.5 11 25 13.5 25 16C25 18.5 23.5 21 21 21C18.8 21 17.2 19.2 16 17.2C14.8 19.2 13.2 21 11 21C8.5 21 7 18.5 7 16Z" stroke="#0081FB" strokeWidth="2.5" strokeLinejoin="round"/>
      <circle cx="16" cy="16" r="1.5" fill="#0064E0"/>
    </svg>
  ),
  metaSuite: () => (
    <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#F0F7FF" />
      <path d="M7 15C7 12.8 8.4 10.5 10.8 10.5C13 10.5 14.5 12.2 16 14.2C17.5 12.2 19 10.5 21.2 10.5C23.6 10.5 25 12.8 25 15C25 17.2 23.6 19.5 21.2 19.5C19 19.5 17.5 17.8 16 15.8C14.5 17.8 13 19.5 10.8 19.5C8.4 19.5 7 17.2 7 15Z" stroke="#0081FB" strokeWidth="2.2"/>
      <rect x="12" y="21" width="8" height="5" rx="1.5" fill="#0064E0"/>
      <path d="M14 21V20C14 19.5 14.5 19 15 19H17C17.5 19 18 19.5 18 20V21" stroke="#0064E0" strokeWidth="1.2"/>
    </svg>
  ),
  metaEvents: () => (
    <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#F0F7FF" />
      <path d="M7 16C7 13.5 8.5 11 11 11C13.2 11 14.8 12.8 16 14.8C17.2 12.8 18.8 11 21 11C23.5 11 25 13.5 25 16C25 18.5 23.5 21 21 21C18.8 21 17.2 19.2 16 17.2C14.8 19.2 13.2 21 11 21C8.5 21 7 18.5 7 16Z" stroke="#0081FB" strokeWidth="2.2"/>
      <path d="M16.5 9L14 14H18L15.5 21" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  metaPixel: () => (
    <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#EFF6FF" />
      <path d="M7 16C7 13.5 8.5 11 11 11C13.2 11 14.8 12.8 16 14.8C17.2 12.8 18.8 11 21 11C23.5 11 25 13.5 25 16C25 18.5 23.5 21 21 21C18.8 21 17.2 19.2 16 17.2C14.8 19.2 13.2 21 11 21C8.5 21 7 18.5 7 16Z" stroke="#0081FB" strokeWidth="2.2"/>
      <rect x="10" y="15" width="2" height="2" fill="#38BDF8"/>
      <rect x="15" y="15" width="2" height="2" fill="#38BDF8"/>
      <rect x="20" y="15" width="2" height="2" fill="#38BDF8"/>
    </svg>
  ),
  wp: () => (
    <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#F0F7FA" />
      <circle cx="16" cy="16" r="10" stroke="#21759B" strokeWidth="2.2"/>
      <path d="M9 16C9 19.2 11.2 22 14.2 22.8L10.3 12.2C9.5 13.3 9 14.6 9 16Z" fill="#21759B"/>
      <path d="M19.8 15.6C19.8 14.3 19.3 13.5 18.7 12.5C18.2 11.6 17.7 10.9 17.7 10.2C17.7 9.4 18.3 8.7 19.1 8.7C19.2 8.7 19.3 8.7 19.4 8.8C18.4 7.7 16.9 7 15.3 7C13.2 7 11.3 8.1 10.2 9.8L14.7 22.1L16.2 17.6L14.8 13.8C15.6 13.8 16.5 13.7 16.5 13.7C17.1 13.7 17.1 12.8 16.5 12.8C16.5 12.8 15.4 12.9 14.6 12.9L13.3 12.9L14.9 17.7L17.5 22.7C20.3 21.6 22.3 18.7 22.3 15.3C22.3 14.2 22 13.2 21.5 12.3C21.6 12.8 21.7 13.3 21.7 13.9C21.7 15.1 21 16.5 19.8 15.6Z" fill="#21759B"/>
    </svg>
  ),
  elementor: () => (
    <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#FDF2F8" />
      <circle cx="16" cy="16" r="10" fill="#92003B"/>
      <rect x="11.5" y="11.5" width="2.5" height="9" rx="1.25" fill="#FFFFFF"/>
      <rect x="16" y="11.5" width="4.5" height="2.2" rx="1" fill="#FFFFFF"/>
      <rect x="16" y="15" width="4.5" height="2.2" rx="1" fill="#FFFFFF"/>
      <rect x="16" y="18.3" width="4.5" height="2.2" rx="1" fill="#FFFFFF"/>
    </svg>
  ),
  woo: () => (
    <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#FAF5FF" />
      <rect x="6" y="9" width="20" height="14" rx="4" fill="#7F54B3"/>
      <path d="M10 13C10.5 15.5 11.5 17 13 17C14.2 17 15 15.8 15.5 14C16 15.8 16.8 17 18 17C19.5 17 20.5 15.5 21 13" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  rankmath: () => (
    <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#FFF1F2" />
      <path d="M7 23L12 16L16 20L22 10" stroke="#E0294D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17 10H22V15" stroke="#E0294D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="22" cy="10" r="2.5" fill="#FF4D6D"/>
      <rect x="8" y="22" width="16" height="2" rx="1" fill="#E2E8F0"/>
    </svg>
  )
};

// Row 1 Tools (Exact order)
const row1Tools = [
  { name: 'Google Search Console', icon: ToolIcons.gsc },
  { name: 'Google Analytics', icon: ToolIcons.analytics },
  { name: 'Google Trends', icon: ToolIcons.trends },
  { name: 'Semrush', icon: ToolIcons.semrush },
  { name: 'Ahrefs', icon: ToolIcons.ahrefs },
  { name: 'Screaming Frog', icon: ToolIcons.frog },
  { name: 'Google Ads', icon: ToolIcons.gads },
  { name: 'Google Keyword Planner', icon: ToolIcons.gkp },
  { name: 'Google Tag Manager', icon: ToolIcons.gtm }
];

// Row 2 Tools (Exact order)
const row2Tools = [
  { name: 'Meta Ads Manager', icon: ToolIcons.metaAds },
  { name: 'Meta Business Suite', icon: ToolIcons.metaSuite },
  { name: 'Meta Events Manager', icon: ToolIcons.metaEvents },
  { name: 'Meta Pixel', icon: ToolIcons.metaPixel },
  { name: 'WordPress', icon: ToolIcons.wp },
  { name: 'Elementor', icon: ToolIcons.elementor },
  { name: 'WooCommerce', icon: ToolIcons.woo },
  { name: 'Rank Math', icon: ToolIcons.rankmath }
];

export default function ToolsMarqueeBanner() {
  return (
    <section className="py-20 md:py-24 bg-[#F8FAFC] text-slate-900 border-b border-slate-200 relative overflow-hidden">
      
      {/* Subtle Light-Blue Gradient Accents */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 w-[550px] h-[550px] bg-[#EFF6FF] blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[450px] h-[450px] bg-[#DBEAFE]/40 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          
          {/* Top Pill Badge */}
          <div className="inline-flex items-center space-x-2 bg-white border border-[#2563EB]/30 shadow-sm px-4 py-1.5 rounded-full text-xs font-bold text-[#2563EB] tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>REAL TOOLS. PRACTICAL SKILLS.</span>
          </div>

          {/* Main Heading */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15]">
            <span className="block text-[#0F172A]">Master the Tools That Power</span>
            <span className="block text-[#2563EB] mt-1">Digital Marketing</span>
          </h2>

          {/* Subheading */}
          <p className="text-[#64748B] text-base sm:text-lg max-w-2xl mx-auto leading-relaxed pt-1">
            Learn the platforms and tools digital marketers use to build, optimize, advertise, and grow online.
          </p>

        </div>

      </div>

      {/* Unified Tool Showcase: Exactly 2 Horizontal Scrolling Rows */}
      <div className="mt-12 sm:mt-14 space-y-5 sm:space-y-6 relative overflow-hidden">
        
        {/* Left and Right Edge Fade Gradients */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-32 md:w-44 bg-gradient-to-r from-[#F8FAFC] via-[#F8FAFC]/80 to-transparent z-20" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-32 md:w-44 bg-gradient-to-l from-[#F8FAFC] via-[#F8FAFC]/80 to-transparent z-20" />

        {/* Row 1: Right-to-Left Continuous Marquee */}
        <div className="overflow-hidden flex">
          <div className="animate-marquee-row1 flex space-x-4 sm:space-x-5 pl-4">
            {[...row1Tools, ...row1Tools, ...row1Tools, ...row1Tools].map((tool, idx) => {
              const Icon = tool.icon;
              return (
                <div
                  key={`r1-${idx}`}
                  className="w-[170px] sm:w-[195px] h-[112px] sm:h-[122px] bg-white border border-[#E2E8F0] rounded-2xl p-3.5 sm:p-4 shadow-sm hover:shadow-md hover:border-[#2563EB]/40 flex flex-col items-center justify-center text-center space-y-2 shrink-0 transition-all duration-300 transform hover:-translate-y-1 group cursor-default"
                >
                  <div className="transform group-hover:scale-110 transition-transform duration-300">
                    <Icon />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-[#0F172A] leading-tight line-clamp-2 px-1">
                    {tool.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Row 2: Slightly Different Speed Right-to-Left Continuous Marquee */}
        <div className="overflow-hidden flex">
          <div className="animate-marquee-row2 flex space-x-4 sm:space-x-5 pl-4">
            {[...row2Tools, ...row2Tools, ...row2Tools, ...row2Tools].map((tool, idx) => {
              const Icon = tool.icon;
              return (
                <div
                  key={`r2-${idx}`}
                  className="w-[170px] sm:w-[195px] h-[112px] sm:h-[122px] bg-white border border-[#E2E8F0] rounded-2xl p-3.5 sm:p-4 shadow-sm hover:shadow-md hover:border-[#2563EB]/40 flex flex-col items-center justify-center text-center space-y-2 shrink-0 transition-all duration-300 transform hover:-translate-y-1 group cursor-default"
                >
                  <div className="transform group-hover:scale-110 transition-transform duration-300">
                    <Icon />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-[#0F172A] leading-tight line-clamp-2 px-1">
                    {tool.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Bottom Quote */}
      <div className="mt-10 sm:mt-12 text-center px-4 relative z-10">
        <p className="text-sm sm:text-base text-[#475569] font-medium">
          Learn the skills. Practice with the tools.{' '}
          <span className="text-[#2563EB] font-bold">Build real-world projects.</span>
        </p>
      </div>

    </section>
  );
}
