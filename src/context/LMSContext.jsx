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
    { code: 'THYNK10', discountType: 'percentage', discountValue: 10, isActive: true, description: '10% instant discount' },
    { code: 'STUDENT500', discountType: 'fixed', discountValue: 500, isActive: true, description: 'Flat ₹500 OFF on Career Program' },
    { code: 'EARLYBIRD', discountType: 'percentage', discountValue: 15, isActive: true, description: '15% Early Bird discount' }
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
          students: parsed.students || initialSeed.students
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

  // Coupon Verification
  const validateCoupon = (code, amount) => {
    if (!code) return { valid: false, message: 'Please enter a coupon code' };
    const found = data.coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase() && c.isActive);
    if (!found) return { valid: false, message: 'Invalid or expired coupon code' };
    
    let discount = 0;
    if (found.discountType === 'percentage') {
      discount = Math.round((amount * found.discountValue) / 100);
    } else {
      discount = found.discountValue;
    }
    const finalPrice = Math.max(0, amount - discount);
    return {
      valid: true,
      discount,
      finalPrice,
      code: found.code,
      message: `Coupon '${found.code}' applied successfully!`
    };
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
      resetToDefaults
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
