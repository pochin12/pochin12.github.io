// src/pages/api/solicitudes.ts
import type { APIRoute } from 'astro';
import { turso } from '../../turso';

export const POST: APIRoute = async ({ request, redirect }) => {
    try {

        //const body = await request.json(); si trabajo con json de ambos lados
        //const idMascotaStr = body.id_mascota?.toString() y demas variables a declarar
        const formData = await request.formData();
        const idMascotaStr = formData.get('id_mascota')?.toString();
        const idUsuarioStr = formData.get('id_usuario')?.toString();
        

        if (!idMascotaStr || !idUsuarioStr) {
            return new Response(JSON.stringify({ error: 'IDs de mascota o usuario faltantes.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const idMascota = parseInt(idMascotaStr);
        const idUsuario = parseInt(idUsuarioStr);

        const now = new Date();
        // Formatea a 'YYYY-MM-DD HH:MM:SS' para SQLite
        // `toISOString()` devuelve "YYYY-MM-DDTHH:mm:ss.sssZ"
        // Lo dividimos para obtener la parte de fecha y hora, y removemos la 'T' y la 'Z' y milisegundos
        const fechaSolicitud = now.toISOString().slice(0, 19).replace('T', ' ');

        if (isNaN(idMascota) || isNaN(idUsuario)) {
            return new Response(JSON.stringify({ error: 'IDs de mascota o usuario inválidos.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // --- Lógica para INSERTAR en tu tabla 'adopciones' ---
        // Asumiendo que tienes una tabla 'adopciones' con columnas id_mascota, id_usuario, fecha_solicitud
        await turso.execute({
            sql: "INSERT INTO adopciones (id_usuario, id_mascota, fecha_solicitud) VALUES (?, ?, ?)",
            args: [idUsuario, idMascota, fechaSolicitud]
        });

        // Redirige a la página de confirmación o a la lista de mascotas
        return redirect(`/mascotas/${idMascota}?solicitud=success`); // Ejemplo de redirección con mensaje

    } catch (error) {
        console.error('Error al registrar la solicitud de adopción:', error);
        return new Response(JSON.stringify({ error: 'Fallo al registrar la solicitud de adopción.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};