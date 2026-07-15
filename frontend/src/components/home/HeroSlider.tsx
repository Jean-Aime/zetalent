import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, TrendingUp, Clock, Eye } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { featuredNews } from '../../data/seed';
import { formatDate, formatViews } from '../../utils/format';

const SLIDE_DURATION = 6000;

export function HeroSlider() {
  const { t, locale } = useLanguage();
  const slides = featuredNews.slice(0, 4);
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent(c => (c + 1) % slides.length), [slides.length]);
  const prev = () => setCurrent(c => (c - 1 + slides.length) % slides.length);

  useEffect(() => {
    const timer = setInterval(next, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[current];
  if (!slide) return null;

  return (
    <section className="relative h-[88vh] min-h-[560px] max-h-[820px] overflow-hidden bg-ink-950">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <img
            src={slide.image}
            alt={slide.imageAlt}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/50 to-ink-950/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-950/80 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="absolute inset-0 flex items-end">
        <div className="container-zt w-full pb-16 sm:pb-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              className="max-w-3xl"
            >
              <div className="flex items-center gap-2 mb-4">
                {slide.breaking && (
                  <span className="chip bg-red-500 text-white animate-pulse">
                    <TrendingUp size={12} /> Breaking
                  </span>
                )}
                <span className="chip bg-gold-400 text-ink-950">{slide.category.replace('-', ' ')}</span>
                <span className="chip bg-white/10 text-white backdrop-blur-md border border-white/20">{slide.sport}</span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight text-balance">
                {t(slide.title)}
              </h1>
              <p className="mt-5 text-base sm:text-lg text-ink-200 leading-relaxed max-w-2xl line-clamp-2">
                {t(slide.excerpt)}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-ink-300">
                <span className="flex items-center gap-1.5"><Clock size={14} className="text-gold-400" /> {formatDate(slide.publishedAt, locale)}</span>
                <span className="flex items-center gap-1.5"><Eye size={14} className="text-gold-400" /> {formatViews(slide.views)} views</span>
                <span className="text-ink-400">By {slide.author}</span>
              </div>
              <Link to={`/news/${slide.slug}`} className="btn-gold mt-7 group">
                Read Full Story
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 right-6 lg:right-14 flex items-center gap-3 z-10">
        <button
          onClick={prev}
          className="flex h-10 w-10 items-center justify-center rounded-full glass text-white hover:bg-gold-400 hover:text-ink-950 transition-all duration-300"
          aria-label="Previous slide"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="group"
              aria-label={`Go to slide ${i + 1}`}
            >
              <span className={`block h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-8 bg-gold-400' : 'w-2 bg-white/40 group-hover:bg-white/70'}`} />
            </button>
          ))}
        </div>
        <button
          onClick={next}
          className="flex h-10 w-10 items-center justify-center rounded-full glass text-white hover:bg-gold-400 hover:text-ink-950 transition-all duration-300"
          aria-label="Next slide"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  );
}
