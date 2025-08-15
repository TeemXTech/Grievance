// /lib/schema.js
const SCHEMA_HINT = `
Tables:
public.projects(id, name, department, district, status, budget, start_date, end_date)
public.grievances(id, citizen_name, category, district, status, created_at)
public.events(id, title, type, date, assigned_to)
public.officers(id, name, role, email, phone, district)
`;

function isSqlSafe(sql) {
  const s = (sql || '').toLowerCase();
  if (!s.includes('select')) return false;
  if (s.includes('insert') || s.includes('update') || s.includes('delete') || s.includes('drop') || s.includes('alter') || s.includes('truncate')) return false;
  if (s.split(';').length > 1) return false;
  const allowed = ['public.projects','public.grievances','public.events','public.officers','projects','grievances','events','officers'];
  return allowed.some(t => s.includes(t));
}

module.exports = { SCHEMA_HINT, isSqlSafe };