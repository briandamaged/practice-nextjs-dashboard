
const { Client } = require('pg');


class VercelPostgresError extends Error {
  constructor(code, message) {
    super(`VercelPostgresError - '${code}': ${message}`);
    this.name = 'VercelPostgresError';
  }
}


function sqlTemplate(strings, ...values) {
  if (!isTemplateStringsArray(strings) || !Array.isArray(values)) {
    throw new VercelPostgresError(
      'incorrect_tagged_template_call',
      "It looks like you tried to call `sql` as a function. Make sure to use it as a tagged template.\n\tExample: sql`SELECT * FROM users`, not sql('SELECT * FROM users')",
    );
  }

  let result = strings[0] ?? '';

  for (let i = 1; i < strings.length; i++) {
    result += `$${i}${strings[i] ?? ''}`;
  }

  return [result, values];
}

function isTemplateStringsArray(strings) {
  return (
    Array.isArray(strings) && 'raw' in strings && Array.isArray(strings.raw)
  );
}
  
class FakeVercelClient {
  constructor({client}) {
    this.client = client;
  }

  async sql(strings, ...values) {
    const [query, params] = sqlTemplate(strings, ...values);
    return this.client.query(query, params);
  }
}


async function withFakeClient(f) {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
  });
  await client.connect();

  try {
    const c = new FakeVercelClient({client});
    return await f(c);
  } finally {
    await client.end();
  }
}


module.exports = {
  FakeVercelClient,
  sqlTemplate,
  VercelPostgresError,
  withFakeClient: withFakeClient,
}

