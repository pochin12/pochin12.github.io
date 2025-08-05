import React from "react";

const SeguimientoAdoptados = ({ data }) => {
    console.log('[SolicitudesAdopcion] Received data prop:', data);
    if (!data.adopciones) {
        return <p>hola</p>
    }

    return (
        <div>
            <p>Adopciones para seguimiento</p>
            <ul>
                {data.adopciones.map(item => (
                    <li key={item.id}>Adopción de {item.fecha_solicitud} ({item.estado})</li>
                ))}
            </ul>
        </div>
    )
    
}

export default SeguimientoAdoptados;