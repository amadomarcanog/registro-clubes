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
    const d = JSON.parse(event.body);
    const rows = await sql`
      INSERT INTO inscriptions (code, nombre, distrito, zona, director_nombre, members, total, status, fecha, fecha_ts, comprobantes)
      VALUES (${d.code}, ${d.nombre}, ${d.distrito}, ${d.zona}, ${d.directorNombre},
              ${JSON.stringify(d.members)}, ${d.total}, ${d.status}, ${d.fecha},
              ${d.fechaTs || Date.now()}, ${JSON.stringify(d.comprobantes || [])})
      RETURNING id
    `;
    return { statusCode: 200, headers, body: JSON.stringify({ id: rows[0].id }) };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};
