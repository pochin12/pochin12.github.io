import React, { useState, useEffect } from 'react';
import MisDatos from "./MisDatos";
import PublicarMascotaForm from "./PublicarMascotaForm";
import SolicitudesAdopcion from "./SolicitudesAdopcion";
import SeguimientoAdoptados from './SeguimientoAdoptados';


const ProfileTabs = ({ userEmail }) => {
    const [activeTab, setActiveTab] = useState('misDatos');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [usuarioid, setUsuarioId] = useState(null);
    const [activado, setActivado] = useState(true);
    // const manejarBoton = () => {
    //     setActivado(!activado);
    // };


    //cargar segun pestaña activa
    const fetchData = async (tab) => {
        setLoading(true);
        setError(null);
        setData(null);//limpiar los datos anteriores
        try {
            let endpoint = '';
            //swith peticion datos, logica llamada api
            switch (tab) {
                case 'misDatos':
                    endpoint = `/api/perfil/get-usuario?userEmail=${userEmail}`;
                    //pasa correo si es necesario por la session o datos de ese email
                    //?userEmail parametro de consulta que se envia en url = variable que interpora react
                    //debe coincidir con el nombre en el endpoint searchParams.get('userEmail')
                    break;
                case 'publicarMascota':
                    setData({});
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
            console.log(`[ProfileTabs] Fetching data for tab: ${tab} from endpoint: ${endpoint}`);
            if (endpoint) {
                const response = await fetch(endpoint);
                const json = await response.json();
                console.log(`[ProfileTabs] Received JSON for tab ${tab}:`, json);
                setData(json);
                if (!response.ok) {
                    if (response.status === 404 && json.error === 'Usuario no encontrado en la base de datos.') {
                        setError('USUARIO_NO_ENCONTRADO'); // Usamos un código interno para este caso específico
                        setData(null); // Asegúrate de que no haya datos viejos
                        setActivado(!activado);
                    } else {
                        throw new Error(`HTTP error! status: ${response.status}`);
                        //"Bad Request" (400): Este es un error común cuando la //
                        // solicitud enviada al servidor es incorrecta o le falta información esperada.
                        //HTTP error! status: 400: Esto significa que tu cliente (el fetch en ProfileTabs) //
                        // sí está llegando a tu endpoint de Astro, pero el endpoint //
                        //  está devolviendo un error HTTP 400 (Bad Request);
                    }
                } else {
                    setData(json); 
                    //si la respues es ok codigo 200
                }
                
            }
        } catch (err) {
            console.error(`[ProfileTabs] Error fetching data for tab ${tab}:`, err);
            setError(err.message || 'Error desconocido.');
        } finally {
            setLoading(false);
        }
    };
    //cargar datos cuanto la pestaña activa cambie
     // useremail como dependencia si es parte del endpoint

    // Handler para el cambio en el select
    //esto quedo creo q no es necesario
    // const handleSelectChange = (event) => {
    //     setActiveTab(event.target.value);
    // };
    useEffect(() => {
        fetchData(activeTab);
    }, [activeTab, userEmail]);

    const renderizarContenido = () => {
        console.log(`[ProfileTabs] Rendering content for tab: ${activeTab}. Current data state:`, data);
        if (loading) return <p>cargando datos...</p>;
        if (error) return <p className='text-danger'>Error: {error}</p>

        //swith para renderizado de datos, logica UI
        switch (activeTab) {
            case 'misDatos':
                return <MisDatos client:load data={data} />;
            case 'publicarMascota':
                return <PublicarMascotaForm />;
            case 'adopciones':
                return <SeguimientoAdoptados client:load data={data} />;
            case 'solicitudesAdopcion':
                return <SolicitudesAdopcion client:load data={data} />;
            case 'mensajes':
                return <p>No hay mensajes para mostrar</p>
                
                break;
        
            default:
                break;
        };
    };
    
    
    return (
        
        <div className="container-fluid">
            {/* <select className="form-select" value={activeTab} onChange={(e) => setActiveTab(e.target.value)}>
                <option value="misDatos">Mis Datos</option>
                <option value="publicarMascota">Publicar Mascota</option>
                <option value="adopciones">Mis Adopciones</option>
                <option value="solicitudesAdopcion">Solicitudes de Adopción</option>
                <option value="mensajes">Mensajes</option>
            </select>
            <div className="mt-4 p-3 border rounded">
                {renderizarContenido()}
            </div> */}
            <div className="dropdown">

                <button disabled={!activado}
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
                {renderizarContenido()}
            </div>
        </div>
    );
};
export default ProfileTabs;