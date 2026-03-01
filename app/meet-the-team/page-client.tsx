'use client'

import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check,
  Shield,
  Globe,
  Users,
  ArrowRight,
  Mail,
  Linkedin,
  X,
  Instagram,
  Star,
  Zap,
  Heart
} from 'lucide-react'
import HapticLink from '@/components/ui/HapticLink'

// --- Types ---

interface TeamMember {
  id: string
  name: string
  role: string
  shortBlurb: string
  bio: string
  atAGlance: string[]
  languages: string[]
  areasOfSpecialty: string[]
  image: string
  social?: {
    linkedin?: string
    twitter?: string
    instagram?: string
    email?: string
  }
  imagePosition?: string
  accentColor?: string
}

// --- Data ---

const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'sam',
    name: 'Sam Kavanagh',
    role: 'Founder & Community Lead',
    shortBlurb: 'A decade of on-the-ground experience guiding relocation and life transitions across Southeast Asia.',
    bio: 'Sam has lived and worked across Southeast Asia for over a decade, helping people navigate relocation, travel, and life transitions with clarity and confidence. He founded Asia Insights with the belief that moving to a new country shouldn\'t mean starting from scratch. By bridging the gap between digital information and on-the-ground reality, Sam has helped hundreds of individuals and families find their footing in record time.',
    atAGlance: [
      '10+ years residency in SE Asia',
      'Strategic community architect',
      'Expert in cross-border logistics',
      'Founded Asia Insights in 2022',
    ],
    languages: ['English'],
    areasOfSpecialty: [
      'Relocation Strategy',
      'Community Building',
      'Strategic Introductions',
      'Problem Solving',
    ],
    image: '/images/team/sam.jpg',
    social: {
      linkedin: 'https://linkedin.com',
      email: 'sam@asiainsights.com'
    },
    accentColor: 'primary'
  },
  {
    id: 'greta',
    name: 'Greta Pudan',
    role: 'Operations & Client Support',
    shortBlurb: 'The structural engine of Asia Insights, ensuring precision, calm, and follow-through in every client journey.',
    bio: 'Operating in the background, Greta ensures every journey runs smoothly, bringing structure, calm, and follow-through to every client experience. With a background in project management and high-stakes logistics, she is the engine that keeps our concierge services running precisely. Clients know Greta as the reliable voice that turns complex plans into simple, actionable steps.',
    atAGlance: [
      'Precision logistics expert',
      'Detail-oriented communicator',
      'Project management background',
      'Client relationship lead',
    ],
    languages: ['English'],
    areasOfSpecialty: [
      'Client Coordination',
      'Logistics Management',
      'Concierge Operations',
      'Process Design',
    ],
    image: '/images/team/greta.jpg',
    social: {
      linkedin: 'https://www.linkedin.com/in/greta-pudan/',
      email: 'greta@asiainsights.com'
    },
    accentColor: 'secondary'
  },
  {
    id: 'tita',
    name: 'Giovanni "Tita"',
    role: 'Local Partnerships & Experiences',
    shortBlurb: 'Unmatched local network connecting clients to the authentic heart of our communities.',
    bio: 'Known locally as "Tita," Giovanni connects people with places, partners, and experiences that feel personal rather than packaged. A natural connector with an unparalleled network of local artisans, venue owners, and community leaders, Tita ensures that Asia Insights clients get access to the true heart of every destination, far beyond the typical expat bubble.',
    atAGlance: [
      'Veteran local connector',
      'Community liaison expert',
      'Artisan discovery lead',
      'Experience curator',
    ],
    languages: ['English', 'Italian'],
    areasOfSpecialty: [
      'Local Partnerships',
      'Cultural Curation',
      'On-Ground Logistics',
      'Asset Discovery',
    ],
    image: '/images/team/tita.jpg',
    imagePosition: 'top',
    social: {
      instagram: 'https://instagram.com',
      email: 'tita@asiainsights.com'
    },
    accentColor: 'primary'
  },
]

// --- Components ---

function BadgeCard({ icon, title, items }: { icon: React.ReactNode, title: string, items: string[] }) {
  return (
    <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 hover:border-teal-200 transition-all duration-300 group">
      <div className="flex items-center gap-3 mb-4">
        <div className="text-neutral-400 group-hover:text-teal-600 transition-colors">
          {icon}
        </div>
        <h4 className="text-xs font-black text-neutral-500 uppercase tracking-widest">{title}</h4>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="px-3 py-1.5 bg-teal-50 border border-teal-100 text-teal-700 rounded-lg text-xs font-bold hover:bg-teal-100 hover:border-teal-200 transition-all cursor-default"
          >
            {item}
          </motion.span>
        ))}
      </div>
    </div>
  )
}

function SocialLink({ href, icon: Icon, label }: { href: string, icon: any, label: string }) {
  return (
    <HapticLink
      href={href}
      className="flex items-center gap-2 px-3.5 py-2 bg-white border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-600 hover:border-teal-200 hover:text-teal-700 hover:bg-teal-50 transition-all duration-200 group"
    >
      <Icon className="w-3.5 h-3.5 group-hover:scale-110 transition-transform duration-200" />
      <span>{label}</span>
    </HapticLink>
  )
}

// --- Main Page Client ---

export default function MeetTheTeamClient() {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

  const handleClose = useCallback(() => setSelectedMember(null), [])

  // Keyboard escape
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', down)
    return () => window.removeEventListener('keydown', down)
  }, [handleClose])

  // Prevent scroll when modal open
  useEffect(() => {
    if (selectedMember) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [selectedMember])

  return (
    <main id="main-content" className="min-h-screen bg-neutral-50 selection:bg-primary-100 selection:text-primary-900">

      {/* Editorial Hero */}
      <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden bg-neutral-900">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-neutral-900 to-secondary-900/20" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl"
          >
            <div className="inline-flex items-center gap-3 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-primary-400 text-[10px] font-black uppercase tracking-widest mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
              </span>
              The Vision Carriers
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 leading-[0.85] tracking-tighter">
              Meet the <span className="text-primary-500 italic">Core.</span>
            </h1>
            <p className="text-xl md:text-2xl text-neutral-400 max-w-2xl font-medium leading-relaxed mb-12">
              We are not consultants. We are residents, fixers, and connectors. We build the infrastructure so you can build your life.
            </p>
            <HapticLink
              href="/contact"
              className="inline-flex items-center justify-center px-10 py-4 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-2xl transition-all duration-300 shadow-xl shadow-primary-900/40 hover:-translate-y-1"
            >
              Start Your Journey
            </HapticLink>
          </motion.div>
        </div>
      </section>

      {/* Team Grid */}
      <section className="py-24 bg-neutral-50 relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {TEAM_MEMBERS.map((member, idx) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="group relative"
                onClick={() => setSelectedMember(member)}
              >
                <div className="bg-white rounded-[2rem] p-4 border border-neutral-200/60 overflow-hidden cursor-pointer hover:shadow-xl hover:border-teal-100 transition-all duration-300 flex flex-col h-full active:scale-[0.98]">

                  {/* Image */}
                  <div className="aspect-[4/5] relative rounded-[1.5rem] overflow-hidden bg-neutral-100 mb-5">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      style={{ objectPosition: member.imagePosition === 'top' ? 'center top' : 'center center' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Floating role on hover */}
                    <div className="absolute bottom-5 left-5 right-5 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-semibold uppercase tracking-widest rounded-md">
                        {member.role}
                      </span>
                    </div>
                  </div>

                  {/* Text */}
                  <div className="flex flex-col flex-1 px-1 pb-5">
                    <h3 className="text-3xl font-black text-neutral-900 tracking-tight mb-2 group-hover:text-teal-600 transition-colors duration-200">
                      {member.name}
                    </h3>
                    <p className="text-[11px] font-semibold text-teal-600 uppercase tracking-[0.2em] mb-3">
                      {member.role}
                    </p>
                    <p className="text-[13px] text-neutral-500 leading-[1.7] mb-5 line-clamp-2">
                      {member.shortBlurb}
                    </p>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex gap-1.5">
                        {member.areasOfSpecialty.slice(0, 2).map((s, i) => (
                          <span key={i} className="px-2.5 py-1 text-[10px] font-semibold text-neutral-400 uppercase tracking-wide bg-neutral-50 border border-neutral-100 rounded-md">
                            {s}
                          </span>
                        ))}
                      </div>
                      <div className="w-9 h-9 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-400 group-hover:bg-teal-600 group-hover:border-teal-600 group-hover:text-white transition-all duration-200 shrink-0">
                        <ArrowRight className="w-4 h-4 group-hover:-rotate-45 transition-transform duration-200" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values / Trust Section */}
      <section className="py-24 bg-white border-y border-neutral-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            <div className="flex flex-col justify-center">
              <h2 className="text-4xl md:text-5xl font-black text-neutral-900 mb-7 leading-[0.9] tracking-tighter">
                Bridging the <br /><span className="text-teal-600">Reality Gap.</span>
              </h2>
              <p className="text-[15px] text-neutral-500 leading-[1.8] mb-8">
                Asia Insights was born from a simple realization: the internet is full of "expert" advice, but true peace of mind comes from having a real person you can trust on the ground.
              </p>

              <div className="space-y-3">
                {[
                  { icon: <Shield className="w-4 h-4" />, title: 'Radical Transparency', desc: 'Real talk on neighborhoods and costs.' },
                  { icon: <Users className="w-4 h-4" />, title: 'Local First', desc: 'Deep, authentic community connections.' },
                  { icon: <Globe className="w-4 h-4" />, title: 'Global Standards', desc: 'International service levels.' }
                ].map((v, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-100 hover:border-teal-100 transition-colors duration-200 group">
                    <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:border-teal-600 group-hover:text-white transition-all duration-200 shrink-0">
                      {v.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-neutral-900 text-[14px] mb-0.5">{v.title}</h4>
                      <p className="text-[13px] text-neutral-500 leading-snug">{v.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative h-[360px] md:h-[460px] lg:h-auto lg:min-h-[480px] rounded-[2rem] overflow-hidden bg-neutral-100">
              <Image
                src="https://images.unsplash.com/photo-1493106819501-66d381c446a1?auto=format&fit=crop&w=1200&q=80"
                alt="Team on the ground in Southeast Asia"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                style={{ objectPosition: 'center center' }}
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-neutral-900/50 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 p-6 backdrop-blur-md bg-white/10 border border-white/20 rounded-[1.5rem]">
                <p className="text-lg md:text-xl font-semibold text-white italic leading-[1.6]">
                  "Insight isn't in a brochure. It's in the actual daily reality of on-the-ground presence."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Member Modal */}
      <AnimatePresence>
        {selectedMember && (
          <div className="fixed inset-0 z-[2100] flex items-center justify-center p-4 md:p-6 lg:p-8">

            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={handleClose}
              className="absolute inset-0 bg-neutral-900/60 backdrop-blur-md"
            />

            {/* Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 12 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-4xl bg-white border border-neutral-200 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row max-h-[92vh] z-50"
            >

              {/* Close */}
              <button
                onClick={handleClose}
                aria-label="Close"
                className="absolute top-5 right-5 z-[70] p-2.5 bg-white border border-neutral-200 hover:border-neutral-300 text-neutral-400 hover:text-neutral-800 rounded-full transition-all duration-200 active:scale-90 shadow-sm group"
              >
                <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
              </button>

              {/* ── Left: Identity Panel ───────────────────────────── */}
              <div className="w-full lg:w-[38%] shrink-0 relative flex flex-col items-center justify-center p-10 text-center border-b lg:border-b-0 lg:border-r border-neutral-100 bg-neutral-50">
                <div className="absolute inset-0 bg-gradient-to-b from-teal-50/60 via-transparent to-transparent pointer-events-none" />

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.4 }}
                  className="relative z-10 flex flex-col items-center"
                >
                  {/* Photo */}
                  <div className="relative w-44 h-44 lg:w-48 lg:h-48 rounded-full overflow-hidden border-4 border-white ring-1 ring-teal-100 shadow-lg mb-6 shrink-0">
                    <Image
                      src={selectedMember.image}
                      alt={selectedMember.name}
                      fill
                      className="object-cover"
                      style={{ objectPosition: selectedMember.imagePosition === 'top' ? 'center top' : 'center center' }}
                      priority
                    />
                  </div>

                  {/* Role */}
                  <p className="text-[10px] font-semibold text-teal-600 uppercase tracking-[0.3em] mb-2">
                    {selectedMember.role}
                  </p>

                  {/* Name */}
                  <h2 className="text-3xl lg:text-[2.15rem] font-black text-neutral-900 tracking-tight leading-tight">
                    {selectedMember.name}
                  </h2>

                  {/* Divider */}
                  <div className="w-8 h-[2px] bg-teal-300 rounded-full mt-5 mb-6" />

                  {/* Social links */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    {selectedMember.social?.email && (
                      <SocialLink href={`mailto:${selectedMember.social.email}`} icon={Mail} label="Email" />
                    )}
                    {selectedMember.social?.linkedin && (
                      <SocialLink href={selectedMember.social.linkedin} icon={Linkedin} label="LinkedIn" />
                    )}
                    {selectedMember.social?.instagram && (
                      <SocialLink href={selectedMember.social.instagram} icon={Instagram} label="Instagram" />
                    )}
                  </div>
                </motion.div>
              </div>

              {/* ── Right: Content Panel ───────────────────────────── */}
              <div className="flex-1 overflow-y-auto custom-scrollbar bg-white flex flex-col">
                <div className="p-8 lg:p-10 flex flex-col flex-1">

                  {/* Languages */}
                  <div className="flex items-center gap-2 mb-7">
                    {selectedMember.languages.map((l, i) => (
                      <span key={i} className="px-3 py-1 bg-teal-50 border border-teal-100 text-teal-700 rounded-md text-[10px] font-bold uppercase tracking-widest">
                        {l}
                      </span>
                    ))}
                  </div>

                  {/* Bio */}
                  <div className="mb-7">
                    <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-[0.25em] mb-3">About</p>
                    <p className="text-[14.5px] text-neutral-600 leading-[1.8]">
                      {selectedMember.bio}
                    </p>
                  </div>

                  <div className="border-t border-neutral-100 mb-7" />

                  {/* Info modules */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-7 mb-7">

                    {/* At a Glance */}
                    <div>
                      <div className="flex items-center gap-2.5 mb-4">
                        <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                          <Zap className="w-3.5 h-3.5 text-teal-600" />
                        </div>
                        <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-[0.2em]">At a Glance</p>
                      </div>
                      <ul className="space-y-3">
                        {selectedMember.atAGlance.map((item, i) => (
                          <li key={i} className="group/item flex items-start gap-2.5 text-[13px] font-medium text-neutral-700 leading-snug">
                            <div className="w-1 h-1 rounded-full bg-teal-400 mt-[6px] shrink-0 group-hover/item:bg-teal-600 transition-colors duration-200" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Focus Areas */}
                    <div>
                      <div className="flex items-center gap-2.5 mb-4">
                        <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                          <Star className="w-3.5 h-3.5 text-amber-500" />
                        </div>
                        <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-[0.2em]">Focus Areas</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedMember.areasOfSpecialty.map((item, i) => (
                          <span key={i} className="px-3 py-1.5 bg-amber-50 border border-amber-100 text-amber-700 rounded-lg text-[11px] font-semibold hover:border-amber-200 transition-colors duration-200 cursor-default">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer CTA */}
                  <div className="border-t border-neutral-100 pt-6 mt-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[9px] font-semibold text-neutral-400 uppercase tracking-widest leading-none mb-1">Community Trusted</p>
                        <p className="text-[13px] font-bold text-neutral-800 leading-none">Verified Resident Professional</p>
                      </div>
                    </div>
                    <HapticLink
                      href="/contact"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 text-sm shrink-0"
                    >
                      Book a Consultation
                      <ArrowRight className="w-4 h-4" />
                    </HapticLink>
                  </div>

                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
      `}</style>
    </main>
  )
}
