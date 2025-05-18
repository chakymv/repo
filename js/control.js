// Gestores (se instanciarán en DOMContentLoaded)
let gestorPersonas;
let gestorProyectos;
let gestorDepartamentos; // Asegúrate que GestorDepartamentos esté definido globalmente o importado si usas módulos

// Función genérica para configurar todas las pestañas de la página
function setupTabs() {
    const allTabButtons = document.querySelectorAll('.tab[data-tab]');

    allTabButtons.forEach(tabButton => {
        tabButton.addEventListener('click', () => {
            const tabGroupContainer = tabButton.closest('.tabs, .departamentos-tabs, .proyectos-tabs');
            const targetContentId = tabButton.dataset.tab;
            const targetContent = document.getElementById(targetContentId);

            if (tabGroupContainer) {
                tabGroupContainer.querySelectorAll('.tab').forEach(t => {
                    t.classList.remove('active');
                });
            } else {
                // Fallback: si no hay un contenedor de grupo claro, desactivar todas las pestañas en la página
                document.querySelectorAll('.tab[data-tab]').forEach(t => t.classList.remove('active'));
            }

            tabButton.classList.add('active');

            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });

            if (targetContent) {
                targetContent.classList.add('active');

                // Lógica específica post-cambio de pestaña (ej. actualizar selects)
                if (targetContentId === 'edit-persona' && typeof actualizarSelectPersonas === 'function') {
                    actualizarSelectPersonas();
                } else if (targetContentId === 'edit-proyecto' && typeof actualizarSelectProyectos === 'function') {
                    actualizarSelectProyectos();
                } else if (targetContentId === 'edit-departamento' && typeof actualizarSelectDepartamentos === 'function') {
                    actualizarSelectDepartamentos();
                } else if (targetContentId === 'manage-miembros') {
                    if (typeof actualizarSelectDepartamentosParaGestionMiembros === 'function') { // Necesitarás esta función en Departamento.js
                        actualizarSelectDepartamentosParaGestionMiembros();
                    }
                    if (typeof actualizarSelectPersonasParaDepartamentos === 'function') {
                        actualizarSelectPersonasParaDepartamentos();
                    }
                }
            }
        });
    });

    // Opcional: Activar la primera pestaña de cada grupo si el HTML no lo hace.
    const tabContainers = document.querySelectorAll('.tabs, .departamentos-tabs, .proyectos-tabs');
    tabContainers.forEach(container => {
        const firstTabInGroup = container.querySelector('.tab[data-tab]');
        const isActiveTabPresentInGroup = container.querySelector('.tab[data-tab].active');
        if (firstTabInGroup && !isActiveTabPresentInGroup) {
            // firstTabInGroup.click(); // Descomentar si se desea activar la primera pestaña automáticamente
        }
    });
}

// --- Lógica para Personas ---
let personasList, personaForm, personaSelect, editPersonaForm;

function mostrarPersonas() {
    if (!personasList) return; // Salir si el elemento no existe en la página actual
    personasList.innerHTML = '';
    const personas = gestorPersonas.obtenerTodas();
    if (personas.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="7" class="empty-message">No hay personas registradas</td>';
        personasList.appendChild(row);
        return;
    }
    personas.forEach(persona => {
        const row = document.createElement('tr');
        const fechaNac = persona.getFechaNacimiento();
        const fechaFormateada = fechaNac instanceof Date && !isNaN(fechaNac) ?
            `${fechaNac.getDate()}/${fechaNac.getMonth() + 1}/${fechaNac.getFullYear()}` :
            'Fecha inválida';
        row.innerHTML = `
            <td>${persona.getCodigo()}</td>
            <td>${persona.getNombre()}</td>
            <td>${persona.getApellido()}</td>
            <td>${fechaFormateada}</td>
            <td>${persona.getGenero()}</td>
            <td>${persona.getCargo()}</td>
            <td>
                <button class="btn-edit" data-codigo="${persona.getCodigo()}">Editar</button>
                <button class="btn-delete" data-codigo="${persona.getCodigo()}">Eliminar</button>
            </td>
        `;
        personasList.appendChild(row);
    });

    personasList.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => {
            const codigo = btn.getAttribute('data-codigo');
            cargarPersonaParaEditar(codigo);
            const editPersonaTab = document.querySelector('.tab[data-tab="edit-persona"]');
            if (editPersonaTab) {
                editPersonaTab.click();
            }
        });
    });

    personasList.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => {
            const codigo = btn.getAttribute('data-codigo');
            if (confirm('¿Está seguro de que desea eliminar esta persona?')) {
                if (gestorPersonas.eliminarPersona(codigo)) {
                    alert('Persona eliminada correctamente');
                    mostrarPersonas();
                    if (typeof actualizarSelectPersonas === 'function') actualizarSelectPersonas();
                }
            }
        });
    });
}

// Función para guardar una nueva persona
function guardarPersona(event) {
    event.preventDefault();

    const codigo = document.getElementById('codigo').value;
    const nombre = document.getElementById('nombre').value;
    const apellido = document.getElementById('apellido').value;
    const fechaNacimiento = new Date(document.getElementById('fechaNacimiento').value);
    const genero = document.getElementById('genero').value;
    const cargo = document.getElementById('cargo').value;
    
    if (!codigo || !nombre || !apellido || !fechaNacimiento || !genero || !cargo) {
        alert("Por favor, complete todos los campos requeridos.");
        return;
    }

    try {
        const nuevaPersona = new Persona(codigo, nombre, apellido, fechaNacimiento, genero, cargo);
        if (gestorPersonas.agregarPersona(nuevaPersona)) {
            alert('Persona agregada correctamente');
            personaForm.reset();
            mostrarPersonas();
            document.querySelector('.tab[data-tab="view-personas"]')?.click();
        } else {
            alert('Error: No se pudo agregar la persona. El código podría estar duplicado.');
        }
    } catch (error) {
        alert(`Error al crear la persona: ${error.message}`);
    }
}

// Función para actualizar el select de personas en la pestaña de edición
function actualizarSelectPersonas() {
    if (!personaSelect) return;
    personaSelect.innerHTML = '<option value="">Seleccione una persona...</option>';
    const personas = gestorPersonas.obtenerTodas();
    personas.forEach(persona => {
        const option = document.createElement('option');
        option.value = persona.getCodigo();
        option.textContent = `${persona.getCodigo()} - ${persona.getNombreCompleto()}`;
        personaSelect.appendChild(option);
    });
}

// Función para cargar los datos de una persona en el formulario de edición
function cargarPersonaParaEditar(codigo) {
    if (!editPersonaForm) return;
    const persona = gestorPersonas.buscarPorCodigo(codigo);
    if (!persona) {
        alert('No se encontró la persona seleccionada');
        return;
    }
    if (personaSelect) personaSelect.value = codigo;

    document.getElementById('edit-codigo').value = persona.getCodigo();
    document.getElementById('edit-nombre').value = persona.getNombre();
    document.getElementById('edit-apellido').value = persona.getApellido();
    const fechaNac = persona.getFechaNacimiento();
    const fechaFormateada = fechaNac instanceof Date && !isNaN(fechaNac) ?
        fechaNac.toISOString().split('T')[0] : '';
    document.getElementById('edit-fechaNacimiento').value = fechaFormateada;
    document.getElementById('edit-genero').value = persona.getGenero();
    document.getElementById('edit-cargo').value = persona.getCargo();
    editPersonaForm.style.display = 'block';
}

// Función para actualizar una persona
function actualizarPersona(event) {
    event.preventDefault();
    const codigo = document.getElementById('edit-codigo').value;
    const persona = gestorPersonas.buscarPorCodigo(codigo);
    if (!persona) {
        alert('No se encontró la persona seleccionada');
        return;
    }
    persona.setNombre(document.getElementById('edit-nombre').value);
    persona.setApellido(document.getElementById('edit-apellido').value);
    persona.setFechaNacimiento(new Date(document.getElementById('edit-fechaNacimiento').value));
    persona.setGenero(document.getElementById('edit-genero').value);
    persona.setCargo(document.getElementById('edit-cargo').value);
    alert('Persona actualizada correctamente');
    mostrarPersonas();
    document.querySelector('.tab[data-tab="view-personas"]')?.click();
}

// Función para eliminar una persona
function eliminarPersona(codigo) {
    if (confirm('¿Está seguro de que desea eliminar esta persona?')) {
        if (gestorPersonas.eliminarPersona(codigo)) {
            alert('Persona eliminada correctamente');
            mostrarPersonas();
            actualizarSelectPersonas();
            if (editPersonaForm) editPersonaForm.reset();
        } else {
            alert('Error: No se pudo eliminar la persona');
        }
    }
}

function inicializarGestionPersonas() {
    personasList = document.getElementById('personas-list');
    personaForm = document.getElementById('persona-form');
    personaSelect = document.getElementById('persona-select'); // Usado en la pestaña de edición de personas
    editPersonaForm = document.getElementById('edit-persona-form');

    if (personaForm) {
        personaForm.addEventListener('submit', guardarPersona);
    }

    if (personaSelect) {
        personaSelect.addEventListener('change', () => {
            const codigo = personaSelect.value;
            if (codigo) {
                cargarPersonaParaEditar(codigo);
            } else {
                if (editPersonaForm) {
                    editPersonaForm.reset();
                    editPersonaForm.style.display = 'none';
                }
            }
        });
    }

    if (editPersonaForm) {
        editPersonaForm.addEventListener('submit', actualizarPersona);
        const deleteBtn = editPersonaForm.querySelector('#delete-persona');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                const codigo = document.getElementById('edit-codigo').value;
                if (codigo) {
                    eliminarPersona(codigo);
                }
            });
        }
    }
    mostrarPersonas(); // Mostrar personas al cargar la página si la lista existe
}

// --- Lógica para Proyectos ---
let proyectosList, proyectoForm, proyectoSelect, editProyectoForm;

function mostrarProyectos() {
    if (!proyectosList) return;
    proyectosList.innerHTML = "";
    const proyectos = gestorProyectos.obtenerTodos();
    if (proyectos.length === 0) {
        const row = document.createElement("tr");
        row.innerHTML = '<td colspan="6" class="empty-message">No hay proyectos registrados</td>';
        proyectosList.appendChild(row);
        return;
    }
    proyectos.forEach((proyecto) => {
        const row = document.createElement("tr");
        const fechaInicio = proyecto.getFechaInicio();
        const fechaFin = proyecto.getFechaFin();
        const fechaInicioFormat = fechaInicio instanceof Date && !isNaN(fechaInicio)
            ? fechaInicio.toISOString().split("T")[0]
            : "N/A";
        const fechaFinFormat = fechaFin instanceof Date && !isNaN(fechaFin)
            ? fechaFin.toISOString().split("T")[0]
            : "N/A";
        row.innerHTML = `
            <td>${proyecto.getId()}</td>
            <td>${proyecto.getNombre()}</td>
            <td>${fechaInicioFormat}</td>
            <td>${fechaFinFormat}</td>
            <td>${proyecto.contarParticipantes()} participantes</td>
            <td>
                <button class="btn-edit" data-id="${proyecto.getId()}">Editar</button>
                <button class="btn-delete" data-id="${proyecto.getId()}">Eliminar</button>
            </td>
        `;
        proyectosList.appendChild(row);
    });

    proyectosList.querySelectorAll(".btn-edit").forEach((btn) => {
        btn.addEventListener("click", () => {
            const id = btn.getAttribute("data-id");
            cargarProyectoParaEditar(id);
            document.querySelector('.tab[data-tab="edit-proyecto"]')?.click();
        });
    });

    proyectosList.querySelectorAll(".btn-delete").forEach((btn) => {
        btn.addEventListener("click", () => {
            const id = btn.getAttribute("data-id");
            eliminarProyecto(id); // La confirmación está dentro de eliminarProyecto
        });
    });
}

function guardarProyecto(event) {
    event.preventDefault();
    const id = document.getElementById("id").value; // Asume que el id es 'id' en el form de crear proyecto
    const nombre = document.getElementById("nombre").value; // Asume que el id es 'nombre'
    const fechaInicioInput = document.getElementById("fechaInicio").value; // Asume id 'fechaInicio'
    const fechaFinInput = document.getElementById("fechaFin").value; // Asume id 'fechaFin'

    if (!id || !nombre || !fechaInicioInput) {
        alert("Por favor, complete ID, Nombre y Fecha de Inicio.");
        return;
    }

    const fechaInicio = new Date(fechaInicioInput);
    const fechaFin = fechaFinInput ? new Date(fechaFinInput) : null;

    try {
        const nuevoProyecto = new Proyecto(id, nombre, fechaInicio, fechaFin);
        if (gestorProyectos.agregarProyecto(nuevoProyecto)) {
            alert("Proyecto agregado correctamente");
            proyectoForm.reset();
            mostrarProyectos();
            gestorProyectos.guardarEnLocalStorage(); // Guardar después de agregar
            document.querySelector('.tab[data-tab="view-proyectos"]')?.click();
        } else {
            alert("Error: El ID del proyecto ya existe.");
        }
    } catch (error) {
        alert(`Error al crear el proyecto: ${error.message}`);
    }
}

function actualizarSelectProyectos() {
    if (!proyectoSelect) return;
    proyectoSelect.innerHTML = '<option value="">Seleccione un proyecto...</option>';
    const proyectos = gestorProyectos.obtenerTodos();
    proyectos.forEach((proyecto) => {
        const option = document.createElement("option");
        option.value = proyecto.getId();
        option.textContent = `${proyecto.getId()} - ${proyecto.getNombre()}`;
        proyectoSelect.appendChild(option);
    });
}

function cargarProyectoParaEditar(id) {
    if (!editProyectoForm) return;
    const proyecto = gestorProyectos.buscarPorId(id);
    if (!proyecto) {
        alert("No se encontró el proyecto seleccionado");
        return;
    }
    if (proyectoSelect) proyectoSelect.value = id;
    document.getElementById("edit-id").value = proyecto.getId();
    document.getElementById("edit-nombre").value = proyecto.getNombre();
    const fechaInicio = proyecto.getFechaInicio();
    document.getElementById("edit-fechaInicio").value = fechaInicio instanceof Date && !isNaN(fechaInicio)
        ? fechaInicio.toISOString().split("T")[0]
        : "";
    const fechaFin = proyecto.getFechaFin();
    document.getElementById("edit-fechaFin").value = fechaFin instanceof Date && !isNaN(fechaFin)
        ? fechaFin.toISOString().split("T")[0]
        : "";
    editProyectoForm.style.display = 'block';
}

function actualizarProyecto(event) {
    event.preventDefault();
    const id = document.getElementById("edit-id").value;
    const proyecto = gestorProyectos.buscarPorId(id);
    if (!proyecto) {
        alert("No se encontró el proyecto seleccionado");
        return;
    }
    proyecto.setNombre(document.getElementById("edit-nombre").value);
    const fechaInicioVal = document.getElementById("edit-fechaInicio").value;
    if (fechaInicioVal) proyecto.setFechaInicio(new Date(fechaInicioVal));
    const fechaFinVal = document.getElementById("edit-fechaFin").value;
    proyecto.setFechaFin(fechaFinVal ? new Date(fechaFinVal) : null);

    if (gestorProyectos.actualizarProyecto(proyecto.getId(), proyecto.getNombre(), proyecto.getFechaInicio(), proyecto.getFechaFin())) {
        alert("Proyecto actualizado correctamente");
        mostrarProyectos();
        gestorProyectos.guardarEnLocalStorage(); // Guardar después de actualizar
        document.querySelector('.tab[data-tab="view-proyectos"]')?.click();
    } else {
        alert("Error al actualizar el proyecto."); // Esto no debería pasar si buscarPorId funcionó
    }
}

function eliminarProyecto(id) {
    if (confirm("¿Está seguro de que desea eliminar este proyecto?")) {
        if (gestorProyectos.eliminarProyecto(id)) {
            alert("Proyecto eliminado correctamente");
            mostrarProyectos();
            actualizarSelectProyectos();
            gestorProyectos.guardarEnLocalStorage(); // Guardar después de eliminar
            if (editProyectoForm) {
                 editProyectoForm.reset();
                 editProyectoForm.style.display = 'none';
            }
        } else {
            alert("Error: No se pudo eliminar el proyecto");
        }
    }
}

function inicializarGestionProyectos() {
    proyectosList = document.getElementById("proyectos-list");
    proyectoForm = document.getElementById("proyecto-form");
    proyectoSelect = document.getElementById("proyecto-select-editar"); // ID actualizado para evitar colisión
    editProyectoForm = document.getElementById("edit-proyecto-form");

    if (proyectoForm) {
        proyectoForm.addEventListener("submit", guardarProyecto);
    }

    if (proyectoSelect) {
        proyectoSelect.addEventListener("change", () => {
            const id = proyectoSelect.value;
            if (id) {
                cargarProyectoParaEditar(id);
            } else {
                if (editProyectoForm) {
                    editProyectoForm.reset();
                    editProyectoForm.style.display = 'none';
                }
            }
        });
    }

    if (editProyectoForm) {
        editProyectoForm.addEventListener("submit", actualizarProyecto);
        const deleteBtn = editProyectoForm.querySelector("#delete-proyecto");
        if (deleteBtn) {
            deleteBtn.addEventListener("click", () => {
                const id = document.getElementById("edit-id").value;
                if (id) {
                    eliminarProyecto(id);
                }
            });
        }
    }
    if (gestorProyectos) { // Solo si el gestor está disponible
      gestorProyectos.cargarDesdeLocalStorage(); // Cargar proyectos al inicio
      mostrarProyectos();
    }
}

// --- Inicialización General ---
document.addEventListener('DOMContentLoaded', () => {
    // Instanciar Gestores
    gestorPersonas = new GestorPersonas();
    gestorProyectos = new GestorProyectos();
    gestorDepartamentos = new GestorDepartamentos(); // Asegúrate que la clase GestorDepartamentos esté definida y accesible

    // Configurar Pestañas
    setupTabs();

    // Inicializar módulos si sus funciones existen
    if (typeof inicializarGestionPersonas === 'function') {
        inicializarGestionPersonas();
        // Datos de ejemplo para personas (opcional, solo para pruebas)
        if (gestorPersonas.obtenerTodas().length === 0) { // Solo agregar si está vacío
            gestorPersonas.agregarPersona(new Persona('P001', 'Bryan', 'Ibarra', new Date('1990-05-15'), 'Masculino', 'Desarrollador'));
            gestorPersonas.agregarPersona(new Persona('P002', 'Gustav', 'Hooker', new Date('1985-10-20'), 'Masculino', 'Diseñador'));
            mostrarPersonas();
        }
    }
    if (typeof inicializarGestionProyectos === 'function') {
        inicializarGestionProyectos();
    }
    if (typeof inicializarGestionDepartamentos === 'function') { // Esta función debe estar en Departamento.js
        inicializarGestionDepartamentos();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    setupTabs();
    inicializarGestionDepartamentos(); // Esta función en Departamento.js utilizará gestorDepartamentos
    inicializarGestionPersonas(); // Si tienes una función de inicialización para personas
});

