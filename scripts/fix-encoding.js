const fs = require('fs')

let content = fs.readFileSync('app/minister/dashboard/page.tsx', 'utf8')

// Fix the encoding corruption from previous script
// "?" -> "—" (em dash)  and "Aú" -> "·" (middle dot)
content = content.replace(/"\?""(\s*:)/g, '"—"$1')
content = content.replace(/Aú/g, '·')

// Also fix any remaining "?" that should be "—"
content = content.replace(/"loading \? "\?""/g, 'loading ? "—"')

fs.writeFileSync('app/minister/dashboard/page.tsx', content)
console.log('✅ Encoding fixed')

// Verify
const check = content.includes('"—"') && !content.includes('"?"')
console.log('Em dash present:', content.includes('"—"'))
console.log('Middle dot present:', content.includes('·'))
console.log('Corruption gone:', !content.includes('Aú'))
