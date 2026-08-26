"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, Loader2, Trash2, CheckCircle2, LogIn, AlertCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";

/* ─── Types ─────────────────────────────────────────────────────── */
interface ReviewUser {
  _id: string;
  name: string;
  avatar?: string;
}

interface ReviewItem {
  _id: string;
  userId: ReviewUser;
  rating: number;
  comment: string;
  createdAt: string;
}

interface RatingBreakdown {
  1: number; 2: number; 3: number; 4: number; 5: number;
}

interface ReviewSectionProps {
  listingId: string;
  listingType: "stay" | "tiffin";
  avgRating: number;
  totalReviews: number;
  providerId?: string;
}

/* ─── Star Picker (interactive) ─────────────────────────────────── */
function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110 focus:outline-none"
          aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
        >
          <Star
            className={`w-7 h-7 transition-colors ${
              star <= (hovered || value)
                ? "fill-amber-400 text-amber-400"
                : "fill-gray-200 text-gray-200 dark:fill-slate-700 dark:text-slate-700"
            }`}
          />
        </button>
      ))}
      <span className="ml-2 text-sm font-semibold text-gray-600 dark:text-slate-400 min-w-[80px]">
        {hovered || value
          ? ["", "Poor", "Fair", "Good", "Very Good", "Excellent"][hovered || value]
          : "Select"}
      </span>
    </div>
  );
}

/* ─── Stars Display (read only) ─────────────────────────────────── */
function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const cls = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${cls} ${
            s <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "fill-gray-200 text-gray-200 dark:fill-slate-700 dark:text-slate-700"
          }`}
        />
      ))}
    </div>
  );
}

/* ─── Rating bar (breakdown row) ────────────────────────────────── */
function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-3 text-gray-500 dark:text-slate-400 text-right font-medium">{star}</span>
      <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0" />
      <div className="flex-1 h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-6 text-gray-400 dark:text-slate-500">{count}</span>
    </div>
  );
}

/* ─── Format date ────────────────────────────────────────────────── */
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    year: "numeric", month: "short", day: "numeric",
  });
}

/* ─── Main Component ─────────────────────────────────────────────── */
export default function ReviewSection({
  listingId,
  listingType,
  avgRating: initialAvgRating,
  totalReviews: initialTotalReviews,
  providerId,
}: ReviewSectionProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [breakdown, setBreakdown] = useState<RatingBreakdown>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [totalReviews, setTotalReviews] = useState(initialTotalReviews);
  const [avgRating, setAvgRating] = useState(initialAvgRating);
  const [isLoading, setIsLoading] = useState(true);

  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState("");

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /* ── Check auth on mount ─────────────────────────────────────── */
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      if (token && userStr) {
        const u = JSON.parse(userStr);
        setIsLoggedIn(true);
        setCurrentUserId(u._id || u.id || null);
        setCurrentUserName(u.name || "");
      }
    } catch {}
  }, []);

  const isOwner = Boolean(
    currentUserId && providerId && currentUserId.toString() === providerId.toString()
  );

  /* ── Fetch reviews ───────────────────────────────────────────── */
  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/reviews?listingId=${listingId}&listingType=${listingType}&limit=50`
      );
      if (!res.ok) return;
      const data = await res.json();
      setReviews(data.reviews || []);
      setBreakdown(data.ratingBreakdown || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
      setTotalReviews(data.total || 0);

      // Recalc average from breakdown
      if (data.total > 0 && data.ratingBreakdown) {
        const rb = data.ratingBreakdown as RatingBreakdown;
        const sum = (1*rb[1]) + (2*rb[2]) + (3*rb[3]) + (4*rb[4]) + (5*rb[5]);
        setAvgRating(Math.round((sum / data.total) * 10) / 10);
      } else {
        setAvgRating(0);
      }
    } catch {}
    finally { setIsLoading(false); }
  }, [listingId, listingType]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  /* ── Check if already reviewed ────────────────────────────────── */
  useEffect(() => {
    if (!currentUserId || reviews.length === 0) return;
    const mine = reviews.find((r) => r.userId?._id?.toString() === currentUserId);
    if (mine) setAlreadyReviewed(true);
  }, [reviews, currentUserId]);

  /* ── Submit review ───────────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (isOwner) {
      setFormError("Providers cannot review their own listings.");
      return;
    }

    if (rating === 0) { setFormError("Please select a star rating."); return; }
    if (comment.trim().length < 10) { setFormError("Write at least 10 characters."); return; }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ listingId, listingType, rating, comment }),
      });
      const data = await res.json();

      if (res.ok) {
        setFormSuccess(true);
        setShowForm(false);
        setRating(0);
        setComment("");
        setAlreadyReviewed(true);
        await fetchReviews();
      } else if (res.status === 409) {
        setAlreadyReviewed(true);
        setFormError(data.error || "You have already reviewed this listing.");
      } else {
        setFormError(data.error || "Failed to submit. Try again.");
      }
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Delete review ───────────────────────────────────────────── */
  const handleDelete = async (reviewId: string) => {
    if (!confirm("Delete your review? This cannot be undone.")) return;
    setDeletingId(reviewId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        setAlreadyReviewed(false);
        setFormSuccess(false);
        await fetchReviews();
      }
    } catch {}
    finally { setDeletingId(null); }
  };

  const userReview = reviews.find((r) => r.userId?._id?.toString() === currentUserId);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-card p-6">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
          Reviews & Ratings
        </h2>
        {isOwner ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 border border-primary-200/80 dark:border-primary-900/60 px-3 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" />
            Owner View
          </span>
        ) : (
          isLoggedIn && !alreadyReviewed && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary text-xs py-2 px-4"
            >
              Write a Review
            </button>
          )
        )}
      </div>

      {/* Owner Info Notice */}
      {isOwner && (
        <div className="flex items-center gap-2.5 p-3.5 bg-primary-50/60 dark:bg-primary-950/40 border border-primary-100 dark:border-primary-900/50 rounded-xl mb-6 text-xs text-primary-800 dark:text-primary-300">
          <ShieldCheck className="w-4 h-4 flex-shrink-0 text-primary-500" />
          <span>As the owner of this listing, reviews and ratings submitted by your tenants or customers will appear below.</span>
        </div>
      )}

      {/* ── Rating summary ───────────────────────────────────────── */}
      {totalReviews > 0 ? (
        <div className="flex flex-col sm:flex-row gap-6 mb-8 p-4 bg-amber-50/60 dark:bg-amber-950/20 rounded-2xl border border-amber-100 dark:border-amber-900/30">
          {/* Big number */}
          <div className="flex flex-col items-center justify-center min-w-[100px]">
            <span className="text-5xl font-bold text-gray-900 dark:text-white">
              {avgRating.toFixed(1)}
            </span>
            <Stars rating={avgRating} size="md" />
            <span className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              {totalReviews} review{totalReviews !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Breakdown bars */}
          <div className="flex-1 space-y-1.5">
            {([5, 4, 3, 2, 1] as const).map((star) => (
              <RatingBar
                key={star}
                star={star}
                count={breakdown[star]}
                total={totalReviews}
              />
            ))}
          </div>
        </div>
      ) : !isLoading ? (
        <div className="text-center py-8 text-gray-400 mb-6">
          <Star className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium text-gray-500 dark:text-slate-400">No reviews yet</p>
          <p className="text-xs mt-1">Be the first to share your experience!</p>
        </div>
      ) : null}

      {/* ── Success banner ───────────────────────────────────────── */}
      {formSuccess && (
        <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3 mb-5 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          Your review was published successfully! Thank you.
        </div>
      )}

      {/* ── Write Review Form (Only for non-owners) ───────────────── */}
      {!isOwner && !isLoggedIn && !alreadyReviewed && (
        <div className="flex items-center justify-between gap-3 p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 mb-6 text-sm">
          <span className="text-gray-600 dark:text-slate-300">
            <span className="font-semibold">Stayed here or used this service?</span> Log in to share your experience.
          </span>
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-primary-600 dark:text-primary-400 font-semibold whitespace-nowrap hover:underline"
          >
            <LogIn className="w-4 h-4" />
            Log in
          </Link>
        </div>
      )}

      {!isOwner && showForm && isLoggedIn && !alreadyReviewed && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 p-5 bg-gray-50 dark:bg-slate-800/60 rounded-2xl border border-gray-200 dark:border-slate-700 space-y-4 animate-fade-in"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              Your Review {currentUserName && <span className="text-gray-400 font-normal">as {currentUserName}</span>}
            </h3>
            <button
              type="button"
              onClick={() => { setShowForm(false); setFormError(""); setRating(0); setComment(""); }}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
            >
              Cancel
            </button>
          </div>

          {/* Star picker */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-slate-300 mb-1.5">
              Rating
            </label>
            <StarPicker value={rating} onChange={setRating} />
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-slate-300 mb-1.5">
              Your Feedback
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell others about the cleanliness, food quality, owner behavior, location convenience, etc. (min 10 characters)"
              rows={4}
              maxLength={1000}
              className="input-field text-sm resize-none"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{comment.length < 10 ? `${10 - comment.length} more characters needed` : "Looks good!"}</span>
              <span>{comment.length}/1000</span>
            </div>
          </div>

          {/* Error */}
          {formError && (
            <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {formError}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setShowForm(false); setFormError(""); }}
              className="btn-secondary text-xs py-2 px-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || rating === 0 || comment.trim().length < 10}
              className="btn-primary text-xs py-2 px-5 disabled:opacity-50 flex items-center gap-2"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {submitting ? "Submitting…" : "Post Review"}
            </button>
          </div>
        </form>
      )}

      {/* ── User's own review card ───────────────────────────────── */}
      {!isOwner && userReview && !showForm && (
        <div className="mb-6 p-4 bg-primary-50/50 dark:bg-primary-950/20 border border-primary-200 dark:border-primary-900 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-primary-700 dark:text-primary-400 bg-primary-100 dark:bg-primary-900/60 px-2 py-0.5 rounded-full">
                Your Review
              </span>
              <Stars rating={userReview.rating} />
            </div>
            <button
              onClick={() => handleDelete(userReview._id)}
              disabled={deletingId === userReview._id}
              className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 hover:underline disabled:opacity-50"
            >
              {deletingId === userReview._id ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Trash2 className="w-3 h-3" />
              )}
              Delete
            </button>
          </div>
          <p className="text-sm text-gray-700 dark:text-slate-300">{userReview.comment}</p>
          <span className="text-xs text-gray-400 mt-1 block">{formatDate(userReview.createdAt)}</span>
        </div>
      )}

      {/* ── Reviews List ─────────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-slate-800 space-y-4">
          {reviews.map((r) => {
            const isMe = r.userId?._id?.toString() === currentUserId;
            return (
              <div key={r._id} className="pt-4 first:pt-0">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2.5">
                    {/* Avatar initial */}
                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {r.userId?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none">
                        {r.userId?.name || "Verified Customer"}
                        {isMe && (
                          <span className="ml-1.5 text-[10px] bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 px-1.5 py-0.2 rounded font-normal">
                            You
                          </span>
                        )}
                      </p>
                      <span className="text-[11px] text-gray-400 mt-0.5 block">
                        {formatDate(r.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Stars rating={r.rating} />
                    {isMe && (
                      <button
                        onClick={() => handleDelete(r._id)}
                        disabled={deletingId === r._id}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        title="Delete review"
                      >
                        {deletingId === r._id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-slate-300 ml-10 leading-relaxed">
                  {r.comment}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
