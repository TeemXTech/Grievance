"use client"

import { Shield, Landmark, ChevronDown } from "lucide-react"
import { signOut } from "next-auth/react"
import type { LucideIcon } from "lucide-react"

export interface NavItem {
  key: string
  label: string
  Icon: LucideIcon
  badge?: number
}

interface SidebarProps {
  items: NavItem[]
  active: string
  onNav: (key: string) => void
  role?: string
  userName?: string
}

export function GovSidebar({ items, active, onNav, role, userName }: SidebarProps) {
  const initials = userName ? userName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "U"

  return (
    <aside className="gov-sidebar">
      {/* Brand */}
      <div className="gov-sidebar-brand">
        <div className="gov-sidebar-emblem">
          <Shield size={18} color="#7eb3ff" />
        </div>
        <div className="gov-sidebar-brand-text">
          <strong>Government of</strong>
          <span>Telangana &</span>
          <span>Andhra Pradesh</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="gov-nav">
        {items.map(({ key, label, Icon, badge }) => (
          <button
            key={key}
            className={`gov-nav-item${active === key ? " active" : ""}`}
            onClick={() => onNav(key)}
          >
            <Icon size={15} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{label}</span>
            {badge != null && badge > 0 && (
              <span className="gov-nav-badge">{badge}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="gov-sidebar-bottom">
        <Landmark size={28} color="rgba(255,255,255,0.1)" />
        <div className="gov-sidebar-tagline">
          Better Governance.<br />A Stronger Tomorrow.
        </div>
        {/* User identity */}
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(47,111,237,0.4)", display: "grid", placeItems: "center", fontSize: 10, fontWeight: 800, color: "white", flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.8)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userName || "User"}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{role}</div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            style={{ marginLeft: "auto", background: "none", border: "none", color: "rgba(255,255,255,0.35)", cursor: "pointer", padding: 2 }}
            title="Sign out"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  )
}
