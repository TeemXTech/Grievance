// /lib/ollama.js
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';

async function chat(messages, model = 'llama3.1:8b', temperature = 0.2) {
  const res = await fetch(`${OLLAMA_HOST}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, options: { temperature } })
  });
  if (!res.ok) throw new Error(`Ollama chat error ${res.status}`);
  const data = await res.json();
  return data?.message?.content || '';
}

async function genSQL(nlQuestion, schemaHint) {
  const system = `You are SQLCoder. Output ONE valid ANSI SELECT statement only.
No INSERT/UPDATE/DELETE/DDL. No semicolons. Use only columns/tables from schema:
${schemaHint}`;
  const txt = await chat(
    [{ role: 'system', content: system }, { role: 'user', content: nlQuestion }],
    'sqlcoder:7b',
    0.0
  );
  return txt.replace(/```sql|```/g, '').trim();
}

module.exports = { chat, genSQL };