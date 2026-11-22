export type Lang = 'en' | 'te'

export const T: Record<string, Record<Lang, string>> = {
  // Navigation
  morningBriefing:     { en: 'Morning Briefing',        te: 'ఉదయం బ్రీఫింగ్' },
  paCommandCenter:     { en: 'PA Command Center',       te: 'PA కమాండ్ సెంటర్' },
  fieldDashboard:      { en: 'Field Dashboard',         te: 'ఫీల్డ్ డాష్‌బోర్డ్' },
  signOut:             { en: 'Sign Out',                te: 'సైన్ అవుట్' },

  // Petition statuses
  SUBMITTED_TO_PA:     { en: 'In PA Office',            te: 'PA కార్యాలయంలో' },
  ASSIGNED_TO_OFFICIAL:{ en: 'Assigned',                te: 'అప్పగించబడింది' },
  UNDER_REVIEW:        { en: 'Under Review',            te: 'సమీక్షలో ఉంది' },
  SANCTIONED:          { en: 'Sanctioned',              te: 'మంజూరు చేయబడింది' },
  RESOLVED:            { en: 'Resolved',                te: 'పరిష్కరించబడింది' },
  REJECTED:            { en: 'Rejected',                te: 'తిరస్కరించబడింది' },
  PENDING:             { en: 'Pending',                 te: 'పెండింగ్' },

  // Petition types
  CMRF_MEDICAL:        { en: 'CMRF Medical',            te: 'CMRF వైద్య సహాయం' },
  EMPLOYEE_TRANSFER:   { en: 'Transfer',                te: 'బదిలీ' },
  JOB_EMPLOYMENT:      { en: 'Job',                     te: 'ఉద్యోగం' },
  PERSONAL_GRIEVANCE:  { en: 'Grievance',               te: 'ఫిర్యాదు' },

  // Priority
  URGENT:              { en: 'Urgent',                  te: 'అత్యవసరం' },
  HIGH:                { en: 'High',                    te: 'అధిక' },
  MEDIUM:              { en: 'Medium',                  te: 'మధ్యస్థం' },
  LOW:                 { en: 'Low',                     te: 'తక్కువ' },

  // Common labels
  name:                { en: 'Name',                    te: 'పేరు' },
  phone:               { en: 'Phone',                   te: 'ఫోన్' },
  village:             { en: 'Village',                 te: 'గ్రామం' },
  mandal:              { en: 'Mandal',                  te: 'మండలం' },
  status:              { en: 'Status',                  te: 'స్థితి' },
  type:                { en: 'Type',                    te: 'రకం' },
  priority:            { en: 'Priority',                te: 'ప్రాధాన్యత' },
  department:          { en: 'Department',              te: 'విభాగం' },
  tracking:            { en: 'Tracking No.',            te: 'ట్రాకింగ్ నం.' },
  overdue:             { en: 'Overdue',                 te: 'గడువు మించింది' },
  total:               { en: 'Total',                   te: 'మొత్తం' },
  sanctioned:          { en: 'Sanctioned',              te: 'మంజూరు' },
  search:              { en: 'Search...',               te: 'వెతకండి...' },
  submit:              { en: 'Submit',                  te: 'సమర్పించు' },
  cancel:              { en: 'Cancel',                  te: 'రద్దు చేయి' },
  save:                { en: 'Save',                    te: 'సేవ్ చేయి' },
  loading:             { en: 'Loading...',              te: 'లోడ్ అవుతోంది...' },
  noData:              { en: 'No data found',           te: 'డేటా కనుగొనబడలేదు' },
  refresh:             { en: 'Refresh',                 te: 'రిఫ్రెష్' },

  // Morning briefing
  goodMorning:         { en: 'Good Morning',            te: 'శుభోదయం' },
  todaySchedule:       { en: "Today's Schedule",        te: 'నేటి షెడ్యూల్' },
  overdueAlerts:       { en: 'Overdue Alerts',          te: 'గడువు మించిన హెచ్చరికలు' },
  newPetitions:        { en: 'New Petitions',           te: 'కొత్త దరఖాస్తులు' },
  pendingApproval:     { en: 'Pending Approval',        te: 'ఆమోదం పెండింగ్' },
  listenBriefing:      { en: 'Listen to Briefing',      te: 'బ్రీఫింగ్ వినండి' },
  stopListening:       { en: 'Stop',                    te: 'ఆపు' },

  // Voice intake
  voiceIntake:         { en: 'Voice Intake',            te: 'వాయిస్ ఇన్‌టేక్' },
  speakNow:            { en: 'Speak now...',            te: 'ఇప్పుడు మాట్లాడండి...' },
  listening:           { en: 'Listening...',            te: 'వింటున్నాను...' },
  extracted:           { en: 'Extracted Details',       te: 'వివరాలు సేకరించబడ్డాయి' },

  // Analytics
  analytics:           { en: 'Analytics',               te: 'విశ్లేషణలు' },
  petitionsByType:     { en: 'Petitions by Type',       te: 'రకం వారీగా దరఖాస్తులు' },
  petitionsByStatus:   { en: 'Petitions by Status',     te: 'స్థితి వారీగా దరఖాస్తులు' },
  resolutionTime:      { en: 'Avg Resolution Days',     te: 'సగటు పరిష్కార రోజులు' },
  weeklyTrend:         { en: 'Weekly Trend',            te: 'వారపు ట్రెండ్' },

  // Field officer
  myTasks:             { en: 'My Tasks',                te: 'నా పనులు' },
  updateStatus:        { en: 'Update Status',           te: 'స్థితి నవీకరించు' },
  fieldRemarks:        { en: 'Field Remarks',           te: 'ఫీల్డ్ వ్యాఖ్యలు' },
  assignedTo:          { en: 'Assigned To',             te: 'అప్పగించబడింది' },

  // QR tracking
  trackPetition:       { en: 'Track Your Petition',     te: 'మీ దరఖాస్తు ట్రాక్ చేయండి' },
  scanQR:              { en: 'Scan QR Code',            te: 'QR కోడ్ స్కాన్ చేయండి' },
  currentStatus:       { en: 'Current Status',          te: 'ప్రస్తుత స్థితి' },
}

export function t(key: string, lang: Lang = 'en'): string {
  return T[key]?.[lang] ?? T[key]?.['en'] ?? key
}

// Telugu speech text for morning briefing
export function buildTeluguBriefing(data: {
  ministerName: string
  todayEvents: Array<{ title: string; location: string; time: string }>
  overdueCount: number
  overdueItems: Array<{ name: string; type: string; days: number }>
  newPetitions: number
  pendingApproval: number
  stuckWorks: number
}): { en: string; te: string } {
  const { ministerName, todayEvents, overdueCount, overdueItems, newPetitions, pendingApproval, stuckWorks } = data

  const en = [
    `Good morning, ${ministerName}.`,
    todayEvents.length > 0
      ? `Today you have ${todayEvents.length} scheduled event${todayEvents.length > 1 ? 's' : ''}: ${todayEvents.map(e => `${e.title} at ${e.location}`).join(', ')}.`
      : 'You have no scheduled events today.',
    overdueCount > 0
      ? `URGENT: ${overdueCount} petition${overdueCount > 1 ? 's are' : ' is'} overdue. ${overdueItems.slice(0, 2).map(i => `${i.name}'s ${i.type} case is ${i.days} days old`).join('. ')}.`
      : 'No overdue petitions today.',
    newPetitions > 0 ? `${newPetitions} new petition${newPetitions > 1 ? 's' : ''} came in since yesterday.` : '',
    pendingApproval > 0 ? `${pendingApproval} petition${pendingApproval > 1 ? 's are' : ' is'} waiting for your approval.` : '',
    stuckWorks > 0 ? `${stuckWorks} public work${stuckWorks > 1 ? 's are' : ' is'} stuck or delayed in your constituency.` : '',
  ].filter(Boolean).join(' ')

  const te = [
    `శుభోదయం, ${ministerName} గారు.`,
    todayEvents.length > 0
      ? `నేడు మీకు ${todayEvents.length} కార్యక్రమాలు ఉన్నాయి: ${todayEvents.map(e => `${e.location}లో ${e.title}`).join(', ')}.`
      : 'నేడు మీకు షెడ్యూల్ చేసిన కార్యక్రమాలు లేవు.',
    overdueCount > 0
      ? `అత్యవసరం: ${overdueCount} దరఖాస్తులు గడువు మించాయి. ${overdueItems.slice(0, 2).map(i => `${i.name} యొక్క ${i.type} కేసు ${i.days} రోజులు పాతది`).join('. ')}.`
      : 'నేడు గడువు మించిన దరఖాస్తులు లేవు.',
    newPetitions > 0 ? `నిన్న నుండి ${newPetitions} కొత్త దరఖాస్తులు వచ్చాయి.` : '',
    pendingApproval > 0 ? `${pendingApproval} దరఖాస్తులు మీ ఆమోదం కోసం వేచి ఉన్నాయి.` : '',
    stuckWorks > 0 ? `మీ నియోజకవర్గంలో ${stuckWorks} పనులు ఆగిపోయాయి.` : '',
  ].filter(Boolean).join(' ')

  return { en, te }
}
