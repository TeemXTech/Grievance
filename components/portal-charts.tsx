'use client'

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const colors = ['#497b9b', '#79a6b9', '#79a389', '#d4ad6b', '#a5b1b8']
type TrendPoint = { month: string; petitions: number; resolved: number }
type ChartDatum = { name: string; value: number }
type ChartKind = 'petitions' | 'department' | 'volume' | 'resolution' | 'departments' | 'pending'

export function PortalChart({ kind, data }: { kind: ChartKind; data: TrendPoint[] | ChartDatum[] }) {
  if (kind === 'department' || kind === 'departments') {
    return <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data as ChartDatum[]} dataKey="value" nameKey="name" innerRadius={kind === 'department' ? 48 : 0} outerRadius={kind === 'department' ? 68 : 85} paddingAngle={kind === 'department' ? 3 : 0} label={kind === 'departments'}>{(data as ChartDatum[]).map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer>
  }
  if (kind === 'pending') {
    const pending = [{ name: 'Revenue', pending: 382 }, { name: 'R&B', pending: 294 }, { name: 'Health', pending: 248 }, { name: 'Water Supply', pending: 186 }]
    return <ResponsiveContainer width="100%" height="100%"><BarChart layout="vertical" data={pending}><CartesianGrid horizontal={false} stroke="#edf1f3"/><XAxis type="number" tickLine={false} axisLine={false}/><YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={90}/><Tooltip/><Bar dataKey="pending" fill="#7694a5" radius={[0,4,4,0]}/></BarChart></ResponsiveContainer>
  }
  const points = data as TrendPoint[]
  if (kind === 'petitions') return <ResponsiveContainer width="100%" height="100%"><AreaChart data={points}><defs><linearGradient id="volumeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#5687a5" stopOpacity={.2}/><stop offset="95%" stopColor="#5687a5" stopOpacity={0}/></linearGradient></defs><CartesianGrid vertical={false} stroke="#edf1f3"/><XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#788b98' }}/><YAxis hide/><Tooltip/><Area type="monotone" dataKey="petitions" stroke="#4f829f" strokeWidth={2} fill="url(#volumeFill)"/></AreaChart></ResponsiveContainer>
  if (kind === 'volume') return <ResponsiveContainer width="100%" height="100%"><BarChart data={points}><CartesianGrid vertical={false} stroke="#edf1f3"/><XAxis dataKey="month" tickLine={false} axisLine={false}/><YAxis tickLine={false} axisLine={false}/><Tooltip/><Bar dataKey="petitions" fill="#608ca4" radius={[4,4,0,0]}/><Bar dataKey="resolved" fill="#9dbbab" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer>
  return <ResponsiveContainer width="100%" height="100%"><AreaChart data={points}><CartesianGrid vertical={false} stroke="#edf1f3"/><XAxis dataKey="month" tickLine={false} axisLine={false}/><YAxis domain={[50, 100]} tickLine={false} axisLine={false}/><Tooltip/><Area type="monotone" dataKey="resolved" stroke="#5b9078" fill="#e6f0eb"/></AreaChart></ResponsiveContainer>
}
