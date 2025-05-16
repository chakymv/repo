// Clase Departamento - Relación "tiene muchos" (one-to-many) con Persona
class Departamento {
    #id;
    #nombre;
    #miembros; // Relación con Persona (composición)

    constructor(id, nombre) {
        this.#id = id;
        this.#nombre = nombre;
        this.#miembros = []; // Array de personas que pertenecen al departamento
    }

    // Getters y setters
    getId() {
        return this.#id;
    }

    getNombre() {
        return this.#nombre;
    }

    setNombre(nombre) {
        this.#nombre = nombre;
    }

    // Métodos para gestionar los miembros
    agregarMiembro(persona) {
        if (!(persona instanceof Persona)) {
            console.error("Error: Se esperaba un objeto de tipo Persona");
            return false;
        }

        // Verificamos que no esté ya en el departamento
        if (this.#miembros.some(p => p.getCodigo() === persona.getCodigo())) {
            console.error(`La persona con código ${persona.getCodigo()} ya es miembro de este departamento`);
            return false;
        }

        this.#miembros.push(persona);
        return true;
    }

    eliminarMiembro(codigo) {
        const indice = this.#miembros.findIndex(p => p.getCodigo() === codigo);

        if (indice === -1) {
            console.error(`No se encontró ninguna persona con el código ${codigo} en este departamento`);
            return false;
        }

        this.#miembros.splice(indice, 1);
        return true;
    }

    getMiembros() {
        return [...this.#miembros]; // Devolvemos una copia
    }

    contarMiembros() {
        return this.#miembros.length;
    }
}

// Variables para elementos del DOM de Departamentos (se asignarán en la inicialización)
let departamentosList, departamentoForm, editDepartamentoForm, departamentoSelectEditar,
    departamentoSelectGestionMiembros, miembrosGestionArea, miembrosListElement,
    nombreDepartamentoMiembrosSpan, personaSelectAgregarMiembroDepartamentos, agregarMiembroBtn,
    miembroAEliminarSelect, eliminarMiembroBtn, deleteDepartamentoBtn;

function inicializarGestionDepartamentos() {
    // Obtener elementos del DOM
    departamentosList = document.getElementById('departamentos-list');
    departamentoForm = document.getElementById('departamento-form');
    editDepartamentoForm = document.getElementById('edit-departamento-form');
    departamentoSelectEditar = document.getElementById('departamento-select-editar'); // Para la pestaña de editar departamento
    departamentoSelectGestionMiembros = document.getElementById('departamento-select-miembros'); // Para la pestaña de gestionar miembros
    miembrosGestionArea = document.getElementById('miembros-gestion-area');
    miembrosListElement = document.getElementById('miembros-list');
    nombreDepartamentoMiembrosSpan = document.getElementById('nombre-departamento-miembros');
    personaSelectAgregarMiembroDepartamentos = document.getElementById('persona-select-miembros'); // Específico para agregar miembros a deptos
    agregarMiembroBtn = document.getElementById('agregar-miembro-btn');
    miembroAEliminarSelect = document.getElementById('miembro-a-eliminar-select');
    eliminarMiembroBtn = document.getElementById('eliminar-miembro-btn');
    deleteDepartamentoBtn = document.getElementById('delete-departamento'); // Botón en el form de edición

    // Event listeners (solo si los elementos existen en la página actual)
    if (departamentoForm) departamentoForm.addEventListener('submit', guardarDepartamento);
    if (editDepartamentoForm) editDepartamentoForm.addEventListener('submit', actualizarDepartamento);
    if (deleteDepartamentoBtn) deleteDepartamentoBtn.addEventListener('click', () => {
        const id = document.getElementById('edit-id-departamento').value;
        if (id) eliminarDepartamentoConfirmado(id); // Cambiado para pasar el ID
    });

    if (departamentoSelectGestionMiembros) departamentoSelectGestionMiembros.addEventListener('change', cargarMiembrosDepartamento);
    if (agregarMiembroBtn) agregarMiembroBtn.addEventListener('click', agregarMiembroADepartamento);
    if (eliminarMiembroBtn) eliminarMiembroBtn.addEventListener('click', eliminarMiembroDeDepartamento);
    if (departamentoSelectEditar) departamentoSelectEditar.addEventListener('change', () => {
        const id = departamentoSelectEditar.value;
        if (id) {
            cargarDepartamentoParaEditar(id);
            if(editDepartamentoForm) editDepartamentoForm.style.display = 'block';
        } else {
            if(editDepartamentoForm) {
                editDepartamentoForm.reset();
                editDepartamentoForm.style.display = 'none';
            }
        }
    });

    // Inicializaciones
    mostrarDepartamentos();
    actualizarSelectPersonasParaDepartamentos();
    actualizarSelectDepartamentos(); // Para el select de edición
    actualizarSelectDepartamentosParaGestionMiembros(); // Para el select de gestión de miembros
}

function mostrarDepartamentos() {
    if (!departamentosList) {
        console.error("Error: El elemento 'departamentosList' no se ha encontrado en el DOM.");
        return;
    }
    departamentosList.innerHTML = ''; // Limpiar la tabla

    // Asegúrate de que gestorDepartamentos esté definido antes de usarlo
    if (typeof gestorDepartamentos === 'undefined') {
        console.error("Error: La variable 'gestorDepartamentos' no está definida.");
        return;
    }

    const departamentos = gestorDepartamentos.obtenerTodos();
    console.log("Departamentos obtenidos para mostrar:", departamentos); // Para depuración

    if (!departamentos || departamentos.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="4" class="empty-message">No hay departamentos registrados</td>';
        departamentosList.appendChild(row);
        return;
    }

    departamentos.forEach(departamento => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${departamento.getId()}</td>
            <td>${departamento.getNombre()}</td>
            <td>${departamento.contarMiembros()}</td>
            <td>
                <button class="btn-edit" data-id="${departamento.getId()}">Editar</button>
                <button class="btn-delete" data-id="${departamento.getId()}">Eliminar</button>
            </td>
        `;
        departamentosList.appendChild(row);
    });

    // Event listeners para los botones de "Editar"
    departamentosList.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            cargarDepartamentoParaEditar(id);
            document.querySelector('.tab[data-tab="edit-departamento"]')?.click();
        });
    });

    // Event listeners para los botones de "Eliminar"
    departamentosList.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            eliminarDepartamentoConfirmado(id); // Asegúrate de que 'id' se pasa aquí
        });
    });
}
agregarDepartamento(departamento) {
    if (!(departamento instanceof Departamento)) {
        console.error("Error: Se esperaba un objeto de tipo Departamento");
        return false;
    }

    if (this.#departamentos.some(d => d.getId() === departamento.getId())) {
        console.error(`El departamento con ID ${departamento.getId()} ya existe.`);
        return false;
    }

    this.#departamentos.push(departamento);
    this.guardarEnLocalStorage();
    return true;
}

function guardarDepartamento(event) {
    event.preventDefault();

    const id = document.getElementById('id-departamento').value;
    const nombre = document.getElementById('nombre-departamento').value;

    try {
        

        const nuevoDepartamento = new Departamento(id, nombre);
        const agregado = gestorDepartamentos.agregarDepartamento(nuevoDepartamento);
        console.log('Resultado de agregarDepartamento:', agregado);
        console.log('Datos a agregar:', nuevoDepartamento);
console.log('Instancia de gestorDepartamentos:', gestorDepartamentos);

        if (agregado) {
            alert('Departamento agregado correctamente');
            if(departamentoForm) departamentoForm.reset();
            console.log('Llamando a mostrarDepartamentos()'); 
            mostrarDepartamentos();
            actualizarSelectDepartamentos();
            actualizarSelectDepartamentosParaGestionMiembros();
            document.querySelector('.tab[data-tab="view-departamentos"]')?.click();
        } else {
            alert('Error: No se pudo agregar el departamento. El ID podría estar duplicado.');
        }
    } catch (error) {
        alert(`Error al crear el departamento: ${error.message}`);
    }
}

function actualizarDepartamento(event) {
    event.preventDefault(); // Evitar la recarga de la página

    const id = document.getElementById('edit-id-departamento').value;
    const nuevoNombre = document.getElementById('edit-nombre-departamento').value;

    if (gestorDepartamentos.actualizarDepartamento(id, nuevoNombre)) {
        alert('Departamento actualizado correctamente');
        mostrarDepartamentos(); // Volver a mostrar la lista actualizada
        actualizarSelectDepartamentos();
        actualizarSelectDepartamentosParaGestionMiembros();
        document.querySelector('.tab[data-tab="view-departamentos"]')?.click();
    } else {
        alert('Error al actualizar el departamento');
    }
}

// Esta función se llama desde el botón de la tabla o desde el formulario de edición
function eliminarDepartamentoConfirmado(id) {
    if (confirm('¿Está seguro de que desea eliminar este departamento?')) {
        if (gestorDepartamentos.eliminarDepartamento(id)) {
            alert('Departamento eliminado correctamente');
            mostrarDepartamentos(); // Volver a mostrar la lista actualizada
            actualizarSelectDepartamentos(); // Actualizar los selects de departamentos
            actualizarSelectDepartamentosParaGestionMiembros();
            document.querySelector('.tab[data-tab="view-departamentos"]')?.click();
            if (editDepartamentoForm && document.getElementById('edit-id-departamento').value === id) {
                editDepartamentoForm.reset();
                editDepartamentoForm.style.display = 'none';
            }
        } else {
            alert('Error al eliminar el departamento');
        }
    }
}


function actualizarSelectDepartamentos() {
    // Select para la pestaña de Editar Departamento
    if (!departamentoSelectEditar) return;
    departamentoSelectEditar.innerHTML = '<option value="">Seleccione un departamento...</option>';
    const departamentos = gestorDepartamentos.obtenerTodos();
    departamentos.forEach(departamento => {
        const optionEditar = document.createElement('option');
        optionEditar.value = departamento.getId();
        optionEditar.textContent = `${departamento.getId()} - ${departamento.getNombre()}`;
        departamentoSelectEditar.appendChild(optionEditar);
    });
}

function actualizarSelectDepartamentosParaGestionMiembros() {
    // Select para la pestaña de Gestionar Miembros
    if (!departamentoSelectGestionMiembros) return;
    departamentoSelectGestionMiembros.innerHTML = '<option value="">Seleccione un departamento...</option>';

    const departamentos = gestorDepartamentos.obtenerTodos();

    departamentos.forEach(departamento => {
        // Opciones para el select de Gestionar Miembros
        const optionGestion = document.createElement('option');
        optionGestion.value = departamento.getId();
        optionGestion.textContent = `${departamento.getId()} - ${departamento.getNombre()}`;
        departamentoSelectGestionMiembros.appendChild(optionGestion);
    });
}

function cargarMiembrosDepartamento() {
    if (!departamentoSelectGestionMiembros || !miembrosListElement || !nombreDepartamentoMiembrosSpan || !miembroAEliminarSelect || !miembrosGestionArea) return;

    const departamentoId = departamentoSelectGestionMiembros.value;
    const departamento = gestorDepartamentos.buscarPorId(departamentoId);

    miembrosListElement.innerHTML = ''; // Limpiar la lista de miembros
    miembroAEliminarSelect.innerHTML = '<option value="">Seleccione un miembro a eliminar...</option>'; // Limpiar el select de eliminación

    if (departamento && departamentoId) {
        nombreDepartamentoMiembrosSpan.textContent = departamento.getNombre();
        const miembros = gestorDepartamentos.obtenerMiembrosDeDepartamento(departamentoId);

        if (miembros.length > 0) {
            miembros.forEach(miembro => {
                const listItem = document.createElement('li');
                listItem.textContent = `${miembro.getCodigo()} - ${miembro.getNombreCompleto()}`; // Asumiendo getNombreCompleto()
                miembrosListElement.appendChild(listItem);

                // Agregar opción al select de eliminación
                const optionEliminar = document.createElement('option');
                optionEliminar.value = miembro.getCodigo();
                optionEliminar.textContent = `${miembro.getCodigo()} - ${miembro.getNombreCompleto()}`;
                miembroAEliminarSelect.appendChild(optionEliminar);
            });
        } else {
            const listItem = document.createElement('li');
            listItem.textContent = 'Este departamento no tiene miembros.';
            miembrosListElement.appendChild(listItem);
        }
        miembrosGestionArea.style.display = 'block'; // Mostrar el área de gestión de miembros
    } else {
        nombreDepartamentoMiembrosSpan.textContent = '';
        miembrosGestionArea.style.display = 'none'; // Ocultar el área si no se selecciona departamento
    }
}


function agregarMiembroADepartamento() {
    if (!departamentoSelectGestionMiembros || !personaSelectAgregarMiembroDepartamentos) return;
    const departamentoId = departamentoSelectGestionMiembros.value;
    const personaCodigo = personaSelectAgregarMiembroDepartamentos.value;
    const persona = gestorPersonas.buscarPorCodigo(personaCodigo);
    if (!departamentoId) {
        alert('Por favor, seleccione un departamento.');
        return;
    }

    if (!personaCodigo) {
        alert('Por favor, seleccione una persona para agregar.');
        return;
    }

    if (!persona) {
        alert('No se encontró la persona seleccionada.');
        return;
    }

    if (gestorDepartamentos.agregarMiembroADepartamento(departamentoId, persona)) {
        alert(`Se agregó a ${persona.getNombreCompleto()} al departamento.`);
        cargarMiembrosDepartamento(); // Recargar la lista de miembros
    } else {
        // El mensaje de error específico ya se muestra desde GestorDepartamentos o Departamento
        // alert(`No se pudo agregar a ${persona.getNombreCompleto()} al departamento (posiblemente ya es miembro).`);
    }
}

function eliminarMiembroDeDepartamento() {
    if (!departamentoSelectGestionMiembros || !miembroAEliminarSelect) return;
    const departamentoId = departamentoSelectGestionMiembros.value;
    const miembroCodigo = miembroAEliminarSelect.value;
    if (!departamentoId) {
        alert('Por favor, seleccione un departamento.');
        return;
    }

    if (!miembroCodigo) {
        alert('Por favor, seleccione un miembro para eliminar.');
        return;
    }

    if (gestorDepartamentos.eliminarMiembroDeDepartamento(departamentoId, miembroCodigo)) {
        alert(`Se eliminó al miembro con código ${miembroCodigo} del departamento.`);
        cargarMiembrosDepartamento(); // Recargar la lista de miembros del departamento
        // No es necesario actualizar el select de personas aquí, ya que no cambia quiénes son las personas, solo su pertenencia.
    } else {
        // El mensaje de error específico ya se muestra desde GestorDepartamentos o Departamento
        // alert(`No se pudo eliminar al miembro con código ${miembroCodigo} del departamento.`);
    }
}
function actualizarSelectPersonasParaDepartamentos() {
    if (!personaSelectAgregarMiembroDepartamentos) return;
    personaSelectAgregarMiembroDepartamentos.innerHTML = '<option value="">Seleccione una persona...</option>';
    const personas = gestorPersonas.obtenerTodas();
    personas.forEach(persona => {
        const optionPersona = document.createElement('option');
        optionPersona.value = persona.getCodigo();
        optionPersona.textContent = `${persona.getCodigo()} - ${persona.getNombreCompleto()}`; // Asumiendo que tienes getNombreCompleto() en Persona
        personaSelectAgregarMiembroDepartamentos.appendChild(optionPersona);
    });
}

function cargarDepartamentoParaEditar(id) {
    if (!editDepartamentoForm) return;
    const departamento = gestorDepartamentos.buscarPorId(id);

    if (!departamento) {
        alert('No se encontró el departamento seleccionado');
        if(editDepartamentoForm) editDepartamentoForm.style.display = 'none';
        return;
    }

    if (departamentoSelectEditar) departamentoSelectEditar.value = id;

    // Llenar el formulario de edición
    document.getElementById('edit-id-departamento').value = departamento.getId();
    document.getElementById('edit-nombre-departamento').value = departamento.getNombre();
    if(editDepartamentoForm) editDepartamentoForm.style.display = 'block';
}

function eliminarDepartamentoConfirmado(id) {
    if (confirm('¿Está seguro de que desea eliminar este departamento?')) {
        if (gestorDepartamentos.eliminarDepartamento(id)) {
            alert('Departamento eliminado correctamente');
            mostrarDepartamentos(); // Volver a mostrar la lista actualizada
            actualizarSelectDepartamentos(); // Actualizar los selects de departamentos
            actualizarSelectDepartamentosParaGestionMiembros();
            document.querySelector('.tab[data-tab="view-departamentos"]')?.click();
            if (editDepartamentoForm && document.getElementById('edit-id-departamento').value === id) {
                editDepartamentoForm.reset();
                editDepartamentoForm.style.display = 'none';
            }
        } else {
            alert('Error al eliminar el departamento');
        }
    }
}