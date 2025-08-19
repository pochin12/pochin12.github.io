import type { APIRoute } from "astro";
import { turso } from "../../../turso";

export const POST: APIRoute = async ({ request }) => {
    try {
        const { ids } = await request.json();

        if (!Array.isArray(ids) || ids.length === 0) {
            return new Response(JSON.stringify({error: 'no se enviaron ids validos'}))
        }
        const placeholders = ids.map(() => '?').join(', ');
        

        const result = await turso.execute({
            sql: `update solicitudes set estado = 'rechazado' where id in (${placeholders})`,
            args: ids,
        });

        return new Response(JSON.stringify({
            message: `se actualizaron ${result.rowsAffected} solicitudes a rechazado.`
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (err) {
        console.error('Error rechazando múltiples:', err);
        return new Response(JSON.stringify({ error: 'Error interno del servidor.' }), { status: 500 });
    }
}