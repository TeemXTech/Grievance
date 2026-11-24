const fs = require('fs')
let content = fs.readFileSync('app/pa/dashboard/page.tsx', 'utf8')

// Fix the broken import line
content = content.replace(
  /from "react"`r`nimport \{ VoiceIntakeButton \}/,
  'from "react"\nimport { VoiceIntakeButton }'
)
content = content.replace(
  /from "react"\\r\\nimport \{ VoiceIntakeButton \}/,
  'from "react"\nimport { VoiceIntakeButton }'
)
// Also fix any literal backtick-r-backtick-n sequences
content = content.replace(/`r`n/g, '\r\n')
content = content.replace(/`n/g, '\n')

fs.writeFileSync('app/pa/dashboard/page.tsx', content)
console.log('Fixed')

// Verify
const lines = content.split('\n').slice(3, 8)
lines.forEach((l, i) => console.log(i+4, ':', l.substring(0, 80)))
