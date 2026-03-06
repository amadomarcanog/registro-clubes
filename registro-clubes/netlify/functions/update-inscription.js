const { neon } = require("@neondatabase/serverless");

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };
  try {
    const sql = neon(process.env.DATABASE_URL);
    const { id, ...fields } = JSON.parse(event.body);
    if (fields.status !== undefined) {
      await sql`UPDATE inscriptions SET status = ${fields.status} WHERE id = ${id}`;
    } else {
      await sql`
        UPDATE inscriptions SET
          nombre = ${fields.nombre}, distrito = ${fields.distrito},
          zona = ${fields.zona}, director_nombre = ${fields.directorNombre},
          members = ${JSON.stringify(fields.members)}, total = ${fields.total}
        WHERE id = ${id}
      `;
    }
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};
