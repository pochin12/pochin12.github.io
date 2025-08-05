import React from "react";

const PublicarMascotaForm = () => {
    return (
        <div>
            <h5>Cargar datos de mascota para adopcion</h5>
            <form action="/api/perfil/post-mascota" method="POST">
                
                <div>
                    <label for="name">Nombre:</label>
                    <input type="text" id="nombre" name="nombre" required />
                </div>
                
                <div>
                    <label for="tamano">Tipo de mascota</label>
                    <select class="mb-0 w-50 border-2" id="tipo" name="tipo">
                        <option value="perro">Perro</option>
                        <option value="gato">Gato</option>

                    </select>
                </div>
                <div>
                    <label for="name">Color:</label>
                    <input type="text" id="color" name="color" required />
                </div>
                <div>
                    <label for="edad">Edad:</label>
                    <input type="number" id="edad" name="edad" required />
                </div>
                <div>
                    <label for="tamaño">Tamaño:</label>
                    <select class="mb-0 w-50 border-2" id="tamano" name="tamano">
                        <option value="chico">Chico</option>
                        <option value="mediano">Mediano</option>
                        <option value="grande">Grande</option>
                    </select>
                </div>
                
                <div>
                    <label for="name">Sexo:</label>
                    <select class="mb-0 w-50 border-2" id="sexo" name="sexo">
                        
                        <option value="M">Macho</option>
                        <option value="H">Hembra</option>
                    </select>
                </div>
                <div>
                    <label for="name">Castrado:</label>
                    <input type="text" id="castrado" name="castrado" placeholder="si/no" required />
                </div>
                <div>
                    <label for="imagen">Imagen</label>
                    <input type="text" id="imagen" name="imagen" placeholder='imagen'></input>
                </div>            
                <div>
                    <label for="descripcion">Descripcion:</label>
                    <textarea id="descripcion" name="descripcion" required></textarea>
                </div>

                <button type="submit">Publicar mascota</button>
            </form>
        </div>
    )
}

export default PublicarMascotaForm;