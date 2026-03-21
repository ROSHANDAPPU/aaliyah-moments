import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Send } from "lucide-react";

const mockReviews = [
  { name: "Sarah & James", rating: 5, comment: "Aaliyah captured every emotion of our wedding. The photos feel like a film.", date: "2026-01-15" },
  { name: "Marcus T.", rating: 5, comment: "The brand shoot exceeded all expectations. Pure artistry.", date: "2026-02-20" },
  { name: "Priya K.", rating: 5, comment: "My graduation photos are timeless. Thank you for making that day unforgettable.", date: "2025-12-10" },
  { name: "DJ Volt", rating: 5, comment: "The music video cinematography was next level. Every frame was fire.", date: "2026-03-01" },
  { name: "Elena R.", rating: 4, comment: "Beautiful event coverage. The treasure box concept is so creative!", date: "2026-02-14" },
];

const LeaveReview = () => {
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary mb-4">
            Your Voice Matters
          </p>
          <h1 className="font-display italic text-4xl md:text-5xl tracking-[-0.04em] leading-[0.9]">
            Share your{" "}
            <span className="text-gradient-primary">story.</span>
          </h1>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Review Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card rounded-xl p-8 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Star size={28} className="text-primary fill-primary" />
                </div>
                <p className="font-display italic text-2xl mb-2">Thank you.</p>
                <p className="text-muted-foreground text-sm">Your review will appear once approved.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-transparent border-b border-muted focus:border-primary py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none transition-colors duration-500"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground block mb-3">
                    Rating
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                      >
                        <Star
                          size={28}
                          className={`transition-all duration-300 ${
                            star <= (hoverRating || rating)
                              ? "text-primary fill-primary drop-shadow-[0_0_8px_#11BDE3]"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Your Review
                  </label>
                  <textarea
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="w-full bg-transparent border-b border-muted focus:border-primary py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none transition-colors duration-500 resize-none"
                    placeholder="Tell us about your experience..."
                  />
                </div>

                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.98 }}
                  className="glass-card px-8 py-4 rounded-lg font-mono text-[11px] uppercase tracking-[0.2em] text-primary hover:bg-primary/10 transition-all duration-500 flex items-center gap-3"
                >
                  <Send size={14} />
                  Submit Review
                </motion.button>
              </form>
            )}
          </motion.div>

          {/* Reviews Feed - Masonry */}
          <div className="space-y-4">
            {mockReviews.map((review, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="glass-card rounded-xl p-6 border-l-2 border-l-primary"
              >
                <div className="flex items-center gap-2 mb-3">
                  {Array.from({ length: review.rating }).map((_, j) => (
                    <Star key={j} size={12} className="text-primary fill-primary" />
                  ))}
                </div>
                <p className="text-foreground text-sm leading-relaxed mb-3">
                  "{review.comment}"
                </p>
                <div className="flex justify-between items-center">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                    {review.name}
                  </p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    {review.date}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveReview;
