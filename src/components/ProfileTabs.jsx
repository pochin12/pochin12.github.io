import React, { useState, useEffect } from 'react';
const ProfileTabs = ({ userEmail }) => {
    const [activeTab, setActiveTab] = useState('misDatos');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    //cargar segun pestaña activa
    const fetchData = async (tab) => {
        setLoading(true);
        setError(null);
        setData(null);//limpiar los datos anteriores
        try {
            let endpoint = '';
            switch (tab) {
                case 'misDatos':
                    endpoint = `/api/perfil/get-usuario?userEmail=${userEmail}`;
                    //pasa correo si es necesario por la session o datos de ese email
                    //?userEmail parametro de consulta que se envia en url = variable que interpora react
                    //debe coincidir con el nombre en el endpoint searchParams.get('userEmail')
                    break;
                case 'publicarMascota':
                    setData({ message: "Formulario para publicar una mascota.." });
                    setLoading(false);
                    return;
                case 'adopciones':
                    endpoint = `/api/perfil/get-adopciones?userEmail=${userEmail}`;
                    break;
                case 'solicitudesAdopcion':
                    endpoint = `/api/perfil/get-solicitudes?userEmail=${userEmail}`;
                    break;
                case 'mensajes':
                    // Asumiendo que aún no tienes endpoint de mensajes
                    setData({ message: "No hay mensajes disponibles." });
                    setLoading(false);
                    return;
                default:
                    setData({ message: "Selecciona una opción." });
                    setLoading(false);
                    return;
                    
            }
            if (endpoint) {
                const response = await fetch(endpoint);
                if(!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                    //"Bad Request" (400): Este es un error común cuando la //
                    // solicitud enviada al servidor es incorrecta o le falta información esperada.
                    //HTTP error! status: 400: Esto significa que tu cliente (el fetch en ProfileTabs) //
                    // sí está llegando a tu endpoint de Astro, pero el endpoint //
                    //  está devolviendo un error HTTP 400 (Bad Request).
                }
                const json = await response.json();
                setData(json);
            }
        } catch (err) {
            setError(err.message || 'Error al cargar los datos-.');
            console.error("error fetching data for tab:", tab, err);
        } finally {
            setLoading(false);
        }
    };
    //cargar datos cuanto la pestaña activa cambie
    useEffect(() => {
        fetchData(activeTab);
    }, [activeTab, userEmail]); // useremail como dependencia si es parte del endpoint

    return (
        <div className="containter-fluid">
            <div className='d-grid gap-3 col-8 mx-auto m-3'>
                <h3> Mascotas de {userEmail}</h3>
                <button className='btn btn-primary btl-lg' onClick={() => setActiveTab('misDatos')}>Mis Datos</button>
                <button className='btn btn-primary btn-lg' onClick={() => setActiveTab('publicarMascota')}>Publicar para adoptar</button>
                <button className='btn btn-primary btn-lg' onClick={() => setActiveTab('adopciones')}>Adoptados para seguimiento</button>
                <button className="btn btn-primary btn-lg" onClick={() => setActiveTab('mensajes')}>Mensajes</button>
                <button className="btn btn-primary btn-lg" onClick={() => setActiveTab('solicitudesAdopcion')}>Solicitudes de adopción</button>

            </div>
            <div className="mt-4 p-3 border rounded">
                {loading && <p>Cargando datos...</p>}
                {error && <p className="text-danger">Error: {error}</p>}
                {!loading && !error && data && (
                    <div>
                        {activeTab === 'misDatos' && (
                            <div>
                                <h4>Mis datos de perfil</h4>
                                {/* CORRECCIÓN: Los datos de usuario vendrán de tu endpoint, no de data.user directamente si el endpoint retorna un objeto con 'usuarios' */}
                                {/* Necesitarás adaptar cómo accedes a los datos si el endpoint devuelve { usuarios: [{...}] } */}
                                <pre>{JSON.stringify(data, null, 2)}</pre>
                                {data.usuarios && data.usuarios.length > 0 && (
                                    <>
                                        <p>Nombre: {data.usuarios[0]?.nombre} {data.usuarios[0]?.apellido}</p>
                                        <p>Email: {data.usuarios[0]?.correo}</p>
                                    </>
                                )}
                            </div>
                        )}
                        {activeTab === 'publicarMascota' && (
                            <div>
                                <h4>Formulario para publicar</h4>
                                <form action="/api/perfil/post-mascota" method="POST">
                                    <h2>Cargar datos de mascota para adopcion</h2>
                                    <div>
                                        <label for="name">Nombre:</label>
                                        <input type="text" id="nombre" name="nombre" required />
                                    </div>
                                    <div>
                                        <label for="name">Color:</label>
                                        <input type="text" id="color" name="color" required />
                                    </div>
                                    <div>
                                        <label for="tamaño">Tamaño:</label>
                                        <input type="text" id="tamano" name="tamano" required />
                                    </div>
                                    <div>
                                        <label for="edad">Edad:</label>
                                        <input type="number" id="edad" name="edad" required />
                                    </div>
                                    <div>
                                        <label for="name">Sexo:</label>
                                        <input type="text" id="sexo" name="sexo" required />
                                    </div>
                                    <div>
                                        <label for="name">id usuario:</label>
                                        <input type="number" id="id_usuario" name="id_usuario" required />
                                    </div>
                                    <div>
                                        <label for="descripcion">Descripcion:</label>
                                        <textarea id="descripcion" name="descripcion" required></textarea>
                                    </div>

                                    <button type="submit">Publicar mascota</button>
                                </form>
                                <p>{data.message}</p>
                            </div>
                        )}
                        {activeTab === "adopciones" && (
                            <div>
                                <h4>Adopciones para seguimiento</h4>
                                {data.adopciones && data.adopciones.length > 0 ? (
                                    <ul>
                                        {data.adopciones.map(item => (
                                            <li key={item.id}>Adopción de {item.fecha_solicitud} ({item.estado})</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>No tienes adopciones registradas.</p>
                                )}
                            </div>
                        )}
                        {activeTab === 'solicitudesAdopcion' && (
                            <div>
                                <h4>Solicitudes de adopción</h4>
                                {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
                                    {data.solicitudes && data.solicitudes.length > 0 ? (
                                    //  <ul>
                                    //     {data.solicitudes.map(item => (
                                    //         <li key={item.id}>Solicitud para {item.fecha_solicitud} solicitante: {item.nombre_solicitante}({item.estado})</li>
                                    //     ))}
                                    //     </ul>                                    
                                    <div class="container-fluid pt-3">
                                        <table class="table table-hover">
                                            <thead>
                                                <tr>
                                                    <th scope="col">#</th>
                                                    <th scope="col">Solicitante</th>
                                                    <th scope="col">Mascota</th>
                                                    <th scope="col">Fecha solicitud</th>
                                                    <th scope="col">Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {data.solicitudes.map(item => (
                                                    <tr key={item.id}>
                                                        <th scope="">{item.id}</th>
                                                        <td>{item.nombre_solicitante}</td>
                                                        <td>{item.id_mascota}</td>
                                                        <td>{item.fecha_solicitud}</td>
                                                        <td>{item.estado}</td>
                                                    </tr>
                                                ))
                                                }
                                                {/* <ul>
                                                    {data.adopciones.map(item => (
                                                        <li key={item.id}>Adopción de {item.fecha_solicitud} ({item.estado})</li>
                                                    ))}
                                                </ul> */}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p>No tienes solicitudes de adopción pendientes.</p>
                                )}

                            </div>
                        )}
                        {/*  añade mas condiciones para otras pestañas */}
                    </div>
                )}
            </div>
        </div>
    );
};
export default ProfileTabs;