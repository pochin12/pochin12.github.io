// src/pages/api/solicitudes.ts
import type { APIRoute } from 'astro';
import { turso } from '../../turso';
// import { getSession } from 'auth-astro/server';
// const session = await getSession(Astro.request);

// if (!session) {
//     return Astro.redirect("/");
// }
// console.log(session.user?.email);

export const POST: APIRoute = async ({ request, redirect }) => {
    try {
        const formData = await request.formData();
        const idMascotaStr = formData.get('id_mascota')?.toString();
        const idResponsableStr = formData.get('id_responsable')?.toString();
        const nombreResponsable = formData.get('nombre_usuario')
        const idSolicitanteStr = formData.get('id_solicitante')?.toString();
        const nombreSolicitante = formData.get('nombre_solicitante');
        //const apellidoSolicitante = formData.get('apellido_solicitante');
        //const correoSolicitante = formData.get('correoSolicitante');

        if (!idMascotaStr || !idResponsableStr) {
                    return new Response(JSON.stringify({ error: 'IDs de mascota o usuario faltantes.' }), {
                        status: 400,
                        headers: { 'Content-Type': 'application/json' },
                    });
        }
        
        const idMascota = parseInt(idMascotaStr);
        const idResponsable = parseInt(idResponsableStr);
        const idSolicitante = parseInt(idSolicitanteStr);
        const estado = 'pendiente';

        if (isNaN(idMascota) || isNaN(idResponsable)) {
                    return new Response(JSON.stringify({ error: 'IDs de mascota o usuario inválidos.' }), {
                        status: 400,
                        headers: { 'Content-Type': 'application/json' },
                    });
                }


        const now = new Date();
                // Formatea a 'YYYY-MM-DD HH:MM:SS' para SQLite
                // `toISOString()` devuelve "YYYY-MM-DDTHH:mm:ss.sssZ"
                // Lo dividimos para obtener la parte de fecha y hora, y removemos la 'T' y la 'Z' y milisegundos
            const fechaSolicitud = now.toISOString().slice(0, 19).replace('T', ' ');
            
        await turso.execute({
                sql: 'Insert Into solicitudes (id_mascota, id_responsable, nombre_responsable, fecha_solicitud, estado, id_solicitante, nombre_solicitante) Values (?, ?, ?, ?, ?, ?, ?)',
                args: [idMascota, idResponsable, nombreResponsable, fechaSolicitud, estado, idSolicitante, nombreSolicitante],
            });
            return redirect(`/mascotas/${idMascota}?solicitud=success`);

        } catch (error) {
                console.error('Error al registrar la solicitud de adopción:', error);
                return new Response(JSON.stringify({ error: 'Fallo al registrar la solicitud de adopción.' }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
}




// export const POST: APIRoute = async ({ request, redirect }) => {
//     try {

//         //const body = await request.json(); si trabajo con json de ambos lados
//         //const idMascotaStr = body.id_mascota?.toString() y demas variables a declarar
//         const formData = await request.formData();
//         const idMascotaStr = formData.get('id_mascota')?.toString();
//         const idUsuarioStr = formData.get('id_responsable')?.toString();
//         const nombreUsuario = formData.get('nombre_usuario');
//         const idSolicitanteStr = formData.get('id_solicitante')?.toString();
//         const nombreSolicitante = formData.get('nombre_solicitante');
//         const apellido_solicitante = formData.get('apellido_solicitante');
//         const correo_solicitante = formData.get('correoSolicitante');
        

//         if (!idMascotaStr || !idUsuarioStr) {
//             return new Response(JSON.stringify({ error: 'IDs de mascota o usuario faltantes.' }), {
//                 status: 400,
//                 headers: { 'Content-Type': 'application/json' },
//             });
//         }

//         const idMascota = parseInt(idMascotaStr);
//         const idUsuario = parseInt(idUsuarioStr);
//         const idSolicitante = parseInt(idSolicitanteStr);
//         const estado = 'pendiente';

//         const now = new Date();
//         // Formatea a 'YYYY-MM-DD HH:MM:SS' para SQLite
//         // `toISOString()` devuelve "YYYY-MM-DDTHH:mm:ss.sssZ"
//         // Lo dividimos para obtener la parte de fecha y hora, y removemos la 'T' y la 'Z' y milisegundos
//         const fechaSolicitud = now.toISOString().slice(0, 19).replace('T', ' ');

//         if (isNaN(idMascota) || isNaN(idUsuario)) {
//             return new Response(JSON.stringify({ error: 'IDs de mascota o usuario inválidos.' }), {
//                 status: 400,
//                 headers: { 'Content-Type': 'application/json' },
//             });
//         }

//         // --- Lógica para INSERTAR en tu tabla 'adopciones' ---
//         // Asumiendo que tienes una tabla 'adopciones' con columnas id_mascota, id_usuario, fecha_solicitud
//         await turso.execute({
//             sql: "INSERT INTO solicitudes (id_mascota, id_responsable, nombre_usuario, fecha_solicitud, estado, id_solicitante, nombre_solicitante) VALUES (?, ?, ?, ?, ?, ?, ?)",
//             args: [idMascota, idUsuario, nombreUsuario, fechaSolicitud, estado, idSolicitante, nombreSolicitante],
//         });

//         // Redirige a la página de confirmación o a la lista de mascotas
//         return redirect(`/mascotas/${idMascota}?solicitud=success`); // Ejemplo de redirección con mensaje

//     } catch (error) {
//         console.error('Error al registrar la solicitud de adopción:', error);
//         return new Response(JSON.stringify({ error: 'Fallo al registrar la solicitud de adopción.' }), {
//             status: 500,
//             headers: { 'Content-Type': 'application/json' },
//         });
//     }
// };