import { Ollama } from 'ollama';

const client = new Ollama({ host: 'http://127.0.0.1:11434' });

export async function generateText(prompt: string, model = 'llama3.1:8b') {
  const res = await client.chat({
    model,
    messages: [{ role: 'user', content: prompt }],
    options: { temperature: 0.2 },
  });
  return res.message?.content ?? '';
}

export async function generateSQL(nlQuestion: string, schemaHint: string) {
  const system = `You are SQLCoder. Produce ONE SINGLE valid ANSI SQL SELECT statement only.
- No INSERT/UPDATE/DELETE/DDL.
- No semicolons; no comments.
- Only reference tables/columns that exist in the schema below.
- Use explicit table names with schema if provided.
- If ambiguous, choose the most likely straightforward query.
Schema:
${schemaHint}`;

  const res = await client.chat({
    model: 'sqlcoder:7b',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: nlQuestion }
    ],
    options: { temperature: 0.0 },
  });

  const raw = res.message?.content || '';
  const sql = raw
    .replace(/```sql/gi, '')
    .replace(/```/g, '')
    .trim();
  return sql;
}