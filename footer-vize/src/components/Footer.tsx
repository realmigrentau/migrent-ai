import { Instagram, Linkedin, Twitter } from 'lucide-react';
import { motion } from 'motion/react';

function LogoIcon() {
  return (
    <div className="w-8 h-8 bg-[#31A8FF] rounded-[8px] flex items-center justify-center">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 20C4 20 4 14 10 10C16 6 20 4 20 4C20 4 18 8 14 14C10 20 4 20 4 20Z" fill="white" />
        <path d="M4 20L10 14" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

const socials = [
  { label: 'LinkedIn', Icon: Linkedin },
  { label: 'Twitter', Icon: Twitter },
  { label: 'Instagram', Icon: Instagram },
];

const columns = [
  { title: 'Product', links: ['Features', 'Solutions', 'Pricing', 'Updates'] },
  { title: 'Science', links: ['Approach', 'Identity', 'Research', 'Metrics'] },
  { title: 'Company', links: ['About Us', 'Partners', 'Careers'] },
];

function FooterCard() {
  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-[#E9EBEE] rounded-[48px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-white rounded-[40px] m-2 shadow-sm">
          <div className="p-8 md:p-10 lg:p-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
            <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center gap-2.5">
                <LogoIcon />
                <span className="text-[26px] font-bold tracking-tight text-[#0F172A]">vize</span>
              </div>

              <p className="text-[#64748B] leading-relaxed text-[16px] font-normal max-w-[320px]">
                Premium strategic solutions designed to elevate your brand presence through advanced marketing.
              </p>

              <div className="flex items-center gap-3">
                {socials.map(({ label, Icon }) => (
                  <button
                    key={label}
                    type="button"
                    aria-label={label}
                    className="w-[44px] h-[44px] flex items-center justify-center rounded-xl border border-slate-100 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:bg-slate-50 transition-all active:scale-95 group"
                  >
                    <Icon className="w-5 h-5 text-slate-800" />
                  </button>
                ))}
              </div>
            </div>

            {columns.map(({ title, links }) => (
              <div key={title} className="space-y-6">
                <h4 className="text-[14px] font-medium text-[#94A3B8]">{title}</h4>
                <ul className="space-y-4">
                  {links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-[15px] font-medium text-[#1E293B] hover:text-[#31A8FF] transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 sm:px-12 md:px-16 lg:px-20 py-5 flex flex-col md:flex-row justify-between items-center gap-6 text-[15px]">
          <p className="text-[#64748B] font-medium">&copy; 2025 Vize. All rights reserved.</p>
          <div className="flex gap-8 text-[#64748B] font-medium items-center">
            <a href="#" className="hover:text-[#1E293B] transition-colors">Legal Center</a>
            <div className="w-[1px] h-4 bg-slate-300" />
            <a href="#" className="hover:text-[#1E293B] transition-colors">User Agreement</a>
          </div>
        </div>
      </div>
    </div>
  );
}

function GlassText() {
  return (
    <div className="relative w-full flex items-center justify-center select-none pt-0">
      <svg className="absolute w-0 h-0" aria-hidden="true" focusable="false">
        <defs>
          <filter id="glass-effect" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000000" floodOpacity="0.25" result="outer-shadow" />
            <feComponentTransfer in="SourceAlpha" result="alpha">
              <feFuncA type="linear" slope="1" />
            </feComponentTransfer>
            <feOffset in="alpha" dx="0" dy="4" result="offset-white" />
            <feGaussianBlur in="offset-white" stdDeviation="4" result="blur-white" />
            <feComposite in="alpha" in2="blur-white" operator="out" result="inner-white-mask" />
            <feFlood floodColor="#ffffff" floodOpacity="0.25" result="white-fill" />
            <feComposite in="white-fill" in2="inner-white-mask" operator="in" result="inner-white-final" />
            <feGaussianBlur in="alpha" stdDeviation="6" result="blur-black" />
            <feComposite in="alpha" in2="blur-black" operator="out" result="inner-black-mask" />
            <feFlood floodColor="#000000" floodOpacity="0.25" result="black-fill" />
            <feComposite in="black-fill" in2="inner-black-mask" operator="in" result="inner-black-final" />
            <feMerge>
              <feMergeNode in="outer-shadow" />
              <feMergeNode in="SourceGraphic" />
              <feMergeNode in="inner-white-final" />
              <feMergeNode in="inner-black-final" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative"
      >
        <h1
          className="text-[min(25vw,400px)] font-bold tracking-normal leading-none select-none text-white px-4"
          style={{ filter: 'url(#glass-effect)' }}
        >
          vize
        </h1>
      </motion.div>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="w-full flex flex-col items-center gap-0">
      <FooterCard />
      <GlassText />
    </footer>
  );
}
