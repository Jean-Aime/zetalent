import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Award, Users, Lightbulb, ArrowRight, Target, Eye, Heart } from 'lucide-react';
import { ZTLogo } from '../../components/brand/ZTLogo';
import { Reveal } from '../../components/common/NewsCard';

const stats = [
  { value: '48+', label: 'Active Teams' },
  { value: '32', label: 'League Titles' },
  { value: '1,200+', label: 'Articles Published' },
  { value: '540+', label: 'Matches This Season' },
];

const values = [
  { icon: Shield, title: 'Integrity', desc: 'We report with honesty, accuracy, and unwavering commitment to the truth.' },
  { icon: Award, title: 'Excellence', desc: 'We strive for the highest standards in everything we create and publish.' },
  { icon: Users, title: 'Inclusivity', desc: 'We celebrate every athlete, every sport, and every story across the nation.' },
  { icon: Lightbulb, title: 'Innovation', desc: 'We push boundaries in digital media to elevate women\'s sports coverage.' },
];

const team = [
  { name: 'Claudine Uwase', role: 'Editor-in-Chief', photo: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' },
  { name: 'Mugisha Nshimiyimana', role: 'Senior Reporter', photo: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' },
  { name: 'Aline Tuyisenge', role: 'Media Officer', photo: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' },
  { name: 'David Habimana', role: 'Social Media Manager', photo: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' },
];

export function AboutPage() {
  return (
    <div className="pb-16">
      {/* Hero */}
      <div className="relative h-[50vh] min-h-[360px] overflow-hidden bg-ink-950">
        <div className="absolute inset-0 bg-radial-gold opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/70 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="flex justify-center mb-6">
              <ZTLogo size={64} withText={false} />
            </div>
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="gold-divider" />
              <span className="section-label">About Us</span>
              <span className="gold-divider" />
            </div>
            <h1 className="font-display text-4xl sm:text-6xl font-bold text-white tracking-tight">
              About <span className="gradient-text">ZT Media</span>
            </h1>
            <p className="mt-4 text-lg text-ink-300 max-w-2xl mx-auto">
              The voice of women's sport in Rwanda — telling the stories that matter, on and off the field.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container-zt">
        {/* Mission & Vision */}
        <section className="py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <Reveal>
              <div className="card-zt p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-400/15 text-gold-400"><Target size={24} /></span>
                  <h2 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Our Mission</h2>
                </div>
                <p className="text-ink-600 dark:text-ink-300 leading-relaxed">
                  ZETALENT MEDIA is dedicated to giving women's sports in Rwanda the platform, visibility, and professional coverage they deserve. We believe every athlete's story matters — from the schoolground to the national stadium. Through world-class journalism, data-driven coverage, and a commitment to excellence, we are building the leading digital home for women's sports in East Africa.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="card-zt p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-400/15 text-gold-400"><Eye size={24} /></span>
                  <h2 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Our Vision</h2>
                </div>
                <p className="text-ink-600 dark:text-ink-300 leading-relaxed">
                  To become the most trusted and comprehensive source for women's sports coverage across Africa — inspiring the next generation of athletes, journalists, and fans. We envision a future where women's sports receive equal investment, equal coverage, and equal celebration, and we are committed to leading that transformation.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-ink-950 text-white rounded-3xl py-12 px-6 mb-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="font-display text-4xl sm:text-5xl font-bold text-gold-400">{stat.value}</p>
                <p className="text-sm text-ink-400 uppercase tracking-wider mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Values */}
        <section className="mb-16">
          <Reveal>
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-3 mb-3">
                <span className="gold-divider" />
                <span className="section-label">What We Stand For</span>
                <span className="gold-divider" />
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink-900 dark:text-white">Our Core Values</h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <Reveal key={value.title} delay={i * 0.1}>
                <div className="card-zt p-6 text-center hover-lift hover:shadow-lg h-full">
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-400/15 text-gold-400 mb-4">
                    <value.icon size={26} />
                  </span>
                  <h3 className="font-display text-lg font-bold text-ink-900 dark:text-white mb-2">{value.title}</h3>
                  <p className="text-sm text-ink-500 dark:text-ink-400 leading-relaxed">{value.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="mb-16">
          <Reveal>
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-3 mb-3">
                <span className="gold-divider" />
                <span className="section-label">The People</span>
                <span className="gold-divider" />
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink-900 dark:text-white">Our Team</h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <Reveal key={member.name} delay={i * 0.1}>
                <div className="group card-zt overflow-hidden hover-lift hover:shadow-xl text-center">
                  <div className="relative h-64 overflow-hidden bg-ink-100 dark:bg-ink-700">
                    <img src={member.photo} alt={member.name} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 to-transparent" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-display font-bold text-ink-900 dark:text-white">{member.name}</h3>
                    <p className="text-sm text-gold-500 mt-1">{member.role}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* CTA */}
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-ink-950 text-center py-16 px-6">
            <div className="absolute inset-0 bg-radial-gold opacity-30" />
            <div className="relative">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-400 text-ink-950 mb-6">
                <Heart size={28} className="fill-ink-950" />
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">Join Our Mission</h2>
              <p className="text-ink-300 max-w-xl mx-auto mb-8">
                Whether you're a fan, an athlete, a partner, or a future colleague — there's a place for you in the ZT Media community.
              </p>
              <Link to="/contact" className="btn-gold">
                Get in Touch <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
