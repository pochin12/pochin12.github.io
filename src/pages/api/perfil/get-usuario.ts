import type { APIRoute } from "astro";
import { turso } from "../../../turso";


export const GET: APIRoute = async ({ request }) => {
    const url = new URL(request.url);
    const email = url.searchParams.get('userEmail');//debe coincidir con el nombre del param que llama al endpoint

    console.log(email)

    if (!email) {
        return new Response(JSON.stringify({ error: 'ID de usuario no proporcionado.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });

    }
    
    try {
        const result = await turso.execute({
            sql: 'select id, nombre, apellido, correo, telefono from usuarios where correo = ?',
            args: [email],
        })
    

        // No es estrictamente necesario, pero si quieres asegurarte de que solo tienes un usuario
        // Y si quieres retornar directamente el objeto de usuario en lugar de un array en 'usuarios'
        const user = result.rows.length > 0 ? result.rows[0] : null;

        if (!user) { // Verifica si el usuario fue encontrado
            return new Response(JSON.stringify({ error: 'Usuario no encontrado en la base de datos.' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });

            
        }
        const users = result.rows
        console.log(users)
        return new Response(JSON.stringify({ usuarios: result.rows }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            
        });
        

 
    } catch (error) {
        console.error('Error fetching usuarios:', error);
        return new Response(JSON.stringify({ error: 'Error al obtener usuarios.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
    
}