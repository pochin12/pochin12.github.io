import type { APIRoute } from "astro";
import { turso } from "../../../turso";

export const POST: APIRoute = async ({ request, redirect }) => {
    try {
        // const formData = await request.formData();
        // const solicitudId = formData.get('solicitudId');
        // const nuevoEstado = formData.get('nuevoEstado');
        //es mejor con objeto json en este caso no como en mascota[ID]
        const body = await request.json();
        const { solicitudId, nuevoEstado } = body;
        

        const result = await turso.execute({
            sql: 'UPDATE solicitudes SET estado = ? where id = ?',
            args: [nuevoEstado, solicitudId],
        });

        if (result.rowsAffected === 0) {
            return new Response(JSON.stringify({ error: 'No se encontró la solicitud para actualizar.' }), { status: 404 });
        }
        return new Response(JSON.stringify({ message: `Solicitud ${solicitudId} actualizada a ${nuevoEstado} con éxito.` }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error en API update-estado:', error);
        return new Response(JSON.stringify({ error: 'Error interno del servidor.' }), { status: 500 });
    }
    
};