import type { APIRoute } from "astro";
import { turso } from "../../../turso";
import { getSession } from "auth-astro/server";


export const POST: APIRoute = async ({ request, redirect }) => {
    try {
        const session = await getSession(request);
        if (!session || !session.user || !session.user.email) {
            return new Response(JSON.stringify({ error: 'No autorizado o sesión expirada.' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const correo = session.user.email;

        const result = await turso.execute({
            sql: "select id from usuarios where correo = ?",
            args: [correo],
        });

        if (result.rows.length === 0) {
            return new Response(JSON.stringify({error:"usuario no econtrado en la base de datos. Debe tener un usario para publicar una mascota en adopción."}), {
                status: 404,
                headers: { 'Content-type': 'application/json' },
            });
        }
        //con esto puedo controlar que si no tiene usuario no pueda agregar para publicar

        const usuario_id = result.rows[0].id;
        
        //const body = await request.json();



        const formData = await request.formData();
        const nombre = formData.get('nombre');
        const tipo = formData.get('tipo');
        const color = formData.get('color');
        const tamano = formData.get('tamano');
        const edad = formData.get('edad');
        const sexo = formData.get('sexo');
        const descripcion = formData.get('descripcion');
        //const id_usuario = formData.get('id_usuario');
        const imagen = formData.get('imagen');
        const castrado = formData.get('castrado');
        const formulario = formData.get('castrado');

        await turso.execute({
            sql: "insert into mascotas (nombre, tipo, color, tamano, edad, sexo, descripcion, id_u, imagen, castrado) VALUES (?,?,?,?,?,?,?,?,?,?)",
            args: [nombre, tipo, color, tamano, edad, sexo, descripcion, usuario_id, imagen, castrado],
        });

        return redirect('/perfil');
    } catch (error) {
        // Este catch capturará el error si turso.execute falla
        console.error('Error al cargar la mascota:', error);
        return new Response(JSON.stringify({ error: 'Fallo al registrar.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
 
}