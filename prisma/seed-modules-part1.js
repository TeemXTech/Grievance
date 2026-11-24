// prisma/seed-modules.js
// Seeds the 14 empty module tables.
// Run AFTER seed-demo.js has created users.
// Safe to re-run — uses upsert/findFirst guards throughout.

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function seedPartyPosts() {
  const posts = [
    { title: 'State President',        wing: 'Main Party',   level: 'STATE',    description: 'State-level party president' },
    { title: 'District President',     wing: 'Main Party',   level: 'DISTRICT', description: 'District-level party president' },
    { title: 'Assembly In-charge',     wing: 'Main Party',   level: 'ASSEMBLY', description: 'Assembly segment in-charge' },
    { title: 'Mandal President',       wing: 'Main Party',   level: 'MANDAL',   description: 'Mandal-level party president' },
    { title: 'Village President',      wing: 'Main Party',   level: 'VILLAGE',  description: 'Village-level party president' },
    { title: 'Booth Committee Chair',  wing: 'Main Party',   level: 'BOOTH',    description: 'Polling booth committee chairperson' },
    { title: 'Youth Wing President',   wing: 'Youth Wing',   level: 'MANDAL',   description: 'Youth wing mandal president' },
    { title: 'Youth Wing Secretary',   wing: 'Youth Wing',   level: 'VILLAGE',  description: 'Youth wing village secretary' },
    { title: 'Women Wing President',   wing: 'Women Wing',   level: 'MANDAL',   description: 'Women wing mandal president' },
    { title: 'Women Wing Secretary',   wing: 'Women Wing',   level: 'VILLAGE',  description: 'Women wing village secretary' },
    { title: 'Farmers Wing President', wing: 'Farmers Wing', level: 'MANDAL',   description: 'Farmers wing mandal president' },
    { title: 'SC Cell Convener',       wing: 'SC Cell',      level: 'MANDAL',   description: 'SC cell mandal convener' },
  ]
  let count = 0
  for (const p of posts) {
    const exists = await prisma.partyPost.findFirst({
      where: { title: p.title, level: p.level, wing: p.wing }
    })
    if (!exists) {
      await prisma.partyPost.create({ data: p })
      count++
    }
  }
  console.log(`  PartyPost: ${count} created (${posts.length - count} already existed)`)
  return await prisma.partyPost.findMany()
}

async function seedOffices() {
  const offices = [
    {
      name: 'Hyderabad Secretariat Office',
      officeType: 'SECRETARIAT',
      address: 'Block B, Telangana Secretariat, Hyderabad',
      city: 'Hyderabad',
      phone: '04023456789',
      email: 'secretariat@gov.in',
      inChargeName: 'Joint Secretary',
      isDefault: true,
      isActive: true,
    },
    {
      name: 'Peddapalli Constituency Camp Office',
      officeType: 'CONSTITUENCY',
      address: 'Main Road, Peddapalli, Telangana 505172',
      city: 'Peddapalli',
      phone: '08728234567',
      email: 'peddapalli.camp@gov.in',
      inChargeName: 'Camp Office Manager',
      isDefault: false,
      isActive: true,
    },
    {
      name: "Minister's Residence Office",
      officeType: 'RESIDENCE',
      address: 'Road No. 12, Banjara Hills, Hyderabad',
      city: 'Hyderabad',
      phone: '04023456790',
      email: 'residence.office@gov.in',
      inChargeName: 'Residence PA',
      isDefault: false,
      isActive: true,
    },
    {
      name: 'Karimnagar District Office',
      officeType: 'DISTRICT',
      address: 'Collectorate Complex, Karimnagar',
      city: 'Karimnagar',
      phone: '08782234567',
      email: 'karimnagar.office@gov.in',
      inChargeName: 'District Coordinator',
      isDefault: false,
      isActive: true,
    },
  ]
  let count = 0
  for (const o of offices) {
    const exists = await prisma.office.findFirst({ where: { name: o.name } })
    if (!exists) {
      await prisma.office.create({ data: o })
      count++
    }
  }
  console.log(`  Office: ${count} created (${offices.length - count} already existed)`)
}

async function seedMandalsAndVillages() {
  const mandalData = [
    { name: 'Manthani',   district: 'Peddapalli', villages: ['Manthani Town', 'Bittupalli', 'Raghavapuram', 'Kondapur'] },
    { name: 'Peddapalli', district: 'Peddapalli', villages: ['Peddapalli Town', 'Sultanabad', 'Dharmaram'] },
    { name: 'Karimnagar', district: 'Karimnagar', villages: ['Karimnagar Town', 'Jammikunta', 'Huzurabad'] },
    { name: 'Jagtial',    district: 'Jagtial',    villages: ['Jagtial Town', 'Korutla', 'Metpalli'] },
    { name: 'Nizamabad',  district: 'Nizamabad',  villages: ['Nizamabad Town', 'Bodhan', 'Armoor'] },
    { name: 'Warangal',   district: 'Warangal',   villages: ['Warangal Town', 'Hanamkonda', 'Kazipet'] },
  ]
  let mandalCount = 0
  let villageCount = 0
  for (const m of mandalData) {
    let mandal = await prisma.mandal.findFirst({ where: { name: m.name } })
    if (!mandal) {
      mandal = await prisma.mandal.create({ data: { name: m.name, district: m.district } })
      mandalCount++
    }
    for (const vName of m.villages) {
      const exists = await prisma.village.findFirst({ where: { name: vName, mandalId: mandal.id } })
      if (!exists) {
        await prisma.village.create({ data: { name: vName, mandalId: mandal.id } })
        villageCount++
      }
    }
  }
  console.log(`  Mandal: ${mandalCount} created | Village: ${villageCount} created`)
  return await prisma.mandal.findMany()
}

async function seedLocalLeaders(mandals) {
  const leaders = [
    { name: 'Sri Ramaiah Goud',    phone: '9876543201', designation: 'Sarpanch',     partyRole: 'Village President', mandalName: 'Manthani',   villageName: 'Bittupalli' },
    { name: 'Smt. Lakshmi Devi',   phone: '9876543202', designation: 'MPTC Member',  partyRole: 'Mandal Secretary',  mandalName: 'Manthani',   villageName: 'Raghavapuram' },
    { name: 'Sri Venkat Reddy',    phone: '9876543203', designation: 'Ward Member',   partyRole: 'Booth Committee',   mandalName: 'Peddapalli', villageName: 'Sultanabad' },
    { name: 'Sri Krishnamurthy',   phone: '9876543204', designation: 'ZPTC Member',   partyRole: 'Mandal President',  mandalName: 'Karimnagar', villageName: 'Jammikunta' },
    { name: 'Smt. Padmavathi',     phone: '9876543205', designation: 'Sarpanch',      partyRole: 'Village President', mandalName: 'Jagtial',    villageName: 'Korutla' },
    { name: 'Sri Narasimha Rao',   phone: '9876543206', designation: 'Ex-Sarpanch',   partyRole: 'Senior Leader',     mandalName: 'Nizamabad',  villageName: 'Bodhan' },
    { name: 'Sri Bhaskar Sharma',  phone: '9876543207', designation: 'Ward Councillor',partyRole: 'Town President',    mandalName: 'Warangal',   villageName: 'Hanamkonda' },
    { name: 'Smt. Sarojini Devi',  phone: '9876543208', designation: 'MPTC Member',   partyRole: 'Women Wing Head',   mandalName: 'Manthani',   villageName: 'Kondapur' },
  ]
  let count = 0
  for (const l of leaders) {
    const exists = await prisma.localLeader.findFirst({ where: { phone: l.phone } })
    if (!exists) {
      const mandal = mandals.find(m => m.name === l.mandalName)
      await prisma.localLeader.create({
        data: {
          name:        l.name,
          phone:       l.phone,
          designation: l.designation,
          partyRole:   l.partyRole,
          mandalId:    mandal?.id || null,
          mandalName:  l.mandalName,
          villageName: l.villageName,
          isActive:    true,
        }
      })
      count++
    }
  }
  console.log(`  LocalLeader: ${count} created`)
  return await prisma.localLeader.findMany()
}

module.exports = { seedPartyPosts, seedOffices, seedMandalsAndVillages, seedLocalLeaders }
