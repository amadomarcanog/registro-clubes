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
    const { id, ...fields } = await req.json();

    if (fields.status !== undefined) {
      await sql`UPDATE inscriptions SET status = ${fields.status} WHERE id = ${id}`;
    } else {
      await sql`
        UPDATE inscriptions SET
          nombre          = ${fields.nombre},
          distrito        = ${fields.distrito},
          zona            = ${fields.zona},
          director_nombre = ${fields.directorNombre},
          members         = ${JSON.stringify(fields.members)},
          total           = ${fields.total}
        WHERE id = ${id}
      `;
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
};

export const config = { path: "/.netlify/functions/update-inscription" };
