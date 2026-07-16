import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, Heart } from 'lucide-react';
import { ZTLogo } from '../brand/ZTLogo';
import { useLanguage } from '../../contexts/LanguageContext';
import { navigation, sports, sponsors } from '../../data/seed';
import { getIcon } from '../../utils/icons';

const socialLinks = [
  { platform: 'twitter', icon: 'Twitter', href: '#' },
  { platform: 'instagram', icon: 'Instagram', href: '#' },
  { platform: 'youtube', icon: 'Youtube', href: '#' },
  { platform: 'facebook', icon: 'Facebook', href: '#' },
];

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-ink-950 text-ink-300 mt-20">
      <div className="border-t border-gold-400/20 bg-gradient-to-b from-gold-400/5 to-transparent">
        <div className="container-zt py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="inline-block mb-4">
                <ZTLogo size={48} />
              </div>
              <p className="text-sm text-ink-400 leading-relaxed mb-4">
                The leading digital platform for women's sports in Rwanda, expanding across East Africa.
                Owned and operated by ZETALENT MEDIA.
              </p>
              <div className="flex gap-2">
                {socialLinks.map((s) => {
                  const Icon = getIcon(s.icon);
                  return (
                    <a
                      key={s.platform}
                      href={s.href}
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-800 hover:bg-gold-400 hover:text-ink-950 transition-all duration-300 ease-smooth"
                      aria-label={s.platform}
                    >
                      <Icon size={16} />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="font-display font-bold text-white mb-4">Explore</h4>
              <ul className="space-y-2.5">
                {navigation.map((item) => (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      className="text-sm text-ink-400 hover:text-gold-400 transition-colors duration-200"
                    >
                      {t(item.label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sports */}
            <div>
              <h4 className="font-display font-bold text-white mb-4">Sports</h4>
              <ul className="space-y-2.5">
                {sports.map((sport) => (
                  <li key={sport.slug}>
                    <Link
                      to={`/sports/${sport.slug}`}
                      className="text-sm text-ink-400 hover:text-gold-400 transition-colors duration-200 flex items-center gap-2"
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: sport.color }} />
                      {t(sport.name)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-display font-bold text-white mb-4">Get in Touch</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin size={16} className="text-gold-400 mt-0.5 shrink-0" />
                  <span className="text-ink-400">KN 4 Ave, Kigali Heights<br />Kigali, Rwanda</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={16} className="text-gold-400 shrink-0" />
                  <a href="mailto:info@ztmedia.rw" className="text-ink-400 hover:text-gold-400 transition-colors">info@ztmedia.rw</a>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={16} className="text-gold-400 shrink-0" />
                  <a href="tel:+250788000000" className="text-ink-400 hover:text-gold-400 transition-colors">+250 788 000 000</a>
                </li>
              </ul>
              <Link to="/contact" className="btn-outline mt-5 !border-ink-600 !text-ink-300 hover:!border-gold-400 hover:!text-gold-400 text-sm">
                <Send size={14} /> Contact Us
              </Link>
            </div>
          </div>

          {/* Sponsors strip */}
          <div className="mt-12 pt-8 border-t border-ink-800">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-500 mb-4 text-center">Official Partners</p>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {sponsors.slice(0, 6).map((s) => (
                <div
                  key={s.id}
                  className="flex h-12 px-5 items-center justify-center rounded-lg bg-ink-800/60 border border-ink-700/50 text-ink-400 font-bold text-sm hover:border-gold-400/40 hover:text-gold-400 transition-all duration-300"
                >
                  {s.logoText}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-ink-800">
        <div className="container-zt py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-500">
          <p>© 2026 ZETALENT MEDIA. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Built with <Heart size={12} className="text-gold-400 fill-gold-400" /> for women's sports in Rwanda
          </p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gold-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gold-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-gold-400 transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
