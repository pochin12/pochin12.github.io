import { defineDb, defineTable, column } from 'astro:db';

const Usuarios = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    nombre: column.text(),
    telefono: column.number(),
    apellido: column.text(),
    correo: column.text(),
  }
});

const Mascotas = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    edad: column.number(),
    comentario: column.text(),
    color: column.text(),
    id_u: column.number({ references: () => Usuarios.columns.id }),
  }
});

export default defineDb({
  tables: { Usuarios, Mascotas },
});