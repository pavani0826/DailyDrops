import React, { useState } from 'react';
import { FeedbackSubmission } from '../types';
import { storage } from '../utils/storage';
import { soundManager } from '../utils/audio';
import { Star, MessageSquare, X, Check, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [rating, setRating] = useState<number>(5);
  const [category, setCategory] = useState<string>('Feature Request');
  const [comment, setComment] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const categories = [
    'Feature Request',
    'Sprite / Mascot Suggestion',
    'Hydration Reminders',
    'Bug Report',
    'General Love',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const submission: FeedbackSubmission = {
      id: `fb-${Date.now()}`,
      rating,
      category,
      comment: comment.trim(),
      userEmail: email.trim() || undefined,
      submittedAt: new Date().toISOString(),
    };

    storage.saveFeedback(submission);
    soundManager.playVictory();
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    setSubmitted(true);

    setTimeout(() => {
      setSubmitted(false);
      setComment('');
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {submitted ? (
          <div className="py-8 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h3 className="text-xl font-black text-blue-950">Thank You!</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs font-medium">
              Your feedback fuels the Daily Drop team and keeps our water sprites energized!
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <MessageSquare className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-black text-blue-950">Share Your Feedback</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4 font-medium">
              Tell us how we can make your hydration journey even better.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Star Rating */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Rate your experience</label>
                <div className="flex items-center space-x-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-200 fill-slate-100'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-blue-950 ml-2">
                    {rating === 5 ? 'Amazing! 🌟' : rating >= 4 ? 'Great 👍' : 'Good 👌'}
                  </span>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Topic</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs font-bold bg-blue-50/50 border border-blue-200 rounded-xl px-3 py-2 text-blue-950 focus:outline-none focus:border-blue-500"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Comments */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Your thoughts or idea</label>
                <textarea
                  required
                  rows={3}
                  placeholder="What would make Daily Drop even more delightful for you?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full text-xs bg-blue-50/50 border border-blue-200 rounded-xl p-3 text-blue-950 focus:outline-none focus:border-blue-500 resize-none font-medium"
                />
              </div>

              {/* Optional Email */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Email (optional, for follow-up)
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs bg-blue-50/50 border border-blue-200 rounded-xl px-3 py-2 text-blue-950 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-md shadow-blue-500/20"
              >
                <span>Submit Feedback</span>
                <Heart className="w-3.5 h-3.5 fill-white/80" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
