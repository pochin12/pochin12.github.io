
import type { NumberColumnInput } from "@astrojs/db/types";
import type { APIRoute } from "astro";
import { turso } from "../../../turso";
import { getSession } from "auth-astro/server";

// const session = await getSession(Astro.request);
// if (!session) {
//     return Astro.redirect("/");
// }

export const GET: APIRoute = async ({ request }) => {
    const url = new URL(request.url);
    const userEmail = url.searchParams.get('userEmail');

    if (!userEmail) {
        return new Response(JSON.stringify({ error: 'ID de usuario no proporcionado.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    } try {

        const resultuser = await turso.execute({
            sql: 'select id, correo from usuarios where correo = ?',
            args: [userEmail],
        })

        const userId = resultuser.rows[0]?.id
        if (!userId) {
            return new Response(JSON.stringify({ error: 'Usuario no encontrado en la base de datos.' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const result = await turso.execute({
            sql: 'select id, id_mascota, nombre_responsable, fecha_solicitud, estado, nombre_solicitante from solicitudes where id_responsable = ?',
            args: [userId],

        });
        return new Response(JSON.stringify({ solicitudes: result.rows }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error fetching solicitudes:', error);
        return new Response(JSON.stringify({ error: 'Error al obtener solicitudes.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }


};


