const fs = require('fs')

let content = fs.readFileSync('app/minister/dashboard/page.tsx', 'utf8')

// 1. Add useSession import
content = content.replace(
  `import { useState, useEffect, useCallback } from "react"`,
  `import { useState, useEffect, useCallback } from "react"\nimport { useSession } from "next-auth/react"`
)

// 2. Add session state after the existing state declarations
content = content.replace(
  `  const now = new Date()`,
  `  const { data: session } = useSession()\n  const ministerName = session?.user?.name || "Minister"\n  const initials = ministerName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()\n\n  const now = new Date()`
)

// 3. Fix hardcoded "D. Sridhar Babu" in sidebar
content = content.replace(
  `            <strong>D. Sridhar Babu</strong>`,
  `            <strong>{ministerName}</strong>`
)

// 4. Fix hardcoded "DS" avatar in sidebar
content = content.replace(
  `            <span>DS</span>\n            <div>\n              <strong>{ministerName}</strong>`,
  `            <span>{initials}</span>\n            <div>\n              <strong>{ministerName}</strong>`
)

// 5. Fix hardcoded "DS" in topbar avatar
content = content.replace(
  `            <div className="portal-avatar">DS</div>`,
  `            <div className="portal-avatar">{initials}</div>`
)

// 6. Make the 4 minister-stats articles clickable with navigation
content = content.replace(
  `            <section className="minister-stats" aria-label="Executive summary">
              <article>
                <span>Petitions awaiting action</span>
                <strong>{loading ? "—" : stats?.pendingPetitions ?? 0}</strong>
                <small><b>{overdue.length} overdue</b> · need immediate attention</small>
              </article>
              <article>
                <span>Total petitions received</span>
                <strong>{loading ? "—" : stats?.totalPetitions ?? 0}</strong>
                <small>Resolution rate <b>{resRate}%</b></small>
              </article>
              <article>
                <span>Public works at risk</span>
                <strong>{loading ? "—" : stuckWorks.length}</strong>
                <small><b>{stats?.worksInProgress ?? 0} in progress</b> · {stats?.totalWorks ?? 0} total</small>
              </article>
              <article>
                <span>Grievances in system</span>
                <strong>{loading ? "—" : stats?.totalGrievances ?? 0}</strong>
                <small><b>{stats?.worksCompleted ?? 0} works</b> completed</small>
              </article>
            </section>`,
  `            <section className="minister-stats" aria-label="Executive summary">
              <Link href="/minister/grievances" style={{ textDecoration: "none", color: "inherit" }}>
                <article style={{ cursor: "pointer" }}>
                  <span>Petitions awaiting action</span>
                  <strong>{loading ? "—" : stats?.pendingPetitions ?? 0}</strong>
                  <small><b>{overdue.length} overdue</b> · need immediate attention</small>
                </article>
              </Link>
              <Link href="/minister/grievances" style={{ textDecoration: "none", color: "inherit" }}>
                <article style={{ cursor: "pointer" }}>
                  <span>Total petitions received</span>
                  <strong>{loading ? "—" : stats?.totalPetitions ?? 0}</strong>
                  <small>Resolution rate <b>{resRate}%</b></small>
                </article>
              </Link>
              <Link href="/minister/works" style={{ textDecoration: "none", color: "inherit" }}>
                <article style={{ cursor: "pointer" }}>
                  <span>Public works at risk</span>
                  <strong>{loading ? "—" : stuckWorks.length}</strong>
                  <small><b>{stats?.worksInProgress ?? 0} in progress</b> · {stats?.totalWorks ?? 0} total</small>
                </article>
              </Link>
              <Link href="/minister/grievances" style={{ textDecoration: "none", color: "inherit" }}>
                <article style={{ cursor: "pointer" }}>
                  <span>Grievances in system</span>
                  <strong>{loading ? "—" : stats?.totalGrievances ?? 0}</strong>
                  <small><b>{stats?.worksCompleted ?? 0} works</b> completed</small>
                </article>
              </Link>
            </section>`
)

// 7. Make KPI metric cards clickable
content = content.replace(
  `              { label: "Total Petitions",  value: stats?.totalPetitions,   change: \`\${stats?.pendingPetitions ?? 0} pending\`,  tone: "blue",  Icon: FileText },
              { label: "Overdue",          value: stats?.overduePetitions, change: "Need immediate action",                    tone: "red",   Icon: AlertTriangle },
              { label: "Resolution Rate",  value: \`\${resRate}%\`,           change: \`\${stats?.resolvedPetitions ?? 0} resolved\`, tone: "green", Icon: CheckCircle2 },
              { label: "Public Works",     value: stats?.totalWorks,       change: \`\${stuckWorks.length} stuck / delayed\`,     tone: "amber", Icon: Building2 },
            ].map(({ label, value, change, tone, Icon: Ic }) => (
              <article key={label} className="portal-metric">
                <div className={\`metric-icon icon-\${tone}\`}><Ic size={18} /></div>
                <div>
                  <span>{label}</span>
                  <strong>{loading ? "—" : (value ?? "0")}</strong>
                  <small>{change}</small>
                </div>
              </article>
            ))}`,
  `              { label: "Total Petitions",  value: stats?.totalPetitions,   change: \`\${stats?.pendingPetitions ?? 0} pending\`,  tone: "blue",  Icon: FileText,      href: "/minister/grievances" },
              { label: "Overdue",          value: stats?.overduePetitions, change: "Need immediate action",                    tone: "red",   Icon: AlertTriangle, href: "/minister/grievances" },
              { label: "Resolution Rate",  value: \`\${resRate}%\`,           change: \`\${stats?.resolvedPetitions ?? 0} resolved\`, tone: "green", Icon: CheckCircle2,  href: "/minister/reports" },
              { label: "Public Works",     value: stats?.totalWorks,       change: \`\${stuckWorks.length} stuck / delayed\`,     tone: "amber", Icon: Building2,     href: "/minister/works" },
            ].map(({ label, value, change, tone, Icon: Ic, href }) => (
              <Link key={label} href={href} style={{ textDecoration: "none" }}>
                <article className="portal-metric" style={{ cursor: "pointer" }}>
                  <div className={\`metric-icon icon-\${tone}\`}><Ic size={18} /></div>
                  <div>
                    <span>{label}</span>
                    <strong>{loading ? "—" : (value ?? "0")}</strong>
                    <small>{change}</small>
                  </div>
                </article>
              </Link>
            ))}`
)

fs.writeFileSync('app/minister/dashboard/page.tsx', content)
console.log('✅ Minister dashboard fixed')

// Verify
const lines = content.split('\n')
const sessionLine = lines.findIndex(l => l.includes('useSession'))
const nameLine = lines.findIndex(l => l.includes('ministerName'))
const clickLine = lines.findIndex(l => l.includes('Petitions awaiting') && l.includes('Link'))
console.log('useSession at line:', sessionLine + 1)
console.log('ministerName at line:', nameLine + 1)
console.log('Clickable stat card at line:', clickLine + 1)
