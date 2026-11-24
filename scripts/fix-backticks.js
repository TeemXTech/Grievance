const fs = require('fs')

const files = [
  'app/pa/dashboard/page.tsx',
  'app/minister/dashboard/page.tsx',
  'app/back-officer/dashboard/page.tsx',
  'app/field-officer/dashboard/page.tsx',
]

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8')
  const before = content.length

  // Fix literal backtick sequences from PowerShell
  content = content.replace(/`r`n/g, '\r\n')
  content = content.replace(/`n/g, '\n')
  content = content.replace(/`t/g, '\t')

  fs.writeFileSync(file, content)
  console.log(file, '- fixed', before !== content.length ? 'YES' : 'no change')
}
