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
    await sql`
      CREATE TABLE IF NOT EXISTS inscriptions (
        id SERIAL PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        nombre TEXT, distrito TEXT, zona TEXT,
        director_nombre TEXT,
        members JSONB DEFAULT '[]',
        total NUMERIC DEFAULT 0,
        status TEXT DEFAULT 'pendiente',
        fecha TEXT, fecha_ts BIGINT,
        comprobantes JSONB DEFAULT '[]'
      )
    `;
    const rows = await sql`SELECT * FROM inscriptions ORDER BY fecha_ts DESC NULLS LAST`;
    const data = rows.map(r => ({
      _id: r.id, code: r.code, nombre: r.nombre, distrito: r.distrito,
      zona: r.zona, directorNombre: r.director_nombre,
      members: r.members || [], total: parseFloat(r.total) || 0,
      status: r.status, fecha: r.fecha, comprobantes: r.comprobantes || [],
    }));
    return { statusCode: 200, headers, body: JSON.stringify(data) };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};
