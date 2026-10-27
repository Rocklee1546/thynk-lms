import React, { createContext, useContext, useState, useEffect } from 'react';
import { logAuditEvent } from '../services/auditService';
import { 
  getStoredEnrollments, 
  saveEnrollments, 
  calculateSixCalendarMonthsExpiry, 
  isEnrollmentActive,
  checkUserCourseAccess
} from '../services/paymentService';
import { 
  recordCourseViewLead, 
  cancelRemindersOnPurchase,
  getCommunicationConsent,
  updateCommunicationConsent
} from '../services/reminderService';
import { getStoredUsers, saveUsers, logoutAllDevices } from '../services/authService';
import AuthModal from '../components/AuthModal';

const LMSContext = createContext(null);

const STORAGE_KEY = 'THYNK_LMS_DATABASE_V3';

// Initial Seed Data
const initialSeed = {
  courses: [
    {
      id: 'dm-career-pack',
      title: 'Digital Marketing Complete Career Program',
      category: 'Digital Marketing',
      language: 'Tamil',
      level: 'Beginner to Advanced',
      duration: '45+ Hours',
      rating: 4.9,
      reviewCount: 384,
      price: 2999,
      originalPrice: 9999,
      isPublished: true,
      isFeatured: true,
      badge: 'Bestseller',
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
      description: 'Master SEO, Google Ads, Meta Ads & WordPress in Tamil. Practical hands-on training built specifically for Tamil Nadu students seeking real career skills.',
      shortDesc: 'Complete 4-in-1 career program in Tamil covering SEO, Google Ads, Meta Ads & WordPress.',
      includes: ['SEO', 'Google Ads', 'Meta Ads', 'WordPress'],
      requirements: [
        'Basic understanding of how the internet works',
        'A smartphone or laptop with stable internet connection',
        'No prior digital marketing experience required — we start from zero',
        'Willingness to practice with real tools during the course',
        'Basic computer literacy (browsing, typing, email)'
      ],
      fullDescription: `The Digital Marketing Complete Career Program is THYNK Digital Academy's flagship course — a comprehensive, Tamil-language deep-dive into the four most in-demand digital marketing disciplines.\n\nThis is not a theory-only course. Every module is built around real client case studies, live tool demonstrations, and step-by-step Tamil explanations that make complex concepts easy to apply immediately.\n\nYou will master Search Engine Optimization (SEO) — understanding how Google ranks websites, conducting keyword research, optimising on-page content, fixing technical issues, and building authority through backlinks. You will then progress into Google Ads, learning how to set up profitable search campaigns, write high-converting ad copies, and optimise bidding to minimise cost-per-lead.\n\nThe Meta Ads module covers the complete Facebook and Instagram advertising ecosystem — from Business Manager setup and Pixel installation to audience targeting, retargeting funnels, Reel ad creatives, and scaling profitable campaigns. Finally, you will build real business websites from scratch using WordPress and Elementor — no coding required.\n\nThrough the internship eligibility pathway, top performers who complete all projects and lessons gain access to practical internship opportunities with THYNK's industry network, giving you portfolio-ready work experience before you even graduate.\n\nAll content is taught in crystal-clear Tamil with professional-quality screen recordings, making this the most accessible advanced digital marketing program available for Tamil Nadu students today.`,
      instructor: {
        name: 'Sriram — THYNK Digital',
        title: 'Lead Mentor & Founder, THYNK Digital Academy',
        photo: '/founder.png',
        rating: 4.9,
        reviewCount: 1099,
        studentCount: 1400,
        courseCount: 5,
        bio: `Sriram is the founder of THYNK Digital Solutions and the lead instructor at THYNK Digital Academy. With hands-on experience running paid campaigns, SEO strategies, and WordPress builds for real South Indian businesses, Sriram created this academy to bridge the gap between expensive institute training and quality affordable education for Tamil students.\n\nHis teaching philosophy is built on one idea: practical skill first, theory second. Every lesson reflects real agency work — the same strategies used for actual client campaigns are taught step by step in Tamil, so students can apply and earn from day one.\n\nSriram has personally mentored 1,400+ students across Tamil Nadu, helping them land freelance clients, agency jobs, and internship opportunities. His no-nonsense, structured teaching style makes complex marketing concepts accessible to beginners with no prior experience.`
      },
      learningBenefits: [
        '100% Recorded Tamil Video Sessions with 6-Month Structured Access',
        'Weekly Live Doubt Solving Sessions with Industry Experts',
        '5+ Real Practical Projects (Client Case Studies)',
        'Internship Opportunity for Eligible Students',
        'Official Shareable Certificate of Completion',
        'No Hidden Charges / Clear No-Refund Policy'
      ],
      modules: [
        {
          id: 'mod-1',
          title: 'Module 01: Introduction to Digital Marketing',
          duration: '3 Hours',
          lessons: [
            { id: 'les-1-1', title: '01. Digital Marketing Overview & Fundamentals (Tamil)', duration: '25 min', isPreview: true, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
            { id: 'les-1-2', title: '02. Traditional vs Digital Marketing Dynamics', duration: '35 min', isPreview: true, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
            { id: 'les-1-3', title: '03. Understanding Customer Funnels & Buyer Journey', duration: '40 min', isPreview: false, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
          ]
        },
        {
          id: 'mod-2',
          title: 'Module 02: Search Engine Optimization (SEO)',
          duration: '12 Hours',
          lessons: [
            { id: 'les-2-1', title: '01. SEO Fundamentals & Search Engine Mechanics', duration: '45 min', isPreview: true, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
            { id: 'les-2-2', title: '02. Tamil Keyword Research Live Practical', duration: '50 min', isPreview: false, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
            { id: 'les-2-3', title: '03. On-Page SEO: Headings, Meta Tags & Content Structure', duration: '60 min', isPreview: false, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
            { id: 'les-2-4', title: '04. Technical SEO: Site Speed, Schema & Crawlability', duration: '55 min', isPreview: false, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
            { id: 'les-2-5', title: '05. Off-Page SEO & Backlink Building Strategies', duration: '45 min', isPreview: false, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
          ]
        },
        {
          id: 'mod-3',
          title: 'Module 03: Google Ads Mastery',
          duration: '14 Hours',
          lessons: [
            { id: 'les-3-1', title: '01. Setting up Google Ads Manager Account', duration: '30 min', isPreview: false, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
            { id: 'les-3-2', title: '02. Search Campaigns & Bidding Strategies', duration: '55 min', isPreview: false, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
            { id: 'les-3-3', title: '03. High-Converting Ad Copies & Extension Optimization', duration: '40 min', isPreview: false, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
            { id: 'les-3-4', title: '04. Display & YouTube Ads Blueprint', duration: '50 min', isPreview: false, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
          ]
        },
        {
          id: 'mod-4',
          title: 'Module 04: Meta Ads (Facebook & Instagram)',
          duration: '12 Hours',
          lessons: [
            { id: 'les-4-1', title: '01. Meta Business Suite & Pixel Setup', duration: '40 min', isPreview: false, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
            { id: 'les-4-2', title: '02. Audience Targeting & Custom Audiences in Tamil Nadu', duration: '50 min', isPreview: false, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
            { id: 'les-4-3', title: '03. Ad Creative Strategy & Reel Ads Blueprint', duration: '45 min', isPreview: false, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
            { id: 'les-4-4', title: '04. Campaign Scaling & ROAS Optimization', duration: '55 min', isPreview: false, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
          ]
        },
        {
          id: 'mod-5',
          title: 'Module 05: WordPress Web Design & Deployment',
          duration: '10 Hours',
          lessons: [
            { id: 'les-5-1', title: '01. Domain, Hosting & WordPress Installation', duration: '35 min', isPreview: false, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
            { id: 'les-5-2', title: '02. Designing Pages with Elementor Builder', duration: '60 min', isPreview: false, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
            { id: 'les-5-3', title: '03. Essential Plugins for SEO & Security', duration: '40 min', isPreview: false, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
            { id: 'les-5-4', title: '04. Launching a Client Business Website Live', duration: '50 min', isPreview: false, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
          ]
        }
      ]
    },
    {
      id: 'course-seo',
      title: 'SEO Mastery: Rank #1 on Google',
      category: 'Digital Marketing',
      language: 'Tamil',
      level: 'Beginner',
      duration: '12 Hours',
      rating: 4.8,
      reviewCount: 142,
      price: 999,
      originalPrice: 2999,
      isPublished: true,
      isFeatured: false,
      badge: 'Popular',
      thumbnail: 'https://images.unsplash.com/photo-1571721795195-a2ca2d3370a9?auto=format&fit=crop&w=800&q=80',
      description: 'Learn Keyword Research, On-Page SEO, Technical Audits and Backlink building step-by-step in clear Tamil.',
      shortDesc: 'Complete Search Engine Optimization course in Tamil.',
      includes: ['SEO Fundamentals', 'Keyword Research', 'On-Page SEO', 'Technical Audits'],
      requirements: [
        'Basic familiarity with using Google Search',
        'A laptop or desktop computer with internet access',
        'No prior SEO or marketing knowledge required',
        'Curiosity and willingness to practice on a real website or blog'
      ],
      fullDescription: `SEO Mastery is a complete, practical course designed for Tamil students and business owners who want to rank their websites on Google without paying for ads.\n\nYou will start from the very basics — understanding how search engines crawl, index, and rank pages — and progressively move into advanced keyword research strategies using free and paid tools. Every technique is demonstrated with a live Tamil website case study, so you see exactly what to do at every step.\n\nThe On-Page SEO module covers title tags, meta descriptions, header structures, internal linking, and content optimisation frameworks that Google rewards. The Technical SEO section addresses site speed, mobile usability, schema markup, XML sitemaps, and crawl error fixes.\n\nThe final section covers Off-Page SEO and backlink acquisition — how to build genuine authority for your website through guest posts, citations, and digital PR techniques that work in the Indian market.\n\nBy the end of this course, you will be able to audit any website's SEO health, build an optimisation plan, implement it yourself, and track ranking improvements in Google Search Console — a skill you can monetise immediately as a freelancer or agency professional.`,
      instructor: {
        name: 'Sriram — THYNK Digital',
        title: 'Lead Mentor & Founder, THYNK Digital Academy',
        photo: '/founder.png',
        rating: 4.9,
        reviewCount: 1099,
        studentCount: 1400,
        courseCount: 5,
        bio: `Sriram is the founder of THYNK Digital Solutions and the lead instructor at THYNK Digital Academy. With hands-on experience running paid campaigns, SEO strategies, and WordPress builds for real South Indian businesses, Sriram created this academy to bridge the gap between expensive institute training and quality affordable education for Tamil students.\n\nHis teaching philosophy is built on one idea: practical skill first, theory second. Every lesson reflects real agency work — the same strategies used for actual client campaigns are taught step by step in Tamil, so students can apply and earn from day one.\n\nSriram has personally mentored 1,400+ students across Tamil Nadu, helping them land freelance clients, agency jobs, and internship opportunities. His no-nonsense, structured teaching style makes complex marketing concepts accessible to beginners with no prior experience.`
      },
      learningBenefits: [
        'Recorded Tamil Lessons',
        'Live Doubt Support',
        'Real Website Case Study',
        'Certificate of Completion'
      ],
      modules: [
        {
          id: 'seo-m1',
          title: 'Module 01: SEO Fundamentals & Keyword Research',
          duration: '4 Hours',
          lessons: [
            { id: 'seo-l1', title: '01. Introduction to Search Engines in Tamil', duration: '30 min', isPreview: true, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
            { id: 'seo-l2', title: '02. Finding High-Intent Search Keywords', duration: '45 min', isPreview: false, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
          ]
        }
      ]
    },
    {
      id: 'course-gads',
      title: 'Google Ads & PPC Campaign Specialist',
      category: 'Digital Marketing',
      language: 'Tamil',
      level: 'Intermediate',
      duration: '14 Hours',
      rating: 4.9,
      reviewCount: 198,
      price: 1199,
      originalPrice: 3499,
      isPublished: true,
      isFeatured: false,
      badge: 'High ROAS',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
      description: 'Create high-converting Search Ads, Display Campaigns and YouTube video ads with profitable bidding techniques.',
      shortDesc: 'Master Google Search & Display Ads campaigns in Tamil.',
      includes: ['Search Ads', 'Display Ads', 'Bidding Strategies', 'Conversion Tracking'],
      requirements: [
        'Basic understanding of how websites and online business work',
        'A Google account (Gmail) to create Google Ads account',
        'No prior advertising experience needed — we start from basics',
        'Laptop or desktop with a stable internet connection',
        'Some budget curiosity (even ₹500 practice budget is enough)'
      ],
      fullDescription: `Google Ads & PPC Campaign Specialist is the most in-depth Tamil-language Google Ads training available, built for students who want to run profitable paid search and display campaigns for local businesses, e-commerce brands, and freelance clients.\n\nYou will begin by understanding how Google's advertising auction works — why some ads show above others, how Quality Score is calculated, and what separates profitable campaigns from money-burning ones. Then you'll set up your own Google Ads account and run your first Search campaign step by step.\n\nThe Search Ads module covers everything: keyword match types, ad group structure, high-converting headline formulas, description line strategy, and ad extensions that improve click-through rates. You will learn to use the Google Ads Keyword Planner for real budget estimations before spending any money.\n\nBidding strategy is covered in depth — manual CPC, Target CPA, Target ROAS, and Maximize Conversions — so you understand exactly when to use each approach depending on campaign maturity and business goals.\n\nDisplay and YouTube Ads are covered with audience targeting, in-stream ad best practices, and remarketing campaign setup. Conversion Tracking is set up end-to-end so you always know your true cost per lead and return on ad spend.\n\nThis course ends with a complete campaign audit exercise using a real client account structure — giving you a portfolio piece you can show to potential employers or clients.`,
      instructor: {
        name: 'Sriram — THYNK Digital',
        title: 'Lead Mentor & Founder, THYNK Digital Academy',
        photo: '/founder.png',
        rating: 4.9,
        reviewCount: 1099,
        studentCount: 1400,
        courseCount: 5,
        bio: `Sriram is the founder of THYNK Digital Solutions and the lead instructor at THYNK Digital Academy. With hands-on experience running paid campaigns, SEO strategies, and WordPress builds for real South Indian businesses, Sriram created this academy to bridge the gap between expensive institute training and quality affordable education for Tamil students.\n\nHis teaching philosophy is built on one idea: practical skill first, theory second. Every lesson reflects real agency work — the same strategies used for actual client campaigns are taught step by step in Tamil, so students can apply and earn from day one.\n\nSriram has personally mentored 1,400+ students across Tamil Nadu, helping them land freelance clients, agency jobs, and internship opportunities. His no-nonsense, structured teaching style makes complex marketing concepts accessible to beginners with no prior experience.`
      },
      learningBenefits: [
        'Hands-on Ad Budget Simulation',
        'Live Doubt Session Access',
        'Recorded Tamil Classes',
        'Course Certificate'
      ],
      modules: [
        {
          id: 'gads-m1',
          title: 'Module 01: Google Search Campaigns',
          duration: '5 Hours',
          lessons: [
            { id: 'gads-l1', title: '01. Google Ads Structure & Account Setup', duration: '35 min', isPreview: true, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
          ]
        }
      ]
    },
    {
      id: 'course-meta',
      title: 'Meta Ads Blueprint (Facebook & Instagram)',
      category: 'Digital Marketing',
      language: 'Tamil',
      level: 'Beginner to Intermediate',
      duration: '12 Hours',
      rating: 4.8,
      reviewCount: 210,
      price: 1099,
      originalPrice: 3299,
      isPublished: true,
      isFeatured: false,
      badge: 'High Demand',
      thumbnail: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80',
      description: 'Scale e-commerce brands and lead generation campaigns on Instagram & Facebook with targeting frameworks.',
      shortDesc: 'Complete Facebook & Instagram Ads training in Tamil.',
      includes: ['Meta Pixel', 'Audience Targeting', 'Reel Ads', 'Retargeting'],
      requirements: [
        'A Facebook account and basic familiarity with Facebook or Instagram',
        'Laptop with internet access (mobile phone alone is not sufficient)',
        'No prior paid advertising experience required',
        'Business mindset — you should have something to promote (real or practice)'
      ],
      fullDescription: `Meta Ads Blueprint is a complete Tamil-language training program for running profitable Facebook and Instagram ad campaigns — the most widely used paid social platform for Indian businesses, freelancers, and e-commerce brands.\n\nThe course begins with Meta Business Suite setup, Ad Account configuration, and the critical Meta Pixel installation process — a step many beginners get wrong, which causes tracking failures and wasted ad spend. You will install the Pixel correctly and verify it is firing on the right events.\n\nAudience targeting is the heart of this course. You will learn how to build Custom Audiences from website visitors, video watchers, and customer lists — and use them to create Lookalike Audiences that find new customers who behave exactly like your best existing customers.\n\nAd creative strategy is covered in depth: how to design Reel ads, carousel posts, and lead generation forms that convert. You will understand the difference between Awareness, Traffic, Engagement, Lead Generation, and Conversion campaign objectives — and when to use each.\n\nThe retargeting module shows you how to re-engage visitors who viewed your product but did not purchase — a technique that dramatically reduces cost-per-acquisition for e-commerce and service businesses. Campaign scaling strategies using CBO (Campaign Budget Optimisation) and A/B testing frameworks are covered in the final section.`,
      instructor: {
        name: 'Sriram — THYNK Digital',
        title: 'Lead Mentor & Founder, THYNK Digital Academy',
        photo: '/founder.png',
        rating: 4.9,
        reviewCount: 1099,
        studentCount: 1400,
        courseCount: 5,
        bio: `Sriram is the founder of THYNK Digital Solutions and the lead instructor at THYNK Digital Academy. With hands-on experience running paid campaigns, SEO strategies, and WordPress builds for real South Indian businesses, Sriram created this academy to bridge the gap between expensive institute training and quality affordable education for Tamil students.\n\nHis teaching philosophy is built on one idea: practical skill first, theory second. Every lesson reflects real agency work — the same strategies used for actual client campaigns are taught step by step in Tamil, so students can apply and earn from day one.\n\nSriram has personally mentored 1,400+ students across Tamil Nadu, helping them land freelance clients, agency jobs, and internship opportunities. His no-nonsense, structured teaching style makes complex marketing concepts accessible to beginners with no prior experience.`
      },
      learningBenefits: [
        'Tamil Practical Tutorials',
        'Live Doubt Resolution',
        'Lead Gen Templates',
        'Certificate'
      ],
      modules: [
        {
          id: 'meta-m1',
          title: 'Module 01: Meta Ads Manager Mastery',
          duration: '4 Hours',
          lessons: [
            { id: 'meta-l1', title: '01. Meta Business Setup & Campaign Types', duration: '30 min', isPreview: true, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
          ]
        }
      ]
    },
    {
      id: 'course-wp',
      title: 'WordPress Website Builder & Growth',
      category: 'Digital Marketing',
      language: 'Tamil',
      level: 'Beginner',
      duration: '10 Hours',
      rating: 4.9,
      reviewCount: 165,
      price: 899,
      originalPrice: 2499,
      isPublished: true,
      isFeatured: false,
      badge: 'Zero Code',
      thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
      description: 'Build professional responsive business websites and landing pages using WordPress & Elementor without writing code.',
      shortDesc: 'No-code WordPress website creation in Tamil.',
      includes: ['Elementor', 'Domain & Hosting', 'Plugins', 'Security'],
      requirements: [
        'No coding knowledge required — this course is 100% no-code',
        'A laptop or desktop computer (Windows or Mac)',
        'Ability to purchase a domain and hosting (approx ₹2,000–3,000/year, not included)',
        'Desire to build a real website for yourself, a client, or a business'
      ],
      fullDescription: `WordPress Website Builder & Growth is the perfect starting point for anyone who wants to build professional, fast, and mobile-responsive business websites without touching a single line of code.\n\nThis course is built specifically for Tamil Nadu students, freelancers, and small business owners who want to create their own websites or offer website development as a service. You will start with domain registration and hosting setup — understanding how to choose the right hosting plan for different types of websites.\n\nWordPress installation, theme selection, and the core dashboard are covered step by step. You will then learn Elementor — the most popular drag-and-drop website builder — to design beautiful pages, landing pages, contact forms, and service sections without any design or coding background.\n\nEssential plugins for SEO, security, speed optimisation, and spam protection are installed and configured during the course. You will understand which plugins to use and which ones to avoid (plugin bloat is a common beginner mistake that slows websites down).\n\nThe course culminates in a complete client website build exercise — you will design, build, and launch a fully functional 5-page business website from scratch. This becomes a real portfolio piece you can show to potential clients or employers immediately after completing the course.`,
      instructor: {
        name: 'Sriram — THYNK Digital',
        title: 'Lead Mentor & Founder, THYNK Digital Academy',
        photo: '/founder.png',
        rating: 4.9,
        reviewCount: 1099,
        studentCount: 1400,
        courseCount: 5,
        bio: `Sriram is the founder of THYNK Digital Solutions and the lead instructor at THYNK Digital Academy. With hands-on experience running paid campaigns, SEO strategies, and WordPress builds for real South Indian businesses, Sriram created this academy to bridge the gap between expensive institute training and quality affordable education for Tamil students.\n\nHis teaching philosophy is built on one idea: practical skill first, theory second. Every lesson reflects real agency work — the same strategies used for actual client campaigns are taught step by step in Tamil, so students can apply and earn from day one.\n\nSriram has personally mentored 1,400+ students across Tamil Nadu, helping them land freelance clients, agency jobs, and internship opportunities. His no-nonsense, structured teaching style makes complex marketing concepts accessible to beginners with no prior experience.`
      },
      learningBenefits: [
        'Build Your Own Website',
        'Recorded Tamil Content',
        'Live Support',
        'Completion Certificate'
      ],
      modules: [
        {
          id: 'wp-m1',
          title: 'Module 01: WordPress Essentials',
          duration: '3 Hours',
          lessons: [
            { id: 'wp-l1', title: '01. WordPress Installation & Dashboard Guide', duration: '25 min', isPreview: true, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
          ]
        }
      ]
    }
  ],
  valuePacks: [
    {
      id: 'vp-seo-starter',
      name: 'SEO STARTER PACK',
      description: 'Foundational Search Engine Optimization toolkit to rank websites organically on Google.',
      courseIds: ['course-seo'],
      price: 999,
      originalPrice: 2999,
      savings: 2000,
      isPublished: true,
      badge: 'Starter Choice'
    },
    {
      id: 'vp-ads-starter',
      name: 'ADS STARTER PACK',
      description: 'Comprehensive paid acquisition bundle covering both Google Ads and Meta (FB & IG) Ads.',
      courseIds: ['course-gads', 'course-meta'],
      price: 1699,
      originalPrice: 2298,
      savings: 599,
      isPublished: true,
      badge: 'Popular Combo'
    },
    {
      id: 'vp-website-growth',
      name: 'WEBSITE GROWTH PACK',
      description: 'Build high-speed WordPress websites and optimize them to capture organic traffic.',
      courseIds: ['course-wp', 'course-seo'],
      price: 1499,
      originalPrice: 1898,
      savings: 399,
      isPublished: true,
      badge: 'High Value'
    },
    {
      id: 'vp-paid-marketing',
      name: 'PAID MARKETING PACK',
      description: 'Master Search, Display, Social Media & Video PPC ads to generate qualified leads.',
      courseIds: ['course-gads', 'course-meta'],
      price: 1699,
      originalPrice: 2298,
      savings: 599,
      isPublished: true,
      badge: 'Acquisition'
    },
    {
      id: 'vp-dm-ultimate',
      name: 'DIGITAL MARKETING VALUE PACK',
      description: 'The ultimate 4-in-1 combo: SEO + Google Ads + Meta Ads + WordPress with Internship eligibility.',
      courseIds: ['course-seo', 'course-gads', 'course-meta', 'course-wp'],
      price: 2999,
      originalPrice: 4196,
      savings: 1197,
      isPublished: true,
      badge: 'Best Value Stack'
    }
  ],
  founderPosterSlogans: [
    {
      id: 'poster-1',
      tagline: 'BRAND MISSION',
      sloganMain: "DON'T JUST LEARN.",
      sloganHighlight: 'BUILD YOUR CAREER.',
      subtext: 'Practical Digital Marketing Skills in Tamil • SEO • Google Ads • Meta Ads • WordPress',
      isActive: true
    },
    {
      id: 'poster-2',
      tagline: 'AFFORDABLE EDUCATION',
      sloganMain: "YOUR SKILLS SHOULDN'T",
      sloganHighlight: 'COST A FORTUNE.',
      subtext: 'High quality career training designed for price-sensitive South Indian students.',
      isActive: true
    },
    {
      id: 'poster-3',
      tagline: 'PRACTICAL APPROACH',
      sloganMain: 'LEARN THE SKILLS.',
      sloganHighlight: 'BUILD THE EXPERIENCE.',
      subtext: 'Hands-on projects, live doubt solving, and internship opportunities for top performers.',
      isActive: true
    },
    {
      id: 'poster-4',
      tagline: 'ACTION-ORIENTED',
      sloganMain: 'STOP JUST WATCHING.',
      sloganHighlight: 'START BUILDING.',
      subtext: 'Real client case studies and ad campaigns you can showcase on your portfolio.',
      isActive: true
    },
    {
      id: 'poster-5',
      tagline: 'CAREER TRANSFORMATION',
      sloganMain: 'FROM STUDENT TO',
      sloganHighlight: 'DIGITAL MARKETER.',
      subtext: 'Structured path with verifiable certificates and industry-focused curriculum.',
      isActive: true
    }
  ],
  testimonials: [
    {
      id: 'test-1',
      studentName: 'Karthik Raja',
      location: 'Madurai, Tamil Nadu',
      courseTitle: 'Digital Marketing Complete Career Program',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      comment: 'Thynk LMS is a game changer for Tamil students! Other institutes ask ₹25,000 for digital marketing, but here I learned SEO and Meta Ads in Tamil for just ₹2,999. The practical projects helped me get my first freelance client.',
      isPublished: true,
      isVideo: false
    },
    {
      id: 'test-2',
      studentName: 'Priya Dharshini',
      location: 'Coimbatore, Tamil Nadu',
      courseTitle: 'Meta Ads Blueprint',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
      comment: 'The explanation in Tamil is super crystal clear! I used to struggle with Meta Pixel and retargeting, but the instructor broke down every setup step by step. Live doubt session cleared all my questions.',
      isPublished: true,
      isVideo: false
    },
    {
      id: 'test-3',
      studentName: 'Sanjay Kumar',
      location: 'Chennai, Tamil Nadu',
      courseTitle: 'SEO Mastery',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      comment: 'Very practical course. I created my blog in WordPress and applied On-Page SEO tactics. Now my pages are indexing and receiving organic traffic. Highly recommended!',
      isPublished: true,
      isVideo: false
    }
  ],
  faqs: [
    {
      id: 'faq-1',
      question: 'In which language are the courses taught?',
      answer: 'All initial courses on THYNK LMS are taught in clear, easy-to-understand Tamil (தமிழ்). Technical terminology is explained with practical English industry terms so you can work confidently with clients.',
      category: 'General'
    },
    {
      id: 'faq-2',
      question: 'Are the sessions live or recorded?',
      answer: 'The core course lessons are high-quality recorded sessions with 6 months of structured dashboard access. Additionally, we conduct weekly scheduled Live Doubt Solving Sessions with mentors.',
      category: 'Learning'
    },
    {
      id: 'faq-3',
      question: 'What is your refund policy?',
      answer: 'THYNK LMS maintains a strict NO-REFUND policy. Please review our free lesson previews and syllabus details carefully before completing enrollment.',
      category: 'Payment'
    },
    {
      id: 'faq-4',
      question: 'How do I qualify for the Internship Opportunity?',
      answer: 'Students who complete at least 80% of their enrolled career course modules and submit all required practical projects are eligible to apply for our practical internship opportunities.',
      category: 'Internship'
    },
    {
      id: 'faq-5',
      question: 'Will I receive a course completion certificate?',
      answer: 'Yes! Upon 100% completion of all lessons and assignments, a verifiable THYNK LMS Certificate with a unique Certificate ID is generated for your profile.',
      category: 'Certificate'
    },
    {
      id: 'faq-6',
      question: 'Can I purchase individual courses or Value Packs?',
      answer: 'Yes, you can enroll in individual modular courses (like SEO or Google Ads) or save money by choosing one of our curated Value Packs/Combos.',
      category: 'Courses'
    }
  ],
  liveSessions: [
    {
      id: 'ls-1',
      title: 'Meta Ads Retargeting & ROAS Optimization Live QA',
      mentorName: 'Thynk Digital Team',
      date: '2026-09-30',
      time: '07:00 PM IST',
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      status: 'Upcoming',
      eligibleCourses: ['dm-career-pack', 'course-meta']
    },
    {
      id: 'ls-2',
      title: 'SEO Audit Live Breakdown & Keyword Tools',
      mentorName: 'Lead SEO Strategist',
      date: '2026-10-04',
      time: '06:30 PM IST',
      meetingLink: 'https://meet.google.com/xyz-uvwx-rst',
      status: 'Upcoming',
      eligibleCourses: ['dm-career-pack', 'course-seo']
    }
  ],
  coupons: [
    {
      id: 'coup-101',
      code: 'THYNK10',
      description: '10% instant discount on all courses & value packs',
      discountType: 'percentage',
      discountValue: 10,
      startDate: '2026-01-01',
      expiryDate: '2027-12-31',
      usageLimit: 500,
      usedCount: 42,
      minPurchaseAmount: 500,
      applicableItemId: 'all',
      isActive: true,
      isVisible: true,
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'coup-102',
      code: 'STUDENT500',
      description: 'Flat ₹500 OFF on Career Program & Value Packs',
      discountType: 'fixed',
      discountValue: 500,
      startDate: '2026-01-01',
      expiryDate: '2027-12-31',
      usageLimit: 200,
      usedCount: 18,
      minPurchaseAmount: 1000,
      applicableItemId: 'all',
      isActive: true,
      isVisible: true,
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'coup-103',
      code: 'EARLYBIRD',
      description: '15% Early Bird discount for new enrollments',
      discountType: 'percentage',
      discountValue: 15,
      startDate: '2026-01-01',
      expiryDate: '2027-12-31',
      usageLimit: 100,
      usedCount: 5,
      minPurchaseAmount: 1499,
      applicableItemId: 'all',
      isActive: true,
      isVisible: true,
      createdAt: '2026-01-01T00:00:00.000Z'
    }
  ],
  certificates: [
    {
      certificateId: 'THYNK-DM-2026-8841',
      studentName: 'Karthik Raja',
      courseTitle: 'Digital Marketing Complete Career Program',
      issueDate: '2026-09-15',
      verificationUrl: 'https://thynklms.com/verify-certificate?id=THYNK-DM-2026-8841'
    },
    {
      certificateId: 'THYNK-SEO-2026-4192',
      studentName: 'Sanjay Kumar',
      courseTitle: 'SEO Mastery: Rank #1 on Google',
      issueDate: '2026-08-20',
      verificationUrl: 'https://thynklms.com/verify-certificate?id=THYNK-SEO-2026-4192'
    },
    {
      certificateId: 'THYNK-WP-2026-1048',
      studentName: 'Vigneshwaran M.',
      courseTitle: 'WordPress Website Builder & Growth',
      issueDate: '2026-08-28',
      verificationUrl: 'https://thynklms.com/verify-certificate?id=THYNK-WP-2026-1048'
    }
  ],
  students: [
    {
      id: 'std-101',
      name: 'Rahul Kumar',
      email: 'rahul.kumar@example.com',
      phone: '+91 98765 12345',
      courseId: 'dm-career-pack',
      courseTitle: 'Digital Marketing Complete Career Program',
      enrollmentDate: '2026-08-12',
      accessExpiryDate: calculateSixCalendarMonthsExpiry(new Date('2026-08-12')),
      progress: 78,
      status: 'Active',
      certificateStatus: 'In Progress',
      certificateId: null,
      lastActive: '2 hours ago',
      completedLessonsCount: 14,
      totalLessonsCount: 18,
      submittedProjects: ['SEO Local Audit Project']
    },
    {
      id: 'std-102',
      name: 'Karthik Raja',
      email: 'student@thynk.com',
      phone: '+91 98765 23456',
      courseId: 'dm-career-pack',
      courseTitle: 'Digital Marketing Complete Career Program',
      enrollmentDate: '2026-07-05',
      accessExpiryDate: calculateSixCalendarMonthsExpiry(new Date('2026-07-05')),
      progress: 100,
      status: 'Completed',
      certificateStatus: 'Issued',
      certificateId: 'THYNK-DM-2026-8841',
      lastActive: 'Yesterday',
      completedLessonsCount: 18,
      totalLessonsCount: 18,
      submittedProjects: ['SEO Audit', 'Meta Ads Campaign']
    },
    {
      id: 'std-103',
      name: 'Priya Dharshini',
      email: 'priya.d@example.com',
      phone: '+91 98765 34567',
      courseId: 'course-meta',
      courseTitle: 'Meta Ads Blueprint (Facebook & Instagram)',
      enrollmentDate: '2026-08-20',
      accessExpiryDate: calculateSixCalendarMonthsExpiry(new Date('2026-08-20')),
      progress: 92,
      status: 'Active',
      certificateStatus: 'In Progress',
      certificateId: null,
      lastActive: 'Today at 10:15 AM',
      completedLessonsCount: 11,
      totalLessonsCount: 12,
      submittedProjects: ['Pixel & Custom Audience Draft']
    }
  ],
  reviews: [
    {
      id: 'rev-101',
      courseId: 'dm-career-pack',
      studentId: 'std-102',
      studentName: 'Karthik Raja',
      rating: 5,
      comment: 'This is by far the best Tamil digital marketing course available. I had tried other institutes that charged ₹25,000+ but the explanations were not practical. Here, every single lesson had real client examples. After completing the SEO and Meta Ads modules, I landed my first freelance project within 3 weeks.',
      date: '2026-09-20T10:30:00.000Z',
      status: 'approved',
      verifiedPurchase: true,
      helpfulCount: 14
    },
    {
      id: 'rev-102',
      courseId: 'dm-career-pack',
      studentId: 'std-101',
      studentName: 'Rahul Kumar',
      rating: 5,
      comment: 'The live doubt sessions are genuinely useful — Sriram answers questions on real campaign problems. I was confused about campaign budgeting for Google Ads and the live session cleared everything in 20 minutes. The structured 6-month access gives plenty of time to finish everything at your own pace.',
      date: '2026-09-10T14:00:00.000Z',
      status: 'approved',
      verifiedPurchase: true,
      helpfulCount: 9
    },
    {
      id: 'rev-103',
      courseId: 'course-seo',
      studentId: 'std-101',
      studentName: 'Rahul Kumar',
      rating: 5,
      comment: 'SEO was always confusing to me — there is so much conflicting information online. This course cuts through all the noise and gives a clear, practical framework. The live case study website they use throughout the course makes every concept immediately understandable. My blog started getting indexed within days of applying the on-page techniques.',
      date: '2026-09-05T09:15:00.000Z',
      status: 'approved',
      verifiedPurchase: true,
      helpfulCount: 11
    },
    {
      id: 'rev-104',
      courseId: 'course-seo',
      studentId: 'std-103',
      studentName: 'Priya Dharshini',
      rating: 4,
      comment: 'Very solid SEO fundamentals course. The keyword research section is especially good — I learned how to find low-competition keywords for Tamil Nadu local businesses which is very specific and useful. Would love more content on link building but overall extremely worth the price.',
      date: '2026-08-25T16:45:00.000Z',
      status: 'approved',
      verifiedPurchase: true,
      helpfulCount: 7
    },
    {
      id: 'rev-105',
      courseId: 'course-gads',
      studentId: 'std-102',
      studentName: 'Karthik Raja',
      rating: 5,
      comment: 'Google Ads used to feel like a black box to me. After this course I understand exactly how Quality Score works, why some ads cost ₹2 per click and others cost ₹80, and how to structure campaigns for local service businesses. The bidding strategy module is gold — no one else explains Target CPA and Target ROAS this clearly in Tamil.',
      date: '2026-09-15T11:30:00.000Z',
      status: 'approved',
      verifiedPurchase: true,
      helpfulCount: 16
    },
    {
      id: 'rev-106',
      courseId: 'course-meta',
      studentId: 'std-103',
      studentName: 'Priya Dharshini',
      rating: 5,
      comment: 'The Meta Pixel setup section saved me so much time. I had been struggling with pixel events for weeks before this course. The retargeting framework is very logical and I implemented it for a client campaign immediately after finishing that module. ROAS went up significantly. Highly recommended for anyone running social media ads.',
      date: '2026-09-18T13:00:00.000Z',
      status: 'approved',
      verifiedPurchase: true,
      helpfulCount: 12
    },
    {
      id: 'rev-107',
      courseId: 'course-wp',
      studentId: 'std-101',
      studentName: 'Rahul Kumar',
      rating: 5,
      comment: 'Built my first WordPress website during this course and it looks completely professional. The Elementor sections are explained very clearly with real-time design tips. The plugin setup section is practical and helped me avoid common mistakes. I now offer website building as a service to local businesses.',
      date: '2026-09-01T08:00:00.000Z',
      status: 'approved',
      verifiedPurchase: true,
      helpfulCount: 8
    }
  ]
};

export const LMSProvider = ({ children }) => {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...initialSeed,
          ...parsed,
          students: parsed.students || initialSeed.students,
          reviews: parsed.reviews || initialSeed.reviews || [],
          coupons: parsed.coupons || initialSeed.coupons || []
        };
      } catch (e) {
        console.error('Failed to parse localStorage data', e);
      }
    }
    return initialSeed;
  });

  // Active User Auth state: null | User object
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('THYNK_USER_SESSION');
    if (savedUser) {
      try { return JSON.parse(savedUser); } catch(e){}
    }
    return null; // Default to unauthenticated visitor
  });

  // Global Auth Modal State
  const [authModal, setAuthModal] = useState({
    isOpen: false,
    redirectPath: null,
    initialMode: 'signup'
  });

  const openAuthModal = (redirectPath = null, initialMode = 'signup') => {
    setAuthModal({
      isOpen: true,
      redirectPath,
      initialMode
    });
  };

  const closeAuthModal = () => {
    setAuthModal(prev => ({ ...prev, isOpen: false }));
  };

  // Toast notifications state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Sync data to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // Sync user to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('THYNK_USER_SESSION', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('THYNK_USER_SESSION');
    }
  }, [currentUser]);

  // Quick Switcher helpers for test evaluation
  const loginAsStudent = (email = 'student@thynk.com') => {
    const users = getStoredUsers();
    const studentUser = users.find(u => u.role === 'student') || {
      id: 'usr-student-1',
      role: 'student',
      name: 'Karthik Raja',
      email: email,
      phone: '+919876512345',
      enrolledCourseIds: ['dm-career-pack'],
      progress: {
        'dm-career-pack': {
          completedLessonIds: ['les-1-1', 'les-1-2'],
          submittedProjects: ['SEO Local Audit Project'],
          internshipStatus: 'Eligible'
        }
      }
    };
    setCurrentUser(studentUser);
    showToast('Logged in as Student');
    logAuditEvent('login_quick_switch', { actorId: studentUser.id, actorRole: 'student' });
  };

  const loginAsAdmin = () => {
    const users = getStoredUsers();
    const adminUser = users.find(u => u.role === 'admin') || {
      id: 'usr-admin-1',
      role: 'admin',
      name: 'THYNK Master Admin',
      email: 'admin@thynk.com',
      phone: '+919876500000',
      enrolledCourseIds: []
    };
    setCurrentUser(adminUser);
    showToast('Logged in as Admin');
    logAuditEvent('login_quick_switch', { actorId: adminUser.id, actorRole: 'admin' });
  };

  const logout = () => {
    if (currentUser) {
      logAuditEvent('logout', { actorId: currentUser.id, actorRole: currentUser.role });
    }
    setCurrentUser(null);
    showToast('Logged out successfully');
  };

  // Check if current user has active unexpired access to a course
  const checkCourseAccess = (courseId) => {
    if (!currentUser) return { hasAccess: false, reason: 'unauthenticated' };
    return checkUserCourseAccess(currentUser.id, courseId);
  };

  // Capture lead when user views course details
  const trackCourseView = (courseId, valuePackId = null) => {
    recordCourseViewLead({
      userId: currentUser?.id || null,
      courseId,
      valuePackId,
      userEmail: currentUser?.email || '',
      userPhone: currentUser?.phone || '',
      source: 'web_course_view'
    });
  };

  // Enrollment Handler with exact 6 Calendar Months calculation
  const enrollStudentInCourse = (courseOrComboId, isCombo = false) => {
    let coursesToAdd = [];
    if (isCombo) {
      const combo = data.valuePacks.find(v => v.id === courseOrComboId);
      if (combo) coursesToAdd = combo.courseIds;
    } else {
      coursesToAdd = [courseOrComboId];
    }

    const currentUserId = currentUser?.id || `usr-${Date.now()}`;
    const enrollments = getStoredEnrollments();
    const startedAt = new Date().toISOString();
    const expiresAt = calculateSixCalendarMonthsExpiry(new Date());

    coursesToAdd.forEach(cId => {
      const existingIdx = enrollments.findIndex(e => e.userId === currentUserId && e.courseId === cId);
      if (existingIdx >= 0) {
        enrollments[existingIdx].expiresAt = expiresAt;
        enrollments[existingIdx].status = 'active';
      } else {
        enrollments.push({
          id: `enr-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          userId: currentUserId,
          courseId: cId,
          orderId: `ord_${Date.now()}`,
          paymentId: `pay_${Date.now()}`,
          startedAt,
          expiresAt,
          status: 'active'
        });
      }
      // Cancel marketing reminders on purchase!
      cancelRemindersOnPurchase(currentUserId, cId);
    });

    saveEnrollments(enrollments);

    const updatedEnrolled = Array.from(new Set([...(currentUser?.enrolledCourseIds || []), ...coursesToAdd]));
    const updatedUser = {
      ...(currentUser || {
        id: currentUserId,
        role: 'student',
        name: 'New Student',
        email: 'student@thynk.com',
        progress: {}
      }),
      enrolledCourseIds: updatedEnrolled
    };

    setCurrentUser(updatedUser);
    showToast('Enrollment activated! You have 6 months of full course access.');

    logAuditEvent('enrollment_activated', {
      actorId: currentUserId,
      actorRole: 'student',
      entityType: isCombo ? 'value_pack' : 'course',
      entityId: courseOrComboId,
      metadata: { coursesToAdd, expiresAt }
    });
  };

  // Lesson Progress toggle & persistent tracking
  const toggleLessonCompletion = (courseId, lessonId) => {
    if (!currentUser) {
      openAuthModal();
      return;
    }
    const currentProgress = currentUser.progress || {};
    const courseProg = currentProgress[courseId] || { completedLessonIds: [] };
    const lessonSet = new Set(courseProg.completedLessonIds || []);
    
    if (lessonSet.has(lessonId)) {
      lessonSet.delete(lessonId);
    } else {
      lessonSet.add(lessonId);
    }

    const updatedCompleted = Array.from(lessonSet);

    const updatedUser = {
      ...currentUser,
      progress: {
        ...currentProgress,
        [courseId]: {
          ...courseProg,
          completedLessonIds: updatedCompleted
        }
      }
    };
    setCurrentUser(updatedUser);

    // Check for certificate generation if course reaches 100%
    const targetCourse = data.courses.find(c => c.id === courseId);
    if (targetCourse) {
      let totalLessons = 0;
      targetCourse.modules?.forEach(m => totalLessons += (m.lessons?.length || 0));
      if (totalLessons > 0 && updatedCompleted.length >= totalLessons) {
        // Auto issue certificate
        issueCertificateForStudent(currentUser.name, targetCourse.title, courseId);
      }
    }

    showToast('Lesson progress updated');
  };

  // Submit Project Submission
  const submitProjectSubmission = (courseId, projectTitle, fileUrl = '', notes = '') => {
    if (!currentUser) return;
    const currentProg = currentUser.progress || {};
    const courseProg = currentProg[courseId] || {};
    
    const newSubmission = {
      id: `sub-${Date.now()}`,
      courseId,
      projectTitle: projectTitle || 'Course Practical Audit Project',
      fileUrl,
      notes,
      status: 'submitted', // 'submitted', 'under_review', 'passed', 'failed'
      submittedAt: new Date().toISOString()
    };

    const updatedUser = {
      ...currentUser,
      progress: {
        ...currentProg,
        [courseId]: {
          ...courseProg,
          submittedProjects: [...(courseProg.submittedProjects || []), projectTitle],
          latestSubmission: newSubmission
        }
      }
    };

    setCurrentUser(updatedUser);
    showToast('Project submitted successfully! Pending admin review.');
    logAuditEvent('project_submitted', {
      actorId: currentUser.id,
      entityType: 'project',
      entityId: courseId,
      metadata: { projectTitle, fileUrl }
    });
  };

  // Submit Quiz Attempt
  const submitQuizAttempt = (courseId, quizTitle, scorePercentage) => {
    if (!currentUser) return;
    const currentProg = currentUser.progress || {};
    const courseProg = currentProg[courseId] || {};
    const passed = scorePercentage >= 80;

    const updatedUser = {
      ...currentUser,
      progress: {
        ...currentProg,
        [courseId]: {
          ...courseProg,
          quizScore: scorePercentage,
          quizPassed: passed,
          quizAttemptedAt: new Date().toISOString()
        }
      }
    };

    setCurrentUser(updatedUser);
    if (passed) {
      showToast(`🎉 Quiz Passed! Score: ${scorePercentage}%`);
    } else {
      showToast(`Quiz Score: ${scorePercentage}%. Minimum 80% required to pass. Try again.`, 'error');
    }

    logAuditEvent('quiz_attempted', {
      actorId: currentUser.id,
      entityType: 'quiz',
      entityId: courseId,
      metadata: { scorePercentage, passed }
    });
  };

  // Evaluate Internship Eligibility
  const checkInternshipEligibility = (courseId) => {
    if (!currentUser) return { isEligible: false, missing: ['Not authenticated'] };
    const course = data.courses.find(c => c.id === courseId);
    if (!course) return { isEligible: false, missing: ['Course not found'] };

    let totalLessons = 0;
    course.modules?.forEach(m => totalLessons += (m.lessons?.length || 0));

    const courseProg = currentUser.progress?.[courseId] || {};
    const completedCount = courseProg.completedLessonIds?.length || 0;
    const isVideo100Percent = totalLessons > 0 && completedCount >= totalLessons;
    const isProjectSubmitted = Boolean(courseProg.submittedProjects?.length || courseProg.latestSubmission);
    const isQuizPassed = Boolean(courseProg.quizPassed);

    const missing = [];
    if (!isVideo100Percent) missing.push('100% Video Lessons Completion');
    if (!isProjectSubmitted) missing.push('Practical Project Submission');
    if (!isQuizPassed) missing.push('Passed Module Quiz (80% score)');

    const isEligible = missing.length === 0;

    return {
      isEligible,
      missing,
      isVideo100Percent,
      isProjectSubmitted,
      isQuizPassed
    };
  };

  // Issue Certificate logic
  const issueCertificateForStudent = (studentName, courseTitle, courseId) => {
    const certCode = `THYNK-${courseId.toUpperCase().slice(0, 4)}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newCert = {
      certificateId: certCode,
      studentName: studentName || 'Student',
      courseTitle: courseTitle || 'Digital Marketing',
      issueDate: new Date().toISOString().split('T')[0],
      verificationUrl: `https://thynklms.com/verify-certificate?id=${certCode}`
    };

    setData(prev => {
      if (prev.certificates.some(c => c.certificateId === certCode)) return prev;
      return {
        ...prev,
        certificates: [newCert, ...prev.certificates]
      };
    });

    showToast(`🎉 Congratulations! Your verified Certificate #${certCode} has been issued.`);
    logAuditEvent('certificate_issued', {
      actorId: currentUser?.id,
      entityType: 'certificate',
      entityId: certCode,
      metadata: { studentName, courseTitle }
    });
  };

  // Course Cover Image Update
  const updateCourseCoverImage = (courseId, imageBase64) => {
    if (!currentUser || currentUser.role !== 'admin') {
      showToast('Admin authorization required', 'error');
      return false;
    }

    const defaultThumbnail = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80';
    const finalThumbnail = imageBase64 || defaultThumbnail;

    setData(prev => ({
      ...prev,
      courses: (prev.courses || []).map(c => 
        c.id === courseId ? { ...c, thumbnail: finalThumbnail } : c
      )
    }));

    showToast('Course cover image updated successfully!');
    logAuditEvent('course_cover_updated', {
      actorId: currentUser.id,
      actorRole: 'admin',
      entityType: 'course',
      entityId: courseId
    });
    return true;
  };

  // Coupon Verification & Validation
  const validateCoupon = (code, cartTotal, targetItemId = 'all') => {
    if (!code || !code.trim()) {
      return { valid: false, message: 'Please enter a coupon code' };
    }

    const cleanCode = code.trim().toUpperCase();
    const allCoupons = data.coupons || initialSeed.coupons || [];
    const found = allCoupons.find(c => (c.code || '').trim().toUpperCase() === cleanCode);

    if (!found) {
      return { valid: false, message: 'Invalid coupon code' };
    }

    if (!found.isActive) {
      return { valid: false, message: 'This coupon code is currently inactive' };
    }

    // Check Start Date
    if (found.startDate) {
      const start = new Date(found.startDate);
      if (new Date() < start) {
        return { valid: false, message: 'This coupon is not active yet' };
      }
    }

    // Check Expiry Date
    if (found.expiryDate) {
      const expiry = new Date(found.expiryDate);
      expiry.setHours(23, 59, 59, 999);
      if (new Date() > expiry) {
        return { valid: false, message: 'This coupon has expired' };
      }
    }

    // Check Usage Limit
    if (found.usageLimit && (found.usedCount || 0) >= found.usageLimit) {
      return { valid: false, message: 'This coupon has reached its maximum usage limit' };
    }

    // Check Minimum Purchase Amount
    if (found.minPurchaseAmount && cartTotal < found.minPurchaseAmount) {
      return { valid: false, message: `Minimum purchase of ₹${found.minPurchaseAmount.toLocaleString()} required for coupon ${found.code}` };
    }

    // Check Item Applicability
    if (found.applicableItemId && found.applicableItemId !== 'all' && targetItemId !== 'all' && found.applicableItemId !== targetItemId) {
      return { valid: false, message: 'This coupon is not applicable to the selected item' };
    }

    // Calculate Discount
    let discount = 0;
    if (found.discountType === 'percentage') {
      discount = Math.round((cartTotal * Number(found.discountValue)) / 100);
    } else {
      discount = Number(found.discountValue);
    }
    discount = Math.min(discount, cartTotal);
    const finalPrice = Math.max(0, cartTotal - discount);

    return {
      valid: true,
      discount,
      finalPrice,
      code: found.code,
      message: `Coupon '${found.code}' applied! You saved ₹${discount.toLocaleString()}.`
    };
  };

  // Coupon CRUD Management Functions
  const addCoupon = (couponData) => {
    if (!currentUser || currentUser.role !== 'admin') {
      showToast('Admin authorization required', 'error');
      return;
    }

    const newCoupon = {
      id: `coup-${Date.now()}`,
      code: (couponData.code || '').trim().toUpperCase(),
      description: couponData.description || '',
      discountType: couponData.discountType || 'percentage',
      discountValue: Number(couponData.discountValue) || 0,
      startDate: couponData.startDate || new Date().toISOString().split('T')[0],
      expiryDate: couponData.expiryDate || '2027-12-31',
      usageLimit: Number(couponData.usageLimit) || 500,
      usedCount: 0,
      minPurchaseAmount: Number(couponData.minPurchaseAmount) || 0,
      applicableItemId: couponData.applicableItemId || 'all',
      isActive: couponData.isActive !== undefined ? couponData.isActive : true,
      isVisible: couponData.isVisible !== undefined ? couponData.isVisible : true,
      createdAt: new Date().toISOString()
    };

    setData(prev => ({
      ...prev,
      coupons: [newCoupon, ...(prev.coupons || [])]
    }));

    showToast(`Coupon '${newCoupon.code}' created successfully!`);
    logAuditEvent('coupon_created', {
      actorId: currentUser.id,
      actorRole: 'admin',
      entityType: 'coupon',
      entityId: newCoupon.id,
      metadata: { code: newCoupon.code }
    });
  };

  const updateCoupon = (couponId, updates) => {
    if (!currentUser || currentUser.role !== 'admin') {
      showToast('Admin authorization required', 'error');
      return;
    }

    setData(prev => ({
      ...prev,
      coupons: (prev.coupons || []).map(c => 
        c.id === couponId ? { 
          ...c, 
          ...updates, 
          code: updates.code ? updates.code.trim().toUpperCase() : c.code 
        } : c
      )
    }));

    showToast('Coupon updated successfully');
    logAuditEvent('coupon_updated', {
      actorId: currentUser.id,
      actorRole: 'admin',
      entityType: 'coupon',
      entityId: couponId,
      metadata: updates
    });
  };

  const deleteCoupon = (couponId) => {
    if (!currentUser || currentUser.role !== 'admin') {
      showToast('Admin authorization required', 'error');
      return;
    }

    setData(prev => ({
      ...prev,
      coupons: (prev.coupons || []).filter(c => c.id !== couponId)
    }));

    showToast('Coupon deleted');
    logAuditEvent('coupon_deleted', {
      actorId: currentUser.id,
      actorRole: 'admin',
      entityType: 'coupon',
      entityId: couponId
    });
  };

  const toggleCouponStatus = (couponId) => {
    if (!currentUser || currentUser.role !== 'admin') {
      showToast('Admin authorization required', 'error');
      return;
    }

    setData(prev => ({
      ...prev,
      coupons: (prev.coupons || []).map(c => 
        c.id === couponId ? { ...c, isActive: !c.isActive } : c
      )
    }));

    showToast('Coupon active status updated');
  };

  const toggleCouponVisibility = (couponId) => {
    if (!currentUser || currentUser.role !== 'admin') {
      showToast('Admin authorization required', 'error');
      return;
    }

    setData(prev => ({
      ...prev,
      coupons: (prev.coupons || []).map(c => 
        c.id === couponId ? { ...c, isVisible: !c.isVisible } : c
      )
    }));

    showToast('Coupon visibility status updated');
  };

  // Student CRUD / Status operations
  const updateStudentStatus = (studentId, updatedFields) => {
    setData(prev => ({
      ...prev,
      students: (prev.students || initialSeed.students).map(s => 
        s.id === studentId ? { ...s, ...updatedFields } : s
      )
    }));
    showToast('Student record updated');
    logAuditEvent('student_record_updated', {
      actorId: currentUser?.id,
      actorRole: 'admin',
      entityType: 'student',
      entityId: studentId,
      metadata: updatedFields
    });
  };

  const addStudentRecord = (newStudent) => {
    const created = {
      id: `std-${Date.now()}`,
      enrollmentDate: new Date().toISOString().split('T')[0],
      accessExpiryDate: calculateSixCalendarMonthsExpiry(new Date()),
      progress: 0,
      status: 'Active',
      certificateStatus: 'Not Started',
      lastActive: 'Just now',
      completedLessonsCount: 0,
      totalLessonsCount: 10,
      submittedProjects: [],
      ...newStudent
    };
    setData(prev => ({
      ...prev,
      students: [created, ...(prev.students || initialSeed.students)]
    }));
    showToast('Student enrolled successfully');
  };

  // Admin Course CRUD
  const addCourse = (newCourse) => {
    const created = {
      ...newCourse,
      id: newCourse.id || `course-${Date.now()}`,
      rating: 5.0,
      reviewCount: 0,
      modules: newCourse.modules || []
    };
    setData(prev => ({
      ...prev,
      courses: [created, ...prev.courses]
    }));
    showToast('Course published successfully!');
  };

  const updateCourse = (courseId, updatedData) => {
    setData(prev => ({
      ...prev,
      courses: prev.courses.map(c => c.id === courseId ? { ...c, ...updatedData } : c)
    }));
    showToast('Course updated!');
  };

  const deleteCourse = (courseId) => {
    setData(prev => ({
      ...prev,
      courses: prev.courses.filter(c => c.id !== courseId),
      valuePacks: prev.valuePacks.map(vp => ({
        ...vp,
        courseIds: vp.courseIds.filter(id => id !== courseId)
      }))
    }));
    showToast('Course deleted permanently');
  };

  const addValuePack = (newPack) => {
    const pack = {
      ...newPack,
      id: `vp-${Date.now()}`,
      isPublished: true
    };
    setData(prev => ({
      ...prev,
      valuePacks: [pack, ...prev.valuePacks]
    }));
    showToast('Value pack created!');
  };

  const deleteValuePack = (packId) => {
    setData(prev => ({
      ...prev,
      valuePacks: prev.valuePacks.filter(v => v.id !== packId)
    }));
    showToast('Value Pack deleted!');
  };

  const updateFounderPosterSlogan = (sloganId, updatedFields) => {
    setData(prev => ({
      ...prev,
      founderPosterSlogans: prev.founderPosterSlogans.map(s => s.id === sloganId ? { ...s, ...updatedFields } : s)
    }));
    showToast('Founder poster slogan updated!');
  };

  const addLiveSession = (session) => {
    const newSession = {
      ...session,
      id: `ls-${Date.now()}`,
      status: 'Upcoming'
    };
    setData(prev => ({
      ...prev,
      liveSessions: [newSession, ...prev.liveSessions]
    }));
    showToast('Live doubt session scheduled!');
  };

  const deleteLiveSession = (id) => {
    setData(prev => ({
      ...prev,
      liveSessions: prev.liveSessions.filter(ls => ls.id !== id)
    }));
    showToast('Live session removed!');
  };

  const addTestimonial = (testimonial) => {
    const newT = {
      ...testimonial,
      id: `test-${Date.now()}`,
      isPublished: true
    };
    setData(prev => ({
      ...prev,
      testimonials: [newT, ...prev.testimonials]
    }));
    showToast('Testimonial added!');
  };

  const deleteTestimonial = (id) => {
    setData(prev => ({
      ...prev,
      testimonials: prev.testimonials.filter(t => t.id !== id)
    }));
    showToast('Testimonial deleted!');
  };

  const addFAQ = (faq) => {
    const item = { ...faq, id: `faq-${Date.now()}` };
    setData(prev => ({
      ...prev,
      faqs: [...prev.faqs, item]
    }));
    showToast('FAQ added!');
  };

  const deleteFAQ = (id) => {
    setData(prev => ({
      ...prev,
      faqs: prev.faqs.filter(f => f.id !== id)
    }));
    showToast('FAQ removed');
  };

  const resetToDefaults = () => {
    setData(initialSeed);
    localStorage.removeItem(STORAGE_KEY);
    showToast('Reset system data to initial defaults');
  };

  // ====================================================================
  // REVIEWS SYSTEM
  // ====================================================================

  const addReview = ({ courseId, rating, comment }) => {
    if (!currentUser) return;
    const existingReview = (data.reviews || []).find(
      r => r.courseId === courseId && r.studentId === currentUser.id
    );
    if (existingReview) {
      showToast('You have already reviewed this course. Edit your existing review.');
      return;
    }
    const newReview = {
      id: `rev-${Date.now()}`,
      courseId,
      studentId: currentUser.id,
      studentName: currentUser.name,
      rating,
      comment,
      date: new Date().toISOString(),
      status: 'approved',
      verifiedPurchase: true,
      helpfulCount: 0
    };
    setData(prev => {
      const updated = { ...prev, reviews: [...(prev.reviews || []), newReview] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    showToast('Review submitted successfully!');
  };

  const updateReview = (reviewId, updates) => {
    setData(prev => {
      const updated = {
        ...prev,
        reviews: (prev.reviews || []).map(r =>
          r.id === reviewId ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
        )
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    showToast('Review updated successfully!');
  };

  const addAdminReview = ({ courseId, studentName, rating, comment, isPromotional = true }) => {
    const newReview = {
      id: `rev-promo-${Date.now()}`,
      courseId,
      studentId: `admin-promo-${Date.now()}`,
      studentName: studentName || 'Promotional Testimonial',
      rating: Number(rating) || 5,
      comment: comment || '',
      date: new Date().toISOString(),
      status: 'approved',
      verifiedPurchase: false,
      isPromotional: Boolean(isPromotional),
      helpfulCount: 0
    };
    setData(prev => {
      const updated = { ...prev, reviews: [...(prev.reviews || []), newReview] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    showToast('Promotional review added successfully!');
  };

  const deleteReview = (reviewId) => {
    setData(prev => {
      const updated = { ...prev, reviews: (prev.reviews || []).filter(r => r.id !== reviewId) };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    showToast('Review deleted.');
  };

  const approveReview = (reviewId) => {
    setData(prev => {
      const updated = {
        ...prev,
        reviews: (prev.reviews || []).map(r =>
          r.id === reviewId ? { ...r, status: 'approved' } : r
        )
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    showToast('Review approved.');
  };

  const toggleHelpfulReview = (reviewId) => {
    setData(prev => {
      const updated = {
        ...prev,
        reviews: (prev.reviews || []).map(r =>
          r.id === reviewId ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r
        )
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };


  return (
    <LMSContext.Provider value={{
      courses: data.courses,
      valuePacks: data.valuePacks,
      founderPosterSlogans: data.founderPosterSlogans,
      testimonials: data.testimonials,
      faqs: data.faqs,
      liveSessions: data.liveSessions,
      coupons: data.coupons,
      certificates: data.certificates,
      students: data.students || initialSeed.students,
      currentUser,
      setCurrentUser,
      toast,
      showToast,
      openAuthModal,
      closeAuthModal,
      loginAsStudent,
      loginAsAdmin,
      logout,
      checkCourseAccess,
      trackCourseView,
      enrollStudentInCourse,
      toggleLessonCompletion,
      issueCertificateForStudent,
      submitProjectSubmission,
      submitQuizAttempt,
      checkInternshipEligibility,
      validateCoupon,
      addCourse,
      updateCourse,
      deleteCourse,
      addValuePack,
      deleteValuePack,
      updateFounderPosterSlogan,
      addLiveSession,
      deleteLiveSession,
      addTestimonial,
      deleteTestimonial,
      addFAQ,
      deleteFAQ,
      updateStudentStatus,
      addStudentRecord,
      resetToDefaults,
      coupons: data.coupons || initialSeed.coupons || [],
      addCoupon,
      updateCoupon,
      deleteCoupon,
      toggleCouponStatus,
      toggleCouponVisibility,
      updateCourseCoverImage,
      reviews: data.reviews || [],
      addReview,
      updateReview,
      addAdminReview,
      deleteReview,
      approveReview,
      toggleHelpfulReview
    }}>
      {children}

      {/* Global Unified Auth Modal (Integrated with all course & sign-in gates) */}
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={closeAuthModal}
        redirectPath={authModal.redirectPath}
        initialMode={authModal.initialMode}
      />

      {/* Toast Notification Floating Banner */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center space-x-3 text-sm font-semibold transition-all transform animate-bounce ${
          toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-brand-navy text-white border border-electric-500/30'
        }`}>
          <div className="w-2.5 h-2.5 rounded-full bg-electric-500 animate-ping" />
          <span>{toast.message}</span>
        </div>
      )}
    </LMSContext.Provider>
  );
};

export const useLMS = () => useContext(LMSContext);
