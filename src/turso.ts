import { createClient } from "@libsql/client"; // Asumiendo que usas @libsql/client

// Asegúrate de que estas variables de entorno están definidas
// en tu .env.local (para desarrollo) y en Netlify (para producción)
const DB_URL = import.meta.env.TURSO_DATABASE_URL;
const DB_AUTH_TOKEN = import.meta.env.TURSO_AUTH_TOKEN;

if (!DB_URL || !DB_AUTH_TOKEN) {
    console.error("Faltan las variables de entorno para Turso (TURSO_DATABASE_URL, TURSO_AUTH_TOKEN)");
    // Puedes decidir si quieres lanzar un error o simplemente no exportar el cliente
    throw new Error("Missing Turso database credentials.");
}

export const turso = createClient({
    url: DB_URL,
    authToken: DB_AUTH_TOKEN,
});