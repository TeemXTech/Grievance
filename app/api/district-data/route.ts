import { NextRequest, NextResponse } from 'next/server'

const districtData = {
  "Karimnagar": { projects: 12, grievances: 8, completed: 5, pending: 15 },
  "Peddapalli": { projects: 8, grievances: 15, completed: 3, pending: 20 },
  "Warangal": { projects: 15, grievances: 12, completed: 8, pending: 19 },
  "Hyderabad": { projects: 25, grievances: 30, completed: 20, pending: 35 },
  "Nalgonda": { projects: 10, grievances: 18, completed: 6, pending: 22 },
  "Rangareddy": { projects: 18, grievances: 14, completed: 10, pending: 22 },
  "Mahbubnagar": { projects: 9, grievances: 11, completed: 4, pending: 16 },
  "Nizamabad": { projects: 7, grievances: 9, completed: 3, pending: 13 },
  "Adilabad": { projects: 6, grievances: 7, completed: 2, pending: 11 },
  "Medak": { projects: 8, grievances: 6, completed: 4, pending: 10 }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const districtName = searchParams.get('name')
  
  if (!districtName) {
    return NextResponse.json({ error: 'District name required' }, { status: 400 })
  }
  
  const data = districtData[districtName] || {
    projects: Math.floor(Math.random() * 20),
    grievances: Math.floor(Math.random() * 25),
    completed: Math.floor(Math.random() * 10),
    pending: Math.floor(Math.random() * 30)
  }
  
  return NextResponse.json(data)
}