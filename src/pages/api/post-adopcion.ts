import type { APIRoute } from "astro";
import { turso } from "../../turso";


export const POST: APIRoute = async ({
    request }) => {
    try {
        const data = await request.json();
        const { id_usuario, id_mascota } = data;

        // Validar que los datos existen
        if (!id_usuario || !id_mascota) {
            return new Response(JSON.stringify({ message: 'Faltan datos de usuario o mascota.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }
    }
}
