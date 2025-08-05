import type { APIRoute } from "astro";
import { turso } from "../../../turso";

export const GET: APIRoute = async ({ request }) => {
    const url = new URL(request.url);
    const userEmail = url.searchParams.get('userEmail');
    
    if (!userEmail) {
        return new Response(JSON.stringify({ error: 'ID de usuario no proporcionado.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });

    }
    try {
        const resultuser = await turso.execute({
            sql: 'select id from usuarios where usuarios.correo = ?',
            args: [userEmail]
        });

        const userId = resultuser.rows[0]?.id
        console.log(resultuser)

        if (!userId) {
            return new Response(JSON.stringify({ error: 'Usuario no encontrado en la base de datos.' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        //con el id de usuarios hago consulta en tabla adopciones

        const result = await turso.execute({
            sql: 'select id, id_usuario, id_mascota, fecha_solicitud, estado from adopciones where id_usuario = ?',
            args: [userId]
        });
        console.log(result.rows)
        return new Response(JSON.stringify({ adopciones: result.rows }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error fetching adopciones:', error);
        return new Response(JSON.stringify({ error: 'Error al obtener adopciones.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};