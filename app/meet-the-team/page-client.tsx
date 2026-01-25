'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Modal from '@/components/ui/Modal'
import { Check, Shield, Globe, Users, ArrowRight, Mail, Linkedin, Twitter, X } from 'lucide-react'
import { cn } from '@/lib/utils'

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
}

export default function MeetTheTeamClient() {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

  const teamMembers: TeamMember[] = [
    {
      id: 'sam',
      name: 'Sam',
      role: 'Founder & Community Lead',
      shortBlurb: 'Sam has lived and worked across Southeast Asia for over a decade, helping people navigate relocation, travel, and life transitions with clarity and confidence.',
      bio: 'Sam has lived and worked across Southeast Asia for over a decade, helping people navigate relocation, travel, and life transitions with clarity and confidence. He founded Asia Insights with the belief that moving to a new country shouldn\'t mean starting from scratch. By bridging the gap between digital information and on-the-ground reality, Sam has helped hundreds of individuals and families find their footing in record time.',
      atAGlance: [
        'Lived and worked across Southeast Asia for 10+ years',
        'Built Asia Insights after helping friends relocate one message at a time',
        'Strong believer in taking online connections offline',
        'Known for solving complex, cross-border challenges',
      ],
      languages: ['English'],
      areasOfSpecialty: [
        'Relocation support',
        'Community building',
        'Strategic introductions',
        'Complex problem-solving',
      ],
      image: '/images/team/sam.jpg',
      social: {
        linkedin: 'https://linkedin.com',
        email: 'sam@asiainsights.com'
      }
    },
    {
      id: 'greta',
      name: 'Greta',
      role: 'Operations & Client Support',
      shortBlurb: 'Greta ensures every journey runs smoothly, bringing structure, calm, and follow-through to every client experience.',
      bio: 'Greta ensures every journey runs smoothly, bringing structure, calm, and follow-through to every client experience. With a background in project management and high-stakes logistics, she is the engine that keeps our concierge services running precisely. Clients know Greta as the reliable voice that turns complex plans into simple, actionable steps.',
      atAGlance: [
        'Calm and reliable point of contact',
        'Keeps multi-step plans on track',
        'Detail-oriented and highly organised',
        'Trusted for clarity and consistency',
      ],
      languages: ['English'],
      areasOfSpecialty: [
        'Client coordination',
        'Logistics support',
        'Ongoing concierge care',
      ],
      image: '/images/team/greta.jpg',
      social: {
        linkedin: 'https://linkedin.com',
        email: 'greta@asiainsights.com'
      }
    },
    {
      id: 'tita',
      name: 'Tita',
      role: 'Local Partnerships & Experiences',
      shortBlurb: 'Known locally as "Tita," Giovanni connects people with places, partners, and experiences that feel personal rather than packaged.',
      bio: 'Known locally as "Tita," Giovanni connects people with places, partners, and experiences that feel personal rather than packaged. A natural connector with an unparalleled network of local artisans, venue owners, and community leaders, Tita ensures that Asia Insights clients get access to the true heart of every destination, far beyond the typical expat bubble.',
      atAGlance: [
        'Known locally as "Tita"',
        'Deeply connected to local communities',
        'Enjoys creating authentic experiences',
        'Natural connector of people and places',
      ],
      languages: ['English', 'Italian'],
      areasOfSpecialty: [
        'Local partnerships',
        'Cultural experiences',
        'On-the-ground coordination',
      ],
      image: '/images/team/tita.jpg',
      imagePosition: 'top',
      social: {
        instagram: 'https://instagram.com',
        email: 'tita@asiainsights.com'
      }
    },
  ]

  const values = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Radical Transparency',
      description: 'We give you the "real talk" on neighborhoods, costs, and cultural nuances—not a sales pitch.'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Local First',
      description: 'Our strength lies in our deep, authentic connections with the communities we operate in.'
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: 'Global Standards',
      description: 'We combine on-the-ground local knowledge with international standards of service and reliability.'
    }
  ]
  return (
    <main id="main-content" className="min-h-screen bg-neutral-50">
      {/* Hero Section - High Fidelity */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-40 overflow-hidden bg-neutral-900">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/40 via-neutral-900 to-secondary-900/40" />
          <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary-600/10 via-transparent to-transparent blur-3xl" />
        </div>

        <div className="container-custom relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-bold uppercase tracking-widest mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
              </span>
              The People of Asia Insights
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-black text-white mb-8 leading-[0.9] tracking-tighter">
              Meet the <span className="text-primary-500">Guides.</span>
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl text-neutral-300 max-w-2xl font-medium leading-relaxed">
              We aren't just consultants. We're your neighbors, fixers, and community connectors in Southeast Asia.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Purpose */}
      <section className="py-24 bg-white relative">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-neutral-900 mb-8 tracking-tight">
                Bridging the <span className="text-primary-600">Gap.</span>
              </h2>
              <div className="space-y-6 text-lg text-neutral-600 leading-relaxed font-medium">
                <p>
                  Asia Insights was born from a simple realization: the internet is full of "expert" advice, but true peace of mind comes from having a real person you can trust on the ground.
                </p>
                <p>
                  Our team brings together decades of residency, business building, and community leadership across the region. We don't just point you to a villa; we tell you which cafe has the best coffee and which landlord actually fixes things.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {values.map((value, i) => (
                <div key={i} className="flex gap-6 p-8 rounded-3xl bg-neutral-50 hover:bg-white border border-neutral-100 hover:border-primary-100 hover:shadow-xl transition-all duration-500 group">
                  <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-primary-600 shadow-sm group-hover:bg-primary-600 group-hover:text-white transition-colors duration-500">
                    {value.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-neutral-900 mb-2 truncate">{value.title}</h3>
                    <p className="text-neutral-600 leading-relaxed">{value.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Grid - Premium Cards */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-white to-transparent" />
        <div className="container-custom relative">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-6xl font-black text-neutral-900 mb-6 tracking-tight">
              Our Core <span className="text-primary-600">Team.</span>
            </h2>
            <p className="text-xl text-neutral-600 font-medium leading-relaxed">
              Curated expertise from leaders who have built lives and businesses here.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="group relative"
                onClick={() => setSelectedMember(member)}
              >
                {/* Visual Backdrop */}
                <div className="absolute inset-0 bg-primary-600 rounded-[2.5rem] translate-x-2 translate-y-2 opacity-0 group-hover:opacity-100 transition-all duration-500" />

                <div className="relative bg-white rounded-[2.5rem] p-4 lg:p-6 border border-neutral-200 overflow-hidden hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all duration-500 cursor-pointer shadow-sm hover:shadow-2xl">
                  {/* Image Holder */}
                  <div className="aspect-square relative rounded-[2rem] overflow-hidden mb-6 bg-neutral-100">
                    {member.image && !imageErrors[member.id] ? (
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        style={{ objectPosition: member.imagePosition || 'center' }}
                        onError={() => setImageErrors(prev => ({ ...prev, [member.id]: true }))}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 text-primary-200 text-8xl font-black italic select-none">
                        {member.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Specialty Tags - Below Image */}
                  <div className="flex flex-wrap gap-2 mb-6 min-h-[32px]">
                    {member.areasOfSpecialty.slice(0, 2).map((area, i) => (
                      <span key={i} className="px-3 py-1.5 bg-neutral-50 border border-neutral-200 text-[11px] font-bold uppercase tracking-wider text-neutral-700 rounded-lg">
                        {area}
                      </span>
                    ))}
                  </div>

                  <div className="px-2 pb-4">
                    <h3 className="text-3xl font-black text-neutral-900 mb-1 group-hover:text-primary-600 transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-primary-600 font-bold mb-4 flex items-center gap-2">
                      <span className="w-8 h-[2px] bg-primary-200" />
                      {member.role}
                    </p>
                    <p className="text-neutral-600 line-clamp-2 leading-relaxed mb-8 h-[48px]">
                      {member.shortBlurb}
                    </p>

                    <div className="flex items-center justify-between border-t border-neutral-100 pt-6">
                      <button className="flex items-center gap-2 text-sm font-black text-neutral-900 group-hover:gap-4 transition-all uppercase tracking-widest">
                        Full Profile
                        <ArrowRight className="w-4 h-4 text-primary-600" />
                      </button>

                      <div className="flex gap-3">
                        {member.social?.linkedin && (
                          <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center text-neutral-400 hover:text-primary-600 transition-colors">
                            <Linkedin className="w-4 h-4" />
                          </div>
                        )}
                        {member.social?.email && (
                          <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center text-neutral-400 hover:text-primary-600 transition-colors">
                            <Mail className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story / Timeline teaser */}
      <section className="py-24 bg-neutral-900 text-white overflow-hidden">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary-600/20 rounded-full blur-3xl animate-pulse" />
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-8 leading-tight">
                Over a decade of <span className="text-primary-500 italic">presence.</span>
              </h2>
              <div className="space-y-8 relative z-10">
                {[
                  { year: '2014', event: 'First foundation in Southeast Asia' },
                  { year: '2018', event: 'Community grows to 1,000+ residents' },
                  { year: '2022', event: 'Asia Insights officially launched' },
                  { year: '2024', event: 'New Hub system activated' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 items-start">
                    <span className="text-2xl font-black text-primary-500 opacity-50 shrink-0">{item.year}</span>
                    <p className="text-xl text-neutral-300 font-medium pt-1.5">{item.event}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden bg-neutral-800 border border-white/10 group">
              <div className="absolute inset-0 bg-neutral-950/20 z-10 group-hover:bg-transparent transition-all duration-700" />
              <Image
                src="https://images.unsplash.com/photo-1493106819501-66d381c446a1?auto=format&fit=crop&w=1200&q=80"
                alt="Asia Connections"
                fill
                className="object-cover scale-105 group-hover:scale-100 transition-transform duration-1000"
              />
              <div className="absolute bottom-12 left-12 right-12 z-20">
                <div className="p-8 backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl">
                  <p className="text-2xl font-bold italic mb-4 leading-relaxed">
                    "Real insight isn't found in a brochure. It's found in the living, breathing reality of on-the-ground experience."
                  </p>
                  <span className="text-primary-400 font-black uppercase tracking-widest text-sm">— Sam Kavanagh</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="container-custom">
          <div className="relative p-12 lg:p-24 rounded-[4rem] bg-gradient-to-br from-primary-600 to-secondary-600 text-white shadow-2xl overflow-hidden group">
            {/* Decorative Bubbles */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-110 transition-transform duration-1000" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-20 -mb-20 blur-2xl" />

            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <h2 className="text-4xl lg:text-6xl font-black mb-8 leading-tight">
                Ready to start your <span className="text-neutral-900/40">journey?</span>
              </h2>
              <p className="text-xl text-white/90 mb-12 font-medium">
                Our team is ready to help you navigate Southeast Asia with the confidence of a local.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link
                  href="/concierge"
                  className="px-10 py-5 bg-white text-primary-600 font-extrabold rounded-2xl hover:bg-neutral-100 transition-all shadow-lg hover:shadow-2xl flex items-center justify-center gap-3 group/btn"
                >
                  Explore Concierge
                  <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/businesses"
                  className="px-10 py-5 bg-primary-700/30 backdrop-blur-md border border-white/20 text-white font-extrabold rounded-2xl hover:bg-white/20 transition-all flex items-center justify-center gap-3"
                >
                  Browse Local Hubs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Profile Modal */}
      {selectedMember && (
        <Modal
          isOpen={!!selectedMember}
          onClose={() => setSelectedMember(null)}
          size="xl"
          className="max-h-[90vh] overflow-y-auto"
          hideHeader={true}
          noPadding={true}
        >
          <div className="relative bg-white min-h-[600px] flex flex-col md:flex-row">
            {/* Close Button - Desktop (Top Right of Modal) */}
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-4 right-4 z-50 p-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-900 rounded-full transition-all"
              aria-label="Close profile"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Sidebar (Left) */}
            <div className="w-full md:w-[320px] shrink-0 bg-neutral-50 border-b md:border-b-0 md:border-r border-neutral-100 p-6 md:p-8 flex flex-col gap-6">
              {/* Profile Image */}
              <div className="aspect-[3/4] relative rounded-2xl overflow-hidden shadow-md bg-neutral-200 ring-1 ring-black/5">
                {selectedMember.image && !imageErrors[selectedMember.id] ? (
                  <Image
                    src={selectedMember.image}
                    alt={selectedMember.name}
                    fill
                    className="object-cover"
                    onError={() => setImageErrors(prev => ({ ...prev, [selectedMember.id]: true }))}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-100 to-secondary-100 text-primary-300 text-6xl font-black">
                    {selectedMember.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Connect Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest pl-1">Connect</h3>
                <div className="flex flex-col gap-2">
                  {selectedMember.social?.email && (
                    <a href={`mailto:${selectedMember.social.email}`} className="flex items-center gap-3 p-3 bg-white border border-neutral-200 rounded-xl hover:border-primary-500 hover:text-primary-600 transition-all text-sm font-bold shadow-sm group">
                      <Mail className="w-4 h-4 text-neutral-400 group-hover:text-primary-500 transition-colors" />
                      <span className="truncate">{selectedMember.social.email}</span>
                    </a>
                  )}
                  {selectedMember.social?.linkedin && (
                    <a href={selectedMember.social.linkedin} target="_blank" rel="noopener" className="flex items-center gap-3 p-3 bg-white border border-neutral-200 rounded-xl hover:border-[#0077b5] hover:text-[#0077b5] transition-all text-sm font-bold shadow-sm group">
                      <Linkedin className="w-4 h-4 text-neutral-400 group-hover:text-[#0077b5] transition-colors" />
                      <span>LinkedIn Profile</span>
                    </a>
                  )}
                  {selectedMember.social?.instagram && (
                    <a href={selectedMember.social.instagram} target="_blank" rel="noopener" className="flex items-center gap-3 p-3 bg-white border border-neutral-200 rounded-xl hover:border-[#E1306C] hover:text-[#E1306C] transition-all text-sm font-bold shadow-sm group">
                      <svg className="w-4 h-4 text-neutral-400 group-hover:text-[#E1306C] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                      <span>Instagram</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Languages */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest pl-1">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedMember.languages.map((language, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-white border border-neutral-200 text-neutral-600 rounded-lg font-bold text-xs shadow-sm"
                    >
                      {language}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Content (Right) */}
            <div className="flex-1 p-8 md:p-12 overflow-y-auto max-h-[90vh]">
              <div className="max-w-2xl">
                <div className="mb-10">
                  <h2 className="text-4xl md:text-5xl font-black text-neutral-900 mb-3 tracking-tight leading-none">
                    {selectedMember.name}
                  </h2>
                  <p className="text-primary-600 font-bold text-xl flex items-center gap-2">
                    {selectedMember.role}
                  </p>
                </div>

                <div className="space-y-12">
                  {/* Bio */}
                  <div>
                    <h3 className="text-sm font-black text-neutral-400 uppercase tracking-widest mb-4">Background</h3>
                    <p className="text-lg md:text-xl text-neutral-600 leading-relaxed font-medium">
                      {selectedMember.bio}
                    </p>
                  </div>

                  {/* Specialties */}
                  <div>
                    <h3 className="text-sm font-black text-neutral-400 uppercase tracking-widest mb-4">Focus Areas</h3>
                    <div className="flex flex-wrap gap-2.5">
                      {selectedMember.areasOfSpecialty.map((area, index) => (
                        <span
                          key={index}
                          className="px-5 py-2.5 bg-neutral-50 border border-neutral-100 text-neutral-700 rounded-xl font-bold text-sm hover:bg-white hover:shadow-md transition-all cursor-default"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* At a Glance */}
                  <div>
                    <h3 className="text-sm font-black text-neutral-400 uppercase tracking-widest mb-4">At a Glance</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {selectedMember.atAGlance.map((item, index) => (
                        <div key={index} className="flex items-start gap-4 p-4 rounded-2xl bg-primary-50/30 border border-primary-100/50">
                          <div className="w-6 h-6 rounded-full bg-white text-primary-600 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                            <Check className="w-3.5 h-3.5 stroke-[3px]" />
                          </div>
                          <span className="text-neutral-700 font-bold leading-relaxed">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </main>
  )
}
