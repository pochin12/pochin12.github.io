import React, { useState, useEffect } from "react";

const MascotaListado = ({ mascotas }) => {
    const [filtrarMascotas, setFiltrarMascotas] = useState(mascotas);
    const [filtrosexo, setFiltroSexo] = useState('');
    const [filtrotamano, setFiltroTamano] = useState('');
    const [filtrocolor, setFiltroColor] = useState('');
    const [sortBy, setSortBy] = useState('id'); // 'id', 'edad_asc', 'edad_desc'

    function RadioButtonGroup() {
        const [selectedValue, setSelectedValue] = useState('option1'); // Initial selected value

        const handleChange = (event) => {
            setSelectedValue(event.target.value);
        };
    }


    useEffect(() => {
        let tempMascotas = [...mascotas];
        if (filtrosexo) {
            tempMascotas = tempMascotas.filter(mascota => mascota.sexo === filtrosexo)
        }

        if (filtrotamano) {
            tempMascotas = tempMascotas.filter(mascota => mascota.color.toLowerCase().includes(filtrocolor.toLowerCase()));
        }

        if (filtrotamano) {
            tempMascotas = tempMascotas.filter(mascota => mascota.tamano.toLowerCase().includes(filtrotamano.toLowerCase()));
        }

        if (sortBy === 'edad_asc') {
            tempMascotas.sort((a, b) => a.edad - b.edad);
        } else if (sortBy === 'edad_desc') {
            tempMascotas.sort((a, b) => b.edad - a.edad);
        } else { // Default: por ID
            tempMascotas.sort((a, b) => b.id - a.id);
        }

        setFiltrarMascotas(tempMascotas);
    }, [mascotas, filtrosexo, filtrocolor, filtrotamano]); //reejecutar cuando cambian los filtros

    //obtener todos los datos unicos para cada filtro
    const coloresUnicos = [...new Set(mascotas.map(m => m.color))].sort();
    const tamanosUnicos = [...new Set(mascotas.map(m => m.tamano))].sort();

    return (
        <div className="container-fluid">
            <div className="row mb-3">
                <div className="col-md-3">
                    <label htmlFor="filtrosexo" className="form-label">Filtrar por Sexo:</label>
                    {/* <input type="radio" id="opcion1" value="M" checked={filtrosexo === "M"} onChange={(e) => setFiltroSexo(e.target.value)}></input>
                    <label>Macho</label>
                    <input type="radio" id="opcion1" value="H" checked={filtrosexo === "H"} onChange={(e) => setFiltroSexo(e.target.value)}></input>
                    <label>hembra</label> */}
                    
                    <select id="filtrosexo" className="form-select" value={filtrosexo} onChange={(e) => setFiltroSexo(e.target.value)}>
                        <option value="M">Macho</option>
                        <option value="H">Hembra</option>
                        <option value="">Todos</option>
                    </select>
                </div>
                <div className="col-md-3 col-xs-1">
                    <label htmlFor="filtrocolor" className="form-label">Filtrar por Color:</label>
                    <select
                        id="filtrocolor"
                        className="form-select"
                        value={filtrocolor}
                        onChange={(e) => setFiltroColor(e.target.value)}
                        
                    >
                        <option value="">Todos</option>
                        {coloresUnicos.map(color => (
                            <option key={color} value={color}>{color}</option>
                        ))}
                    </select>
                    
                </div>
                <div className="col-md-3">
                    <label htmlFor="filtrotamano" className="form-label">Filtrar por tamaño:</label>
                    <select
                        id="filtrotamano"
                        className="form-select"
                        value={filtrotamano}
                        onChange={(e) => setFiltroTamano(e.target.value)}
                    >
                        <option value="">Todos</option>
                        {tamanosUnicos.map(tamano => (
                            <option key={tamano} value={tamano}>{tamano}</option>
                        ))}
                    </select>
                </div>

                <div className="col-md-3">
                    <label htmlFor="sortBy" className="form-label">Ordenar por Edad:</label>
                    <select
                        id="sortBy"
                        className="form-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="id">Más Recientes</option>
                        <option value="edad_asc">Edad: Menor a Mayor</option>
                        <option value="edad_desc">Edad: Mayor a Menor</option>
                    </select>
                </div>
            </div>
            <div className="container-fluid p-0 m-0">
                <div
                    className="card p-2"
                    style={{ maxHeight: '65vh', overflowY: 'auto' }}
                >
                    <div className="row">
                        {filtrarMascotas.length > 0 ? (
                            filtrarMascotas.map((mascota) => (
                                <div key={mascota.id} className="col-md-4 col-6 mb-1"> {/* Ajusta el tamaño de la columna */}
                                    <div className="card h-100 p-0"> {/* h-100 para tarjetas de igual altura */}
                                        {mascota.imagen && (
                                            <img
                                                src={mascota.imagen}
                                                className="card-img-top"
                                                alt={mascota.nombre}
                                                style={{ height: '200px', objectFit: 'cover' }} // Estilo para la imagen
                                            />
                                        )}
                                        <div className="card-body">
                                            <h5 className="card-title">{mascota.nombre}</h5>
                                            <p className="card-text">Sexo: {mascota.sexo}</p>
                                            <p className="card-text">Edad: {mascota.edad} años</p>
                                            <p className="card-text">Color: {mascota.color}</p>
                                            
                                            
                                            {/* Aquí puedes añadir el botón para ver detalles si es necesario */}
                                            <a href={`/mascotas/${mascota.id}`} className="btn btn-primary">Ver Detalles</a>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center col-12">No se encontraron mascotas con los filtros aplicados.</p>
                        )}
                    </div>

                </div>
            </div>
            
        </div>
    );

};

    export default MascotaListado;