import { neon } from "@neondatabase/serverless";

export default async (req, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") {
    return new Response("", { status: 200, headers });
  }

  if (!process.env.DATABASE_URL) {
    return new Response(JSON.stringify({ error: "DATABASE_URL no configurada" }), { status: 500, headers });
  }

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
        fecha TEXT,
        fecha_ts BIGINT,
        comprobantes JSONB DEFAULT '[]'
      )
    `;

    const rows = await sql`SELECT * FROM inscriptions ORDER BY fecha_ts DESC NULLS LAST`;
    const data = rows.map(r => ({
      _id: r.id,
      code: r.code,
      nombre: r.nombre,
      distrito: r.distrito,
      zona: r.zona,
      directorNombre: r.director_nombre,
      members: r.members || [],
      total: parseFloat(r.total) || 0,
      status: r.status,
      fecha: r.fecha,
      comprobantes: r.comprobantes || [],
    }));

    return new Response(JSON.stringify(data), { status: 200, headers });
  } catch (e) {
    console.error("DB Error:", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
};

export const config = { path: "/.netlify/functions/get-inscriptions" };
