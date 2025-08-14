import React, { useState } from 'react';

const SolicitudesAdopcion = ({ data }) => {
    
    const [abrirModal, setAbrirModal] = useState(false);
    const [aceptarSolicitud, setAceptarSolicitud] = useState(null);
    const [actualizarEstado, setActualizarEstado] = useState(false);
    const [errorActualizar, setErrorActualizar] = useState(null);

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


    const handleAbrirModal = (solicitud) => {
        setAceptarSolicitud(solicitud);
        setAbrirModal(true);
    };

    const handleCerrarModal = () => {
        setAbrirModal(false);
        setAceptarSolicitud(null);
        setErrorActualizar(null);
    }

    const handleAceptarConsulta = async () => {
        if (!aceptarSolicitud) return;
        setActualizarEstado(true);
        setErrorActualizar(null);

        try {
            const response = await fetch('/api/solicitudes/update-estado', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    solicitudId: aceptarSolicitud.id,
                    nuevoEstado: 'aceptado',
                    mascotaId: aceptarSolicitud.id_mascota,
                    // Si necesitas pasar más datos, como el ID del responsable, agrégalos aquí.
                }),
                //body: formData,
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Error al actualizar estado.');
            }
            alert(result.message);
            window.location.reload;
        } catch (error) {
            console.error('Error al aceptar la solicitud:', error);
            setErrorActualizar(error.message);
        } finally {
            setActualizarEstado(false);
        }

    };

    if (!data || !data.solicitudes || data.solicitudes.length === 0) {
        return (<div className="alert alert-info"><p>No tienes solicitudes.</p></div>);
    }

    const solicitudes = data.solicitudes;
    return (
        <div>
            <h5>Solicitudes de adopcion</h5>
            <div className="container-fluid pt-3" style={{ overflowX: 'auto' }}>
                <table>
                    <thead>
                        <tr>
                            <th scope="col">ID</th>
                            <th scope="col">Solicitante</th>
                            <th scope="col">Mascota</th>
                            <th scope="col">Fecha</th>
                            <th scope="col">Estado</th>
                            <th scope="col">Aceptado</th>
                            <th>Formulario</th>
                        </tr>
                    </thead>
                    <tbody>
                        {solicitudes.map(item => (
                            <tr key={item.id}>
                                <th>{item.id}</th>
                                <td>{item.nombre_solicitante}</td>
                                <td>{item.id_mascota}</td>
                                <td>{item.fecha_solicitud}</td>
                                <td><span className={`badge bg-${item.estado === 'pendiente' ? 'warning' : 'success'}`}>{item.estado}</span></td>
                                <td>{item.estado === 'pendiente' && (
                                    <button className="btn btn-sm btn-success" onClick={() => handleAbrirModal(item)} disabled={actualizarEstado}>Aceptar</button>
                                )}</td>
                                <td>
                                    <button onClick={() => verFormulario(item.correo)}>Ver Formulario</button>
                                </td>
                            </tr>

                        ))}
                    </tbody>
                </table>
            </div>
            {abrirModal && (
                <div className="modal" style={{ display: 'block' }} tabIndex="-1">
                    <div className='modal-dialog'>
                        <div className="modal-content">
                            <div className='modal-header'>
                                <h5>Confirmar adopción</h5>
                                <button type="button" className="btn-close" onClick={handleCerrarModal}></button>
                            </div>
                            
                            <div className='modal-body'>
                                {errorActualizar && <div className="alert-danger">{errorActualizar}</div>}
                                {aceptarSolicitud ? (
                                    <p>Estas seguro?</p>
                                ) : (<p>Error: no se seleccionó ninguna solicitud.</p>)}
                            </div>
                            <div className='modal-footer'>
                                <button type="button" className="btn btn-secondary" onClick={handleCerrarModal}>Cancelar</button>
                                <button type="button" className="btn btn-success" onClick={handleAceptarConsulta} disabled={actualizarEstado}>{actualizarEstado ? 'Aceptando...' : 'Aceptar solicitud'}</button>
                            </div>
                            
                            
                        </div>
                    </div>                  

                </div>
            )}
            {abrirModal && <div className="modal-backdrop fade show"></div>}
            {formularioActual !== null && (
                <div className="modal show" style={{ display: 'block' }} tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Formulario del Solicitante</h5>
                                <button type="button" className="btn-close" onClick={() => setFormularioActual(null)}></button>
                            </div>
                            <div className="modal-body">
                                <pre>{formularioActual}</pre>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

};

export default SolicitudesAdopcion;