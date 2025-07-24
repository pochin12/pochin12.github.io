import type { APIRoute } from "astro";
import { turso } from "../../turso";

export const POST: APIRoute = async ({ request, redirect }) => {
    try {
        const formData = await request.formData();
        const nombre = formData.get('nombre');
        const color = formData.get('color');
        const tamano = formData.get('tamano');
        const edad = formData.get('edad');
        const sexo = formData.get('sexo');
        const descripcion = formData.get('descripcion');
        const id_usuario = formData.get('id_usuario');

        await turso.execute({
            sql: "insert into mascotas (nombre, color, tamano, edad, sexo, descripcion, id_u) VALUES (?,?,?,?,?,?,?)",
            args: [nombre, color, tamano, edad, sexo, descripcion, id_usuario]
        });

        return redirect('/mascotas/mascota');
    } catch (error) {
        // Este catch capturará el error si turso.execute falla
        console.error('Error al cargar la mascota:', error);
        return new Response(JSON.stringify({ error: 'Fallo al registrar.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
 
}