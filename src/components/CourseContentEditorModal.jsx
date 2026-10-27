import React, { useState, useEffect, useRef } from 'react';
import {
  X, Check, Plus, Trash2, Edit3, Save, Star, User, ImagePlus,
  FileText, CheckCircle, ListPlus, Sparkles, Layers, AlertCircle,
  MessageSquare, Award, Clock, ArrowRight, ShieldCheck
} from 'lucide-react';

export default function CourseContentEditorModal({
  isOpen,
  course,
  onClose,
  onSave,
  reviews = [],
  updateReview,
  deleteReview,
  addAdminReview,
  showToast
}) {
  const [activeTab, setActiveTab] = useState('description');

  // Form states initialized from course
  const [description, setDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [badge, setBadge] = useState('');

  // Arrays
  const [learningBenefits, setLearningBenefits] = useState([]);
  const [newBenefit, setNewBenefit] = useState('');
  const [editingBenefitIdx, setEditingBenefitIdx] = useState(null);
  const [editingBenefitText, setEditingBenefitText] = useState('');

  const [includes, setIncludes] = useState([]);
  const [newInclude, setNewInclude] = useState('');
  const [editingIncludeIdx, setEditingIncludeIdx] = useState(null);
  const [editingIncludeText, setEditingIncludeText] = useState('');

  const [requirements, setRequirements] = useState([]);
  const [newRequirement, setNewRequirement] = useState('');
  const [editingReqIdx, setEditingReqIdx] = useState(null);
  const [editingReqText, setEditingReqText] = useState('');

  // Instructor
  const [instructorName, setInstructorName] = useState('');
  const [instructorTitle, setInstructorTitle] = useState('');
  const [instructorBio, setInstructorBio] = useState('');
  const [instructorPhoto, setInstructorPhoto] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');
  const [instructorRating, setInstructorRating] = useState(4.9);
  const [instructorReviewCount, setInstructorReviewCount] = useState(1099);
  const [instructorStudentCount, setInstructorStudentCount] = useState(1400);
  const [instructorCourseCount, setInstructorCourseCount] = useState(5);
  const instructorPhotoInputRef = useRef(null);

  // Review editing state
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editReviewName, setEditReviewName] = useState('');
  const [editReviewRating, setEditReviewRating] = useState(5);
  const [editReviewComment, setEditReviewComment] = useState('');
  const [editReviewStatus, setEditReviewStatus] = useState('approved');

  // New promotional testimonial form
  const [showAddPromoModal, setShowAddPromoModal] = useState(false);
  const [promoName, setPromoName] = useState('');
  const [promoRating, setPromoRating] = useState(5);
  const [promoComment, setPromoComment] = useState('');

  // Sync state when course changes
  useEffect(() => {
    if (course) {
      setDescription(course.description || course.shortDesc || '');
      setFullDescription(course.fullDescription || course.description || '');
      setDuration(course.duration || '12 Hours');
      setCategory(course.category || 'Digital Marketing');
      setLevel(course.level || 'Beginner');
      setBadge(course.badge || '');

      setLearningBenefits(Array.isArray(course.learningBenefits) ? [...course.learningBenefits] : []);
      setIncludes(Array.isArray(course.includes) ? [...course.includes] : []);
      setRequirements(Array.isArray(course.requirements) ? [...course.requirements] : []);

      const inst = course.instructor || {};
      setInstructorName(inst.name || 'Sriram — THYNK Digital');
      setInstructorTitle(inst.title || 'Lead Mentor & Founder, THYNK Digital Academy');
      setInstructorBio(inst.bio || '');
      setInstructorPhoto(inst.photo || '/founder.png');
      setPhotoPreview(inst.photo || '/founder.png');
      setInstructorRating(inst.rating ?? 4.9);
      setInstructorReviewCount(inst.reviewCount ?? 1099);
      setInstructorStudentCount(inst.studentCount ?? 1400);
      setInstructorCourseCount(inst.courseCount ?? 5);

      setNewBenefit('');
      setEditingBenefitIdx(null);
      setNewInclude('');
      setEditingIncludeIdx(null);
      setNewRequirement('');
      setEditingReqIdx(null);
      setEditingReviewId(null);
      setShowAddPromoModal(false);
    }
  }, [course]);

  if (!isOpen || !course) return null;

  // Handle Instructor Image Upload
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      showToast?.('Only JPG, PNG, WEBP, and GIF images are allowed.', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast?.('Image size must be under 5MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setPhotoPreview(dataUrl);
      setInstructorPhoto(dataUrl);
      showToast?.('Instructor profile photo updated in preview.');
    };
    reader.readAsDataURL(file);
  };

  // Learning Benefits Helpers
  const handleAddBenefit = () => {
    if (!newBenefit.trim()) return;
    setLearningBenefits(prev => [...prev, newBenefit.trim()]);
    setNewBenefit('');
  };

  const handleSaveBenefitEdit = (idx) => {
    if (!editingBenefitText.trim()) return;
    setLearningBenefits(prev => prev.map((item, i) => i === idx ? editingBenefitText.trim() : item));
    setEditingBenefitIdx(null);
    setEditingBenefitText('');
  };

  const handleDeleteBenefit = (idx) => {
    setLearningBenefits(prev => prev.filter((_, i) => i !== idx));
  };

  // Includes Helpers
  const handleAddInclude = () => {
    if (!newInclude.trim()) return;
    setIncludes(prev => [...prev, newInclude.trim()]);
    setNewInclude('');
  };

  const handleSaveIncludeEdit = (idx) => {
    if (!editingIncludeText.trim()) return;
    setIncludes(prev => prev.map((item, i) => i === idx ? editingIncludeText.trim() : item));
    setEditingIncludeIdx(null);
    setEditingIncludeText('');
  };

  const handleDeleteInclude = (idx) => {
    setIncludes(prev => prev.filter((_, i) => i !== idx));
  };

  // Requirements Helpers
  const handleAddRequirement = () => {
    if (!newRequirement.trim()) return;
    setRequirements(prev => [...prev, newRequirement.trim()]);
    setNewRequirement('');
  };

  const handleSaveReqEdit = (idx) => {
    if (!editingReqText.trim()) return;
    setRequirements(prev => prev.map((item, i) => i === idx ? editingReqText.trim() : item));
    setEditingReqIdx(null);
    setEditingReqText('');
  };

  const handleDeleteRequirement = (idx) => {
    setRequirements(prev => prev.filter((_, i) => i !== idx));
  };

  // Review Edit Save
  const handleSaveReviewEdit = (reviewId) => {
    if (!editReviewComment.trim()) {
      showToast?.('Review comment cannot be empty.', 'error');
      return;
    }
    updateReview?.(reviewId, {
      studentName: editReviewName.trim() || 'Student',
      rating: Number(editReviewRating),
      comment: editReviewComment.trim(),
      status: editReviewStatus
    });
    setEditingReviewId(null);
    showToast?.('Review updated.');
  };

  // Add Promotional Testimonial
  const handleAddPromoSubmit = (e) => {
    e.preventDefault();
    if (!promoComment.trim() || promoComment.trim().length < 15) {
      showToast?.('Please write at least 15 characters for the testimonial.', 'error');
      return;
    }
    addAdminReview?.({
      courseId: course.id,
      studentName: promoName.trim() || 'Featured Student Testimonial',
      rating: promoRating,
      comment: promoComment.trim(),
      isPromotional: true
    });
    setPromoName('');
    setPromoRating(5);
    setPromoComment('');
    setShowAddPromoModal(false);
  };

  // Main Save
  const handleSaveAll = () => {
    // Preserve existing instructor structure (single object or array if multi-instructor)
    const existingInstructor = course.instructor || {};
    const updatedInstructor = {
      ...existingInstructor,
      name: instructorName.trim(),
      title: instructorTitle.trim(),
      bio: instructorBio.trim(),
      photo: instructorPhoto,
      rating: Number(instructorRating),
      reviewCount: Number(instructorReviewCount),
      studentCount: Number(instructorStudentCount),
      courseCount: Number(instructorCourseCount)
    };

    const updatedData = {
      description: description.trim(),
      shortDesc: description.trim(),
      fullDescription: fullDescription.trim(),
      duration: duration.trim(),
      category: category.trim(),
      level: level.trim(),
      badge: badge.trim(),
      learningBenefits,
      includes,
      requirements,
      instructor: updatedInstructor,
      updatedAt: new Date().toISOString()
    };

    onSave(course.id, updatedData);
    showToast?.(`Course content for "${course.title}" updated successfully!`);
    onClose();
  };

  const courseReviews = (reviews || []).filter(r => r.courseId === course.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-5 bg-brand-navy text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="space-y-0.5">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-400/30">
              COURSE CONTENT CMS
            </span>
            <h2 className="text-lg sm:text-xl font-black text-white line-clamp-1">
              Edit Content: {course.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-200 bg-slate-50 flex overflow-x-auto space-x-1 py-2 text-xs font-bold text-slate-600 shrink-0">
          <button
            onClick={() => setActiveTab('description')}
            className={`px-3.5 py-2 rounded-xl flex items-center space-x-1.5 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'description' ? 'bg-[#2563EB] text-white shadow-xs' : 'hover:bg-slate-200 text-slate-700'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Description</span>
          </button>
          <button
            onClick={() => setActiveTab('benefits')}
            className={`px-3.5 py-2 rounded-xl flex items-center space-x-1.5 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'benefits' ? 'bg-[#2563EB] text-white shadow-xs' : 'hover:bg-slate-200 text-slate-700'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>What You'll Learn ({learningBenefits.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('includes')}
            className={`px-3.5 py-2 rounded-xl flex items-center space-x-1.5 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'includes' ? 'bg-[#2563EB] text-white shadow-xs' : 'hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Inclusions ({includes.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('requirements')}
            className={`px-3.5 py-2 rounded-xl flex items-center space-x-1.5 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'requirements' ? 'bg-[#2563EB] text-white shadow-xs' : 'hover:bg-slate-200 text-slate-700'
            }`}
          >
            <ListPlus className="w-3.5 h-3.5" />
            <span>Requirements ({requirements.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('instructor')}
            className={`px-3.5 py-2 rounded-xl flex items-center space-x-1.5 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'instructor' ? 'bg-[#2563EB] text-white shadow-xs' : 'hover:bg-slate-200 text-slate-700'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Instructor &amp; Photo</span>
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-3.5 py-2 rounded-xl flex items-center space-x-1.5 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'reviews' ? 'bg-[#2563EB] text-white shadow-xs' : 'hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-amber-300" />
            <span>Reviews ({courseReviews.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: DESCRIPTION */}
          {activeTab === 'description' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Duration</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                    placeholder="e.g. 45+ Hours"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Level</label>
                  <input
                    type="text"
                    value={level}
                    onChange={e => setLevel(e.target.value)}
                    placeholder="e.g. Beginner to Advanced"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={e => setBadge(e.target.value)}
                    placeholder="e.g. Bestseller / Popular"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Short Summary / Card Description
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Brief 1-2 sentence overview shown on course cards..."
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Full Course Description (Supports Multiple Paragraphs &amp; Spacing)</span>
                  <span className="text-[11px] text-slate-400 font-normal">Use double line-breaks for paragraphs</span>
                </label>
                <textarea
                  value={fullDescription}
                  onChange={e => setFullDescription(e.target.value)}
                  rows={9}
                  placeholder="Detailed multi-paragraph description displayed in the Description section of the Course Explore page..."
                  className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-normal leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>
            </div>
          )}

          {/* TAB 2: WHAT YOU'LL LEARN */}
          {activeTab === 'benefits' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900">
                <p className="font-extrabold text-sm">What You'll Learn Items</p>
                <p className="text-slate-600">These key learning benefits appear with green checkmarks in the "WHAT YOU'LL LEARN" section of the Course page.</p>
              </div>

              {/* Add New Item */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newBenefit}
                  onChange={e => setNewBenefit(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddBenefit())}
                  placeholder="e.g. Master On-Page and Technical SEO audits"
                  className="flex-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddBenefit}
                  className="bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center space-x-1 shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Benefit</span>
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                {learningBenefits.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs shadow-xs"
                  >
                    {editingBenefitIdx === idx ? (
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          value={editingBenefitText}
                          onChange={e => setEditingBenefitText(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleSaveBenefitEdit(idx))}
                          className="flex-1 p-2 bg-slate-50 border border-blue-400 rounded-lg text-xs font-medium"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveBenefitEdit(idx)}
                          className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingBenefitIdx(null)}
                          className="bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start space-x-2.5 min-w-0">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="font-semibold text-slate-800">{item}</span>
                        </div>
                        <div className="flex items-center space-x-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingBenefitIdx(idx);
                              setEditingBenefitText(item);
                            }}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBenefit(idx)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}

                {learningBenefits.length === 0 && (
                  <p className="text-center text-xs text-slate-400 py-6">No learning outcomes added yet. Use the input above to add key skills.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: COURSE INCLUSIONS */}
          {activeTab === 'includes' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900">
                <p className="font-extrabold text-sm">This Course Includes</p>
                <p className="text-slate-600">List of course inclusions displayed in the "THIS COURSE INCLUDES" section (e.g. SEO, Google Ads, Certificate, etc.).</p>
              </div>

              {/* Add New Inclusion */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newInclude}
                  onChange={e => setNewInclude(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddInclude())}
                  placeholder="e.g. Google Ads Search & Display Blueprint"
                  className="flex-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddInclude}
                  className="bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center space-x-1 shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Inclusion</span>
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                {includes.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs shadow-xs"
                  >
                    {editingIncludeIdx === idx ? (
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          value={editingIncludeText}
                          onChange={e => setEditingIncludeText(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleSaveIncludeEdit(idx))}
                          className="flex-1 p-2 bg-slate-50 border border-blue-400 rounded-lg text-xs font-medium"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveIncludeEdit(idx)}
                          className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingIncludeIdx(null)}
                          className="bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <Layers className="w-4 h-4 text-[#2563EB] shrink-0" />
                          <span className="font-semibold text-slate-800">{item}</span>
                        </div>
                        <div className="flex items-center space-x-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingIncludeIdx(idx);
                              setEditingIncludeText(item);
                            }}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteInclude(idx)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {includes.length === 0 && (
                  <p className="text-center text-xs text-slate-400 py-6">No custom inclusions added. Use the input above to add items.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: REQUIREMENTS */}
          {activeTab === 'requirements' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900">
                <p className="font-extrabold text-sm">Course Prerequisites &amp; Requirements</p>
                <p className="text-slate-600">List of course requirements. If left empty, the course page displays: "No specific prerequisites required. This course is suitable for complete beginners."</p>
              </div>

              {/* Add New Requirement */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newRequirement}
                  onChange={e => setNewRequirement(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddRequirement())}
                  placeholder="e.g. Laptop or desktop computer with internet access"
                  className="flex-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddRequirement}
                  className="bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center space-x-1 shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Requirement</span>
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                {requirements.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs shadow-xs"
                  >
                    {editingReqIdx === idx ? (
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          value={editingReqText}
                          onChange={e => setEditingReqText(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleSaveReqEdit(idx))}
                          className="flex-1 p-2 bg-slate-50 border border-blue-400 rounded-lg text-xs font-medium"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveReqEdit(idx)}
                          className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingReqIdx(null)}
                          className="bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <span className="w-2 h-2 rounded-full bg-[#0F172A] shrink-0" />
                          <span className="font-semibold text-slate-800">{item}</span>
                        </div>
                        <div className="flex items-center space-x-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingReqIdx(idx);
                              setEditingReqText(item);
                            }}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRequirement(idx)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}

                {requirements.length === 0 && (
                  <p className="text-center text-xs text-slate-400 py-6">No specific requirements. The course page will show default beginner-friendly prerequisite message.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: INSTRUCTOR & PHOTO */}
          {activeTab === 'instructor' && (
            <div className="space-y-6">
              
              {/* Photo & Basic Details Row */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                
                {/* Photo with live preview & upload */}
                <div className="flex flex-col items-center space-y-3 shrink-0">
                  <div className="relative group">
                    <img
                      src={photoPreview || '/founder.png'}
                      alt={instructorName}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white shadow-lg bg-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => instructorPhotoInputRef.current?.click()}
                      className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] font-bold cursor-pointer"
                      title="Upload / replace photo"
                    >
                      <ImagePlus className="w-5 h-5 mb-1" />
                      <span>Change</span>
                    </button>
                    <input
                      type="file"
                      ref={instructorPhotoInputRef}
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={handlePhotoSelect}
                    />
                  </div>

                  <div className="flex flex-col space-y-1 text-center">
                    <button
                      type="button"
                      onClick={() => instructorPhotoInputRef.current?.click()}
                      className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer"
                    >
                      Upload Picture
                    </button>
                    {photoPreview !== '/founder.png' && (
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoPreview('/founder.png');
                          setInstructorPhoto('/founder.png');
                        }}
                        className="text-[11px] font-semibold text-slate-400 hover:text-red-600 cursor-pointer"
                      >
                        Reset to Default
                      </button>
                    )}
                  </div>
                </div>

                {/* Name & Title */}
                <div className="flex-1 space-y-3 w-full">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Instructor Name</label>
                    <input
                      type="text"
                      value={instructorName}
                      onChange={e => setInstructorName(e.target.value)}
                      placeholder="e.g. Sriram — THYNK Digital"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Professional Title / Role</label>
                    <input
                      type="text"
                      value={instructorTitle}
                      onChange={e => setInstructorTitle(e.target.value)}
                      placeholder="e.g. Lead Mentor & Founder, THYNK Digital Academy"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Photo Image URL (Optional Direct Link)</label>
                    <input
                      type="text"
                      value={instructorPhoto}
                      onChange={e => {
                        setInstructorPhoto(e.target.value);
                        setPhotoPreview(e.target.value);
                      }}
                      placeholder="https://... or /founder.png"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>

              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Rating (★)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={instructorRating}
                    onChange={e => setInstructorRating(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-center"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Total Reviews</label>
                  <input
                    type="number"
                    value={instructorReviewCount}
                    onChange={e => setInstructorReviewCount(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-center"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Students Taught</label>
                  <input
                    type="number"
                    value={instructorStudentCount}
                    onChange={e => setInstructorStudentCount(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-center"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Courses Count</label>
                  <input
                    type="number"
                    value={instructorCourseCount}
                    onChange={e => setInstructorCourseCount(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-center"
                  />
                </div>
              </div>

              {/* Instructor Bio */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Instructor Biography &amp; Background
                </label>
                <textarea
                  value={instructorBio}
                  onChange={e => setInstructorBio(e.target.value)}
                  rows={6}
                  placeholder="Detailed instructor bio, industry credentials, and teaching philosophy..."
                  className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>

            </div>
          )}

          {/* TAB 6: STUDENT REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">Course Reviews &amp; Testimonials ({courseReviews.length})</h4>
                  <p className="text-xs text-slate-500">Manage student-submitted reviews and clearly distinguish genuine student reviews from promotional testimonials.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddPromoModal(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs flex items-center space-x-1.5 shrink-0 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>+ Add Promotional Testimonial</span>
                </button>
              </div>

              {/* Add Promotional Modal */}
              {showAddPromoModal && (
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-950 uppercase tracking-wide flex items-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Create Promotional Testimonial (Labeled Distinctly)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddPromoModal(false)}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Student / Reviewer Name</label>
                      <input
                        type="text"
                        value={promoName}
                        onChange={e => setPromoName(e.target.value)}
                        placeholder="e.g. S. Vignesh (Agency Owner)"
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Rating (Stars)</label>
                      <select
                        value={promoRating}
                        onChange={e => setPromoRating(Number(e.target.value))}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                      >
                        <option value={5}>★★★★★ (5 Stars)</option>
                        <option value={4}>★★★★☆ (4 Stars)</option>
                        <option value={3}>★★★☆☆ (3 Stars)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Testimonial Text</label>
                    <textarea
                      value={promoComment}
                      onChange={e => setPromoComment(e.target.value)}
                      rows={3}
                      placeholder="Authentic promotional quote or case study statement..."
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs leading-relaxed"
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddPromoModal(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddPromoSubmit}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs px-4 py-1.5 rounded-lg shadow-xs"
                    >
                      Add Testimonial
                    </button>
                  </div>
                </div>
              )}

              {/* Reviews Table / Cards */}
              <div className="space-y-3">
                {courseReviews.map(r => (
                  <div
                    key={r.id}
                    className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2.5 shadow-xs"
                  >
                    {editingReviewId === r.id ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Reviewer Name</label>
                            <input
                              type="text"
                              value={editReviewName}
                              onChange={e => setEditReviewName(e.target.value)}
                              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Rating</label>
                            <select
                              value={editReviewRating}
                              onChange={e => setEditReviewRating(Number(e.target.value))}
                              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
                            >
                              {[5, 4, 3, 2, 1].map(s => (
                                <option key={s} value={s}>{s} Stars</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Status</label>
                            <select
                              value={editReviewStatus}
                              onChange={e => setEditReviewStatus(e.target.value)}
                              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
                            >
                              <option value="approved">Approved</option>
                              <option value="pending">Pending Approval</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Review Text</label>
                          <textarea
                            value={editReviewComment}
                            onChange={e => setEditReviewComment(e.target.value)}
                            rows={3}
                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                          />
                        </div>

                        <div className="flex justify-end space-x-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setEditingReviewId(null)}
                            className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveReviewEdit(r.id)}
                            className="bg-emerald-600 text-white font-bold text-xs px-4 py-1.5 rounded-lg shadow-xs"
                          >
                            Save Review
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-extrabold text-sm text-slate-900">{r.studentName}</span>
                            {r.verifiedPurchase && (
                              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                                ✓ Verified Student Review
                              </span>
                            )}
                            {r.isPromotional && (
                              <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full flex items-center space-x-1">
                                <Sparkles className="w-2.5 h-2.5" />
                                <span>Promotional Testimonial</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-3 text-xs">
                            <div className="flex items-center space-x-1 text-amber-400">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 ${
                                    i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                                  }`}
                                />
                              ))}
                              <span className="font-bold text-slate-700 ml-1">({r.rating})</span>
                            </div>

                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                r.status === 'approved'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {r.status === 'approved' ? 'Approved' : 'Pending'}
                            </span>

                            <button
                              type="button"
                              onClick={() => {
                                setEditingReviewId(r.id);
                                setEditReviewName(r.studentName);
                                setEditReviewRating(r.rating);
                                setEditReviewComment(r.comment);
                                setEditReviewStatus(r.status || 'approved');
                              }}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                              title="Edit review"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (confirm('Delete this review permanently?')) {
                                  deleteReview?.(r.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                              title="Delete review"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 italic leading-relaxed">
                          "{r.comment}"
                        </p>
                      </>
                    )}
                  </div>
                ))}

                {courseReviews.length === 0 && (
                  <p className="text-center text-xs text-slate-400 py-6">No reviews found for this course yet.</p>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            Cancel &amp; Discard
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save All Course Changes</span>
          </button>
        </div>

      </div>
    </div>
  );
}
