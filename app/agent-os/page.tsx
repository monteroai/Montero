'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Camera, FileText, Package, Users, Settings, ArrowRight,
  Building2, Clock, Star, Bell, TrendingUp, Mail,
  Sparkles, ChevronRight, Plus, MessageSquare,
} from 'lucide-react'

const navy = '#1B2B5E'
const blue = '#2563eb'
const textDark = '#1e293b'
const textMuted = '#64748b'
const border = '#e2e8f0'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

interface QuickAction {
  icon: React.ReactNode
  title: string
  desc: string
  href: string
  color: string
  bg: string
}

const quickActions: QuickAction[] = [
  {
    icon: <Camera size={22} />,
    title: 'New Listing',
    desc: 'Upload photos, get MLS remarks, social copy & virtual staging — all at once',
    href: '/agent-os/photos',
    color: '#2563eb',
    bg: 'rgba(37,99,235,0.06)',
  },
  {
    icon: <FileText size={22} />,
    title: 'Write Remarks',
    desc: 'Generate polished MLS remarks tuned to your voice and style',
    href: '/agent-os/remarks',
    color: '#7c3aed',
    bg: 'rgba(124,58,237,0.06)',
  },
  {
    icon: <Package size={22} />,
    title: 'Content Pack',
    desc: 'Full marketing kit — Instagram, Facebook, email subjects & SMS',
    href: '/agent-os/content',
    color: '#059669',
    bg: 'rgba(5,150,105,0.06)',
  },
  {
    icon: <Users size={22} />,
    title: 'Collaborations',
    desc: 'Request listing intel from co-brokers and buyer agents',
    href: '/agent-os/context',
    color: '#d97706',
    bg: 'rgba(217,119,6,0.06)',
  },
]

interface ListingItem {
  id: string
  address: string
  status: 'active' | 'pending' | 'coming_soon'
  hasRemarks: boolean
  hasContent: boolean
  hasStaging: boolean
  hasContext: boolean
  price?: string
}

const demoListings: ListingItem[] = [
  { id: '1', address: '42 Riverside Ave, Cos Cob CT', status: 'active', hasRemarks: true, hasContent: true, hasStaging: false, hasContext: true, price: '$1,250,000' },
  { id: '2', address: '18 Harbor Point Rd, Stamford CT', status: 'active', hasRemarks: true, hasContent: false, hasStaging: false, hasContext: false, price: '$875,000' },
  { id: '3', address: '7 Meadow Lane, Greenwich CT', status: 'coming_soon', hasRemarks: false, hasContent: false, hasStaging: false, hasContext: false, price: '$2,100,000' },
]

interface PriorityItem {
  icon: React.ReactNode
  label: string
  detail: string
  action: string
  href: string
  urgency: 'high' | 'medium' | 'low'
}

function StatusDot({ done }: { done: boolean }) {
  return (
    <span style={{
      display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%',
      background: done ? '#16a34a' : '#d1d5db',
      border: done ? '1px solid #86efac' : '1px solid #e5e7eb',
      flexShrink: 0,
    }} />
  )
}

function StatusLabel({ label, done }: { label: string; done: boolean }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: done ? '#16a34a' : '#94a3b8', fontWeight: 500 }}>
      <StatusDot done={done} />
      {label}
    </span>
  )
}

const statusColors = {
  active: { bg: '#dcfce7', color: '#16a34a', label: 'Active' },
  pending: { bg: '#fef3c7', color: '#d97706', label: 'Pending' },
  coming_soon: { bg: '#dbeafe', color: '#2563eb', label: 'Coming Soon' },
}

export default function CommandCenter() {
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    setGreeting(getGreeting())
  }, [])

  const needsAttention: PriorityItem[] = [
    { icon: <Package size={14} />, label: '2 listings need content packs', detail: '18 Harbor Point, 7 Meadow Lane', action: 'Generate', href: '/agent-os/content', urgency: 'high' },
    { icon: <Camera size={14} />, label: '3 listings have no staged photos', detail: 'Virtual staging increases engagement 40%', action: 'Stage now', href: '/agent-os/photos', urgency: 'medium' },
    { icon: <Users size={14} />, label: '1 new context submission', detail: 'From Sarah Chen on 42 Riverside Ave', action: 'Review', href: '/agent-os/context', urgency: 'low' },
    { icon: <Mail size={14} />, label: 'Intro letters ready to send', detail: '5 new listings in your target areas', action: 'View', href: '/agent-os/remarks', urgency: 'medium' },
  ]

  const urgencyColors = {
    high: { dot: '#ef4444', bg: '#fef2f2', border: '#fecaca' },
    medium: { dot: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
    low: { dot: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 28px 80px' }}>

        {/* Greeting */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: navy, marginBottom: '4px' }}>
            {greeting}
          </h1>
          <p style={{ fontSize: '14px', color: textMuted, lineHeight: 1.6 }}>
            Your command center — everything you need for your listings, all in one place.
          </p>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '28px' }}>
          {[
            { label: 'Active Listings', value: '3', icon: <Building2 size={16} />, color: blue },
            { label: 'Content Generated', value: '12', icon: <TrendingUp size={16} />, color: '#059669' },
            { label: 'Collabs Received', value: '4', icon: <MessageSquare size={16} />, color: '#d97706' },
            { label: 'Needs Attention', value: '2', icon: <Bell size={16} />, color: '#ef4444' },
          ].map((stat) => (
            <div key={stat.label} style={{
              background: '#ffffff', border: `1px solid ${border}`, borderRadius: '12px',
              padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '8px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: stat.color, display: 'flex' }}>{stat.icon}</span>
                <span style={{ fontSize: '24px', fontWeight: 700, color: navy }}>{stat.value}</span>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: textMuted, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Sparkles size={15} style={{ color: blue }} />
            <h2 style={{ fontSize: '13px', fontWeight: 700, color: textDark, letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>
              Quick Actions
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {quickActions.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                style={{
                  background: '#ffffff', border: `1px solid ${border}`, borderRadius: '14px',
                  padding: '20px', textDecoration: 'none', transition: 'all 0.15s',
                  display: 'flex', flexDirection: 'column', gap: '10px',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = action.color;
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 1px ${action.color}20`
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = border;
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none'
                }}
              >
                <div style={{
                  width: '42px', height: '42px', borderRadius: '10px',
                  background: action.bg, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: action.color,
                }}>
                  {action.icon}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: navy }}>{action.title}</span>
                    <ArrowRight size={14} style={{ color: action.color }} />
                  </div>
                  <p style={{ fontSize: '13px', color: textMuted, lineHeight: 1.5, margin: 0 }}>
                    {action.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Two column: My Listings + Needs Attention */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '16px', marginBottom: '28px' }}>

          {/* My Listings */}
          <div style={{ background: '#ffffff', border: `1px solid ${border}`, borderRadius: '14px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={15} style={{ color: blue }} />
                <h2 style={{ fontSize: '13px', fontWeight: 700, color: textDark, letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>
                  My Listings
                </h2>
              </div>
              <button style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                fontSize: '12px', fontWeight: 600, color: blue, background: 'rgba(37,99,235,0.06)',
                border: '1px solid rgba(37,99,235,0.15)', borderRadius: '8px',
                padding: '5px 12px', cursor: 'pointer',
              }}>
                <Plus size={12} /> Add Listing
              </button>
            </div>

            <div style={{ padding: '8px' }}>
              {demoListings.map((listing, i) => {
                const st = statusColors[listing.status]
                return (
                  <div
                    key={listing.id}
                    style={{
                      padding: '14px 16px', borderRadius: '10px',
                      marginBottom: i < demoListings.length - 1 ? '4px' : 0,
                      cursor: 'pointer', transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: navy, margin: '0 0 2px' }}>{listing.address}</p>
                        {listing.price && <p style={{ fontSize: '13px', color: textMuted, margin: 0, fontWeight: 500 }}>{listing.price}</p>}
                      </div>
                      <span style={{
                        fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '9999px',
                        background: st.bg, color: st.color, letterSpacing: '0.04em', textTransform: 'uppercase',
                      }}>
                        {st.label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <StatusLabel label="Remarks" done={listing.hasRemarks} />
                      <StatusLabel label="Content" done={listing.hasContent} />
                      <StatusLabel label="Staged" done={listing.hasStaging} />
                      <StatusLabel label="Context" done={listing.hasContext} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Needs Attention */}
          <div style={{ background: '#ffffff', border: `1px solid ${border}`, borderRadius: '14px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={15} style={{ color: '#ef4444' }} />
              <h2 style={{ fontSize: '13px', fontWeight: 700, color: textDark, letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>
                Needs Attention
              </h2>
            </div>
            <div style={{ padding: '8px' }}>
              {needsAttention.map((item, i) => {
                const uc = urgencyColors[item.urgency]
                return (
                  <Link
                    key={i}
                    href={item.href}
                    style={{
                      display: 'block', padding: '12px 14px', borderRadius: '10px',
                      marginBottom: i < needsAttention.length - 1 ? '4px' : 0,
                      textDecoration: 'none', transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <span style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '28px', height: '28px', borderRadius: '8px',
                        background: uc.bg, border: `1px solid ${uc.border}`,
                        color: uc.dot, flexShrink: 0, marginTop: '1px',
                      }}>
                        {item.icon}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: textDark, margin: '0 0 2px' }}>{item.label}</p>
                        <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>{item.detail}</p>
                      </div>
                      <ChevronRight size={14} style={{ color: '#cbd5e1', flexShrink: 0, marginTop: '4px' }} />
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        {/* Bottom row: Team + Intro Letters */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

          {/* Team Overview */}
          <div style={{ background: '#ffffff', border: `1px solid ${border}`, borderRadius: '14px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={15} style={{ color: '#7c3aed' }} />
              <h2 style={{ fontSize: '13px', fontWeight: 700, color: textDark, letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>
                Team
              </h2>
            </div>
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px', color: '#7c3aed',
              }}>
                <Users size={22} />
              </div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: navy, marginBottom: '4px' }}>Team management</p>
              <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5, marginBottom: '14px' }}>
                Add agents, track performance, and coordinate listings across your team.
              </p>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                fontSize: '11px', fontWeight: 600, color: '#7c3aed',
                background: 'rgba(124,58,237,0.06)', padding: '5px 12px', borderRadius: '8px',
              }}>
                <Clock size={11} /> Coming soon
              </span>
            </div>
          </div>

          {/* Intro Letters */}
          <div style={{ background: '#ffffff', border: `1px solid ${border}`, borderRadius: '14px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={15} style={{ color: '#059669' }} />
              <h2 style={{ fontSize: '13px', fontWeight: 700, color: textDark, letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>
                Intro Letters
              </h2>
            </div>
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: 'rgba(5,150,105,0.06)', border: '1px solid rgba(5,150,105,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px', color: '#059669',
              }}>
                <Mail size={22} />
              </div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: navy, marginBottom: '4px' }}>Prospecting letters</p>
              <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5, marginBottom: '14px' }}>
                AI-generated intro letters for FSBO, expired, and target area listings.
              </p>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                fontSize: '11px', fontWeight: 600, color: '#059669',
                background: 'rgba(5,150,105,0.06)', padding: '5px 12px', borderRadius: '8px',
              }}>
                <Clock size={11} /> Coming soon
              </span>
            </div>
          </div>
        </div>

        {/* DNA Profile link */}
        <Link
          href="/agent-os/settings"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: '#ffffff', border: `1px solid ${border}`, borderRadius: '12px',
            padding: '14px 20px', marginTop: '16px', textDecoration: 'none',
            transition: 'border-color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = blue)}
          onMouseLeave={e => (e.currentTarget.style.borderColor = border)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Settings size={16} style={{ color: textMuted }} />
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: textDark, margin: 0 }}>Agent DNA & Settings</p>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>Your voice profile, preferences, and account settings</p>
            </div>
          </div>
          <ChevronRight size={16} style={{ color: '#cbd5e1' }} />
        </Link>

      </div>
    </div>
  )
}
