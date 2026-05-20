const SUPABASE_URL = 'https://yybnufouzafwmejegbni.supabase.co'
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5Ym51Zm91emFmd21lamVnYm5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyODQyNDcsImV4cCI6MjA5NDg2MDI0N30.GpkMY1iZ98PpHtx3_Td-rGbMz_ph4QVdpdodJ6S5m9c'

const baseHeaders = {
  'apikey': ANON_KEY,
  'Authorization': `Bearer ${ANON_KEY}`,
  'Content-Type': 'application/json'
}

export async function dbGet(table, params = '') {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, { headers: baseHeaders })
  if (!r.ok) throw new Error(`Erreur BDD (${r.status})`)
  return r.json()
}

export { SUPABASE_URL, ANON_KEY, baseHeaders }
