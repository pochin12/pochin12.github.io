import type { APIRoute } from "astro";//para archivos de endpoint .js o ts
//si es una pagina .astro tiene frontmatter y no necesita este apiroute
import { turso } from "../../turso";

export const POST: APIRoute = async ({ request, redirect }) => {
    try {
        const formData = await request.formData();
        // ¡CORRECCIÓN AQUÍ! Llama a .toString() con paréntesis
        const nombre = formData.get('nombre')?.toString();
        const apellido = formData.get('apellido')?.toString();
        const correo = formData.get('correo')?.toString();

        const tel = formData.get('telefono'); // Esto es un FormDataEntryValue
        // Verifica si tel es null o undefined antes de intentar toString() y parseInt()
        let telefono: number | null = null;
        if (tel !== null && tel !== undefined && typeof tel === 'string' && tel.trim() !== '') {
            const parsedTel = parseInt(tel.trim());
            if (!isNaN(parsedTel)) {
                telefono = parsedTel;
            }
        }


        // Validación mejorada y más robusta
        if (
            typeof nombre !== 'string' || nombre.trim() === '' ||
            typeof apellido !== 'string' || apellido.trim() === '' ||
            typeof correo !== 'string' || correo.trim() === '' ||
            telefono === null // Valida que telefono sea un número válido y no null
        ) {
            console.error('Validación fallida: Campos obligatorios o inválidos.');
            return new Response(JSON.stringify({ error: 'Todos los campos son obligatorios y válidos.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Ejecutar la inserción en Turso
        await turso.execute({
            sql: "INSERT INTO usuarios (nombre, apellido, correo, telefono) VALUES (?, ?, ?, ?)",
            // Asegúrate de que los tipos coincidan con las columnas de tu DB
            // Si 'telefono' es TEXT en tu DB, pasa `tel.toString()` sin parseInt
            args: [nombre, apellido, correo, telefono]
        });

        return redirect('/'); // Redirige a la página principal después de crear
    } catch (error) {
        // Este catch capturará el error si turso.execute falla
        console.error('Error al registrar usuario:', error);
        return new Response(JSON.stringify({ error: 'Fallo al registrar el usuario.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};