
import { db, Usuarios, Mascotas } from 'astro:db';

// https://astro.build/db/seed
export default async function seed() {
	// TODO
	await db.insert(Usuarios).values([
		{ nombre: "ramiro", telefono: 12374, apellido: "canteros", correo: "hola@utn.com" },
		{ nombre: "itati", telefono: 1145, apellido: "torres", correo: "ita@utn.com" },

	]);

	await db.insert(Mascotas).values([
		{ nombre: "luna", color: "arena", edad: 8, comentario: "una perra re loca", id_u: 1 },

	])
}