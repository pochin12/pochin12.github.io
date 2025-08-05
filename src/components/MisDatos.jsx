// components/MisDatos.jsx
import React from 'react';

const MisDatos = ({ data }) => {
    if (!data || !data.usuarios || data.usuarios.length === 0) {
        return <p>No hay datos de usuario disponibles.</p>;
    }

    const usuario = data.usuarios[0];
    return (
        <div>
            <h4>Mis datos de perfil</h4>
            <p>Nombre: {usuario.nombre} {usuario.apellido}</p>
            <div class="form-floating">
                <input type="text" class="form-control" id="nombre" placeholder='nombre' value={usuario.nombre} disabled></input>
                <label for="nombre">Nombre:</label>
            </div>
            <div class="form-floating">
                <input type="text" class="form-control" id="apellido" placeholder='ingrese' value={usuario.apellido} disabled></input>
                <label for="apellido">Apellido:</label>
            </div>
            <div class="form-floating">
                <input type="email" class="form-control" id="correo" placeholder="correo" value={usuario.correo} disabled/>
                <label for="correo">Correo</label>
            </div>

            <div class="form-floating">
                <input type="number" class="form-control" id="telefono" placeholder='telefono' value={usuario.telefono} disabled></input>
                <label for="telefono">Telefono:</label>
            </div>
            <button className="btn btn-secondary mt-2">Editar Datos</button>
        </div>
    );
};

export default MisDatos;