'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Modal from '@/components/ui/Modal'
import { Check, Shield, Globe, Users, ArrowRight, Mail, Linkedin, X } from 'lucide-react'

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
      shortBlurb: 'Operating in the background, Greta ensures every journey runs smoothly, bringing structure, calm, and follow-through to every client experience.',
      bio: 'Operating in the background, Greta ensures every journey runs smoothly, bringing structure, calm, and follow-through to every client experience. With a background in project management and high-stakes logistics, she is the engine that keeps our concierge services running precisely. Clients know Greta as the reliable voice that turns complex plans into simple, actionable steps.',
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
        linkedin: 'https://www.linkedin.com/in/greta-pudan/',
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
      icon: <Shield className="w-6 h-6" strokeWidth={1.5} />,
      title: 'Radical Transparency',
      description: 'We give you the "real talk" on neighborhoods, costs, and cultural nuances—not a sales pitch.'
    },
    {
      icon: <Users className="w-6 h-6" strokeWidth={1.5} />,
      title: 'Local First',
      description: 'Our strength lies in our deep, authentic connections with the communities we operate in.'
    },
    {
      icon: <Globe className="w-6 h-6" strokeWidth={1.5} />,
      title: 'Global Standards',
      description: 'We combine on-the-ground local knowledge with international standards of service and reliability.'
    }
  ]
  return (
    <main id="main-content" className="min-h-screen bg-neutral-50">
      {/* Hero Section - Compacted */}
      <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-24 overflow-hidden bg-neutral-900">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/40 via-neutral-900 to-secondary-900/40" />

        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-bold uppercase tracking-widest mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
              </span>
              The People of Asia Insights
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white mb-6 leading-[0.9] tracking-tighter">
              Meet the <span className="text-primary-500">Guides.</span>
            </h1>
            <p className="text-xl md:text-2xl text-neutral-300 max-w-2xl font-medium leading-relaxed mb-8">
              We aren't just consultants. We're your neighbors, fixers, and community connectors in Southeast Asia.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>

      {/* Mission & Purpose */}
      <section className="py-12 bg-white relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-black text-neutral-900 mb-8 tracking-tight">
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
                <div key={i} className="flex gap-6 p-8 rounded-2xl bg-neutral-50 hover:bg-white border border-neutral-100 hover:border-primary-100 hover:shadow-xl transition-all duration-500 group">
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
      <section className="py-12 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl lg:text-4xl font-black text-neutral-900 mb-6 tracking-tight">
              Our Core <span className="text-primary-600">Team.</span>
            </h2>
            <p className="text-xl text-neutral-600 font-medium leading-relaxed">
              Curated expertise from leaders who have built lives and businesses here.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="group relative cursor-pointer"
                onClick={() => setSelectedMember(member)}
              >
                <div className="bg-white rounded-2xl p-6 border border-neutral-100 overflow-hidden hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col h-full">

                  {/* Contained square image — inside card padding */}
                  <div className="aspect-square relative rounded-xl overflow-hidden mb-5 bg-neutral-100">
                    {member.image && !imageErrors[member.id] ? (
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        style={{ objectPosition: member.imagePosition === 'top' ? 'center top' : 'center center' }}
                        onError={() => setImageErrors(prev => ({ ...prev, [member.id]: true }))}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 text-primary-300 text-8xl font-black italic select-none">
                        {member.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Specialty tags */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {member.areasOfSpecialty.slice(0, 2).map((area, i) => (
                      <span key={i} className="px-2.5 py-1 bg-neutral-50 border border-neutral-200 text-xs font-bold uppercase tracking-wider text-neutral-600 rounded-lg">
                        {area}
                      </span>
                    ))}
                  </div>

                  {/* Name + role */}
                  <h3 className="text-2xl font-black text-neutral-900 mb-0.5 group-hover:text-primary-600 transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-sm font-bold text-primary-600 mb-3 flex items-center gap-2">
                    <span className="w-6 h-[2px] bg-primary-200 shrink-0" />
                    {member.role}
                  </p>
                  <p className="text-sm text-neutral-600 line-clamp-2 leading-relaxed mb-auto">
                    {member.shortBlurb}
                  </p>

                  {/* CTA footer */}
                  <div className="flex items-center justify-between mt-5 pt-5 border-t border-neutral-100">
                    <span className="text-xs font-black text-neutral-500 uppercase tracking-widest group-hover:text-primary-600 transition-colors">
                      Full Profile
                    </span>
                    <div className="w-8 h-8 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center text-neutral-400 group-hover:bg-primary-600 group-hover:border-primary-600 group-hover:text-white transition-all duration-300">
                      <ArrowRight className="w-4 h-4 group-hover:-rotate-45 transition-transform duration-300" strokeWidth={1.5} />
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story / Timeline teaser */}
      <section className="py-12 bg-neutral-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative">

              <h2 className="text-3xl lg:text-4xl font-black mb-8 leading-tight">
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
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-800 border border-white/10 group">
              <div className="absolute inset-0 bg-neutral-950/20 z-10 group-hover:bg-transparent transition-all duration-700" />
              <Image
                src="https://images.unsplash.com/photo-1493106819501-66d381c446a1?auto=format&fit=crop&w=1200&q=80"
                alt="Asia Connections"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover scale-105 group-hover:scale-100 transition-transform duration-1000"
              />
              <div className="absolute bottom-12 left-12 right-12 z-20">
                <div className="p-8 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl">
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
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-black text-neutral-900 mb-6 leading-tight">
            Ready to start your journey?
          </h2>
          <p className="text-xl text-neutral-600 mb-10 font-medium max-w-2xl mx-auto">
            Our team is ready to help you navigate Southeast Asia with the confidence of a local.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/concierge"
              className="inline-flex items-center justify-center gap-3 px-10 py-4 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Explore Concierge
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/businesses"
              className="inline-flex items-center justify-center px-10 py-4 bg-white hover:bg-neutral-50 border border-neutral-200 hover:border-neutral-300 text-neutral-900 font-bold rounded-2xl transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Browse Local Hubs
            </Link>
          </div>
        </div>
      </section>

      {/* Profile Modal */}
      {selectedMember && (
        <Modal
          isOpen={!!selectedMember}
          onClose={() => setSelectedMember(null)}
          size="xl"
          className="max-h-[90vh] overflow-y-auto p-0"
          hideHeader={true}
          noPadding={true}
        >
          <div className="relative bg-white flex flex-col md:flex-row">

            {/* Close button — always top-right, never in layout flow */}
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-4 right-4 z-30 p-2 bg-white/90 backdrop-blur-sm hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 rounded-full shadow-md border border-neutral-200/60 transition-all"
              aria-label="Close profile"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Sidebar — portrait photo */}
            <div className="w-full md:w-[260px] shrink-0">
              <div className="aspect-[3/4] relative bg-neutral-100 overflow-hidden md:rounded-l-2xl">
                {selectedMember.image && !imageErrors[selectedMember.id] ? (
                  <Image
                    src={selectedMember.image}
                    alt={selectedMember.name}
                    fill
                    className="object-cover"
                    style={{ objectPosition: selectedMember.imagePosition === 'top' ? 'center top' : 'center center' }}
                    onError={() => setImageErrors(prev => ({ ...prev, [selectedMember.id]: true }))}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 text-primary-300 text-6xl font-black">
                    {selectedMember.name.charAt(0)}
                  </div>
                )}
                {/* Subtle bottom fade for depth */}
                <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/30 to-transparent z-10 pointer-events-none" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 md:p-8 flex flex-col gap-5 min-w-0">

              {/* Identity — name and role at the very top */}
              <div className="pr-10">
                <p className="text-xs font-black text-primary-600 uppercase tracking-widest mb-1.5">
                  {selectedMember.role}
                </p>
                <h2 className="text-3xl font-black text-neutral-900 leading-tight mb-4">
                  {selectedMember.name}
                </h2>
                {/* Languages + social links inline under name */}
                <div className="flex flex-wrap gap-2 items-center">
                  {selectedMember.languages.map((lang, i) => (
                    <span key={i} className="px-3 py-1 bg-primary-50 border border-primary-100 text-primary-700 rounded-lg text-xs font-bold">
                      {lang}
                    </span>
                  ))}
                  {selectedMember.social?.email && (
                    <a
                      href={`mailto:${selectedMember.social.email}`}
                      className="flex items-center gap-1.5 px-3 py-1 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-bold text-neutral-600 hover:border-primary-400 hover:text-primary-600 transition-all"
                    >
                      <Mail className="w-3.5 h-3.5" strokeWidth={1.5} />
                      Email
                    </a>
                  )}
                  {selectedMember.social?.linkedin && !selectedMember.social.linkedin.endsWith('linkedin.com') && !selectedMember.social.linkedin.endsWith('linkedin.com/') && (
                    <a
                      href={selectedMember.social.linkedin}
                      target="_blank"
                      rel="noopener"
                      className="flex items-center gap-1.5 px-3 py-1 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-bold text-neutral-600 hover:border-[#0077b5] hover:text-[#0077b5] transition-all"
                    >
                      <Linkedin className="w-3.5 h-3.5" strokeWidth={1.5} />
                      LinkedIn
                    </a>
                  )}
                  {selectedMember.social?.instagram && !selectedMember.social.instagram.endsWith('instagram.com') && !selectedMember.social.instagram.endsWith('instagram.com/') && (
                    <a
                      href={selectedMember.social.instagram}
                      target="_blank"
                      rel="noopener"
                      className="flex items-center gap-1.5 px-3 py-1 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-bold text-neutral-600 hover:border-[#E1306C] hover:text-[#E1306C] transition-all"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                      Instagram
                    </a>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="w-10 h-[2px] bg-primary-200 rounded-full" />

              {/* About */}
              <div>
                <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">About</h3>
                <p className="text-[15px] text-neutral-600 leading-relaxed font-medium">
                  {selectedMember.bio}
                </p>
              </div>

              {/* Focus Areas */}
              <div>
                <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">Focus Areas</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedMember.areasOfSpecialty.map((area, index) => (
                    <span key={index} className="px-3 py-1.5 bg-neutral-50 border border-neutral-100 text-neutral-700 rounded-xl font-bold text-sm">
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              {/* At a Glance */}
              <div>
                <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">At a Glance</h3>
                <div className="flex flex-col gap-2">
                  {selectedMember.atAGlance.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                      <div className="w-5 h-5 rounded-full bg-white text-primary-600 flex items-center justify-center shrink-0 shadow-sm mt-0.5 border border-primary-100">
                        <Check className="w-3 h-3 stroke-[3px]" />
                      </div>
                      <span className="text-sm text-neutral-700 font-medium leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </Modal>
      )}
    </main>
  )
}
