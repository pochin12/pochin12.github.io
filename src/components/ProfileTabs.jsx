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
                    setData({ message: "Cargar datos de mascota para adopción" });
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

    // Handler para el cambio en el select
    const handleSelectChange = (event) => {
        setActiveTab(event.target.value);
    };

    return (
        <div className="containter-fluid">
            {/* <select
                className="form-select form-select-sm mb-3 w-auto" // Clases de Bootstrap para estilo
                aria-label="Selecciona una opción de perfil"
                value={activeTab} // El valor seleccionado refleja el estado activeTab
                onChange={handleSelectChange} // Actualiza activeTab cuando se selecciona una opción
                
            >
                <option className="" value="misDatos">Mis Datos</option>
                <option value="publicarMascota">Publicar para adoptar</option>
                <option value="adopciones">Adoptados para seguimiento</option>
                <option value="mensajes">Mensajes</option>
                <option value="solicitudesAdopcion">Solicitudes de adopción</option>
            </select> */}
            <div className="dropdown">
                <button
                    className="btn btn-sueccess dropdown-toggle" // Clases de Bootstrap para el botón
                    type="button"
                    id="profileDropdown" // Un ID único para el botón
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                >
                    {/* Muestra el texto de la pestaña activa o un texto por defecto */}
                    {
                        activeTab === 'misDatos' ? 'Mis Datos' :
                            activeTab === 'publicarMascota' ? 'Publicar para adoptar' :
                                activeTab === 'adopciones' ? 'Adoptados para seguimiento' :
                                    activeTab === 'mensajes' ? 'Mensajes' :
                                        activeTab === 'solicitudesAdopcion' ? 'Solicitudes de adopción' :
                                            'Seleccionar Opción' // Texto por defecto
                    }
                </button>

                <ul className="dropdown-menu" aria-labelledby="profileDropdown">
                    <li>
                        <a
                            className={`dropdown-item ${activeTab === 'misDatos' ? 'active' : ''}`}
                            href="#"
                            onClick={(e) => { e.preventDefault(); setActiveTab('misDatos'); }}
                        >
                            Mis Datos
                        </a>
                    </li>
                    <li>
                        <a
                            className={`dropdown-item ${activeTab === 'publicarMascota' ? 'active' : ''}`}
                            href="#"
                            onClick={(e) => { e.preventDefault(); setActiveTab('publicarMascota'); }}
                        >
                            Publicar para adoptar
                        </a>
                    </li>
                    <li>
                        <a
                            className={`dropdown-item ${activeTab === 'adopciones' ? 'active' : ''}`}
                            href="#"
                            onClick={(e) => { e.preventDefault(); setActiveTab('adopciones'); }}
                        >
                            Adoptados para seguimiento
                        </a>
                    </li>
                    <li>
                        <a
                            className={`dropdown-item ${activeTab === 'mensajes' ? 'active' : ''}`}
                            href="#"
                            onClick={(e) => { e.preventDefault(); setActiveTab('mensajes'); }}
                        >
                            Mensajes
                        </a>
                    </li>
                    <li>
                        <a
                            className={`dropdown-item ${activeTab === 'solicitudesAdopcion' ? 'active' : ''}`}
                            href="#"
                            onClick={(e) => { e.preventDefault(); setActiveTab('solicitudesAdopcion'); }}
                        >
                            Solicitudes de adopción
                        </a>
                    </li>
                </ul>
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
                                {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
                                <div class="form-floating">
                                    <input type="text" class="form-control" id="nombre" placeholder='ingrese'></input>
                                    <label for="nombre">Nombre:</label>
                                </div>
                                <div class="form-floating">
                                    <input type="text" class="form-control" id="apellido" placeholder='ingrese'></input>
                                    <label for="apellido">Apellido:</label>
                                </div>
                                <div class="form-floating">
                                    <input type="email" class="form-control" id="correo" placeholder="correo" value={userEmail} disabled required />
                                    <label for="correo">Correo</label>
                                </div>
                                
                                <div class="form-floating">
                                    <input type="number" class="form-control" id="telefono" placeholder='telefono'></input>
                                    <label for="telefono">Telefono:</label>
                                </div>
                                
                                {data.usuarios && data.usuarios.length > 0 && (
                                    
                                    <>
                                        
                                    </>
                                )}
                            </div>
                        )}
                        {activeTab === 'publicarMascota' && (
                            <div>
                                <h4>Cargar datos de mascota para adopción</h4>
                                
                                <form action="/api/perfil/post-mascota" method="POST">
                
                                    <div class="form-floating">
                                        <input type="text" class="form-control" id="nombre" placeholder='ingrese' name="nombre"></input>
                                        <label for="nombre">Nombre:</label>
                                    </div>
                                    <div className="form-floating">
                                        <select class="form-select mb-3 w-75" id="tipo" name="tipo">
                                            <option value="perro">Perro</option>
                                            <option value="gato">Gato</option>

                                        </select>
                                        <label for="tamano">Tipo de mascota</label>
                                    </div>
                                    <div class="form-floating">
                                        <input type="text" class="form-control" id="color" name="color" placeholder='arena'></input>
                                        <label for="color">Color:</label>
                                    </div>  
                                    <div className="form-floating">
                                        <input type="number" class="form-control" id="edad" name="edad" placeholder='edad' />
                                        <label for="edad">Edad:</label>
                                    </div>
                                    <div className="form-floating">
                                        <select class="form-select mb-3 w-75" id="tamano" name="tamano">
                                            <option value="chico">Chico</option>
                                            <option value="mediano">Mediano</option>
                                            <option value="grande">Grande</option>
                                        </select>
                                        <label for="tamano">Seleccione el tamaño</label>
                                    </div>
                                    <div className="form-floating">
                                        <select class="form-select mb-3 w-75" id="sexo" name="sexo">
                                            <option value="">Seleccione una</option>
                                            <option value="M">Macho</option>
                                            <option value="H">Hembra</option>
                                            
                                        </select>
                                        <label for="sexo">Sexo:</label>
                                    </div>
                                    <div class="form-floating border-success">
                                        <input type="text" class="form-control" id="castrado" name="castrado" placeholder=''></input>
                                        <label for="castrado">Castrado: si-no</label>
                                    </div>
                                    <div class="form-floating border-success">
                                        <input type="text" class="form-control" id="imagen" name="imagen" placeholder='imagen'></input>
                                        <label for="imagen">Imagen</label>
                                    </div>
                                    <div class="form-floating">
                                        <textarea type="text" class="form-control" id="descripcion" name="descripcion" placeholder=''></textarea>
                                        <label for="descripcion">Descripción:</label>
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