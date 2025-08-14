async function obtenerFormularioPorCorreo(correo) {
    try {
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: "1RgJkkeOqzI_qdqrN9EKbn-BXvdBFenmrn6SA3ojruow",
            range: "mascotas!A:G",
        });

        const values = response.result.values;

        if (!values || values.length < 2) return null;

        const headers = values[0];
        const dataRows = values.slice(1);
        const fila = dataRows.find((row) => row[1] === correo); // Suponiendo columna B es el correo

        if (!fila) return null;

        // Armar datos legibles para mostrar
        const datos = headers.map((header, index) => `${header}: ${fila[index] || ''}`).join("\n");
        return datos;
    } catch (err) {
        console.error("Error al obtener formulario:", err);
        return null;
    }
}

const [formularioActual, setFormularioActual] = useState(null);

async function verFormulario(correo) {
    const datos = await obtenerFormularioPorCorreo(correo);
    if (datos) {
        setFormularioActual(datos);
    } else {
        setFormularioActual("No se encontraron datos para este correo.");
    }
}
