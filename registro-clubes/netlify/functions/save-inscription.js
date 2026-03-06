import { neon } from "@neondatabase/serverless";

export default async (req, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") return new Response("", { status: 200, headers });

  try {
    const sql = neon(process.env.DATABASE_URL);
    const d = await req.json();

    const rows = await sql`
      INSERT INTO inscriptions (code, nombre, distrito, zona, director_nombre, members, total, status, fecha, fecha_ts, comprobantes)
      VALUES (${d.code}, ${d.nombre}, ${d.distrito}, ${d.zona}, ${d.directorNombre},
              ${JSON.stringify(d.members)}, ${d.total}, ${d.status}, ${d.fecha},
              ${d.fechaTs || Date.now()}, ${JSON.stringify(d.comprobantes || [])})
      RETURNING id
    `;
    return new Response(JSON.stringify({ id: rows[0].id }), { status: 200, headers });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
};

export const config = { path: "/.netlify/functions/save-inscription" };
