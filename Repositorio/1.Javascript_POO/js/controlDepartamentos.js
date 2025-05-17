// Inicializar el gestor de departamentos
const gestorDepartamentos = new GestorDepartamentos();

// Elementos del DOM para departamentos
const departamentosList = document.getElementById('departamentos-list');
const departamentoForm = document.getElementById('departamento-form');
const departamentoSelectEditar = document.getElementById('departamento-select-editar');
const departamentoSelectGestionMiembros = document.getElementById('departamento-select-miembros');
const editDepartamentoForm = document.getElementById('edit-departamento-form');
const miembrosListElement = document.getElementById('miembros-list');
const personaSelectAgregarMiembroDepartamentos = document.getElementById('persona-select-miembros');
const agregarMiembroBtn = document.getElementById('agregar-miembro-btn');
const miembroAEliminarSelect = document.getElementById('miembro-a-eliminar-select');
const eliminarMiembroBtn = document.getElementById('eliminar-miembro-btn');
const deleteDepartamentoBtn = document.getElementById('delete-departamento');

// Mostrar departamentos en la tabla
function mostrarDepartamentos() {
    departamentosList.innerHTML = '';

    const departamentos = gestorDepartamentos.obtenerTodos();

    if (departamentos.length === 0) {
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
                <button class="btn-manage" data-id="${departamento.getId()}">Miembros</button>
            </td>
        `;
        departamentosList.appendChild(row);
    });

    // Eventos para los botones
    document.querySelectorAll('#departamentos-list .btn-edit').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            cargarDepartamentoParaEditar(id);
            document.querySelector('.tab[data-tab="edit-departamento"]')?.click();
        });
    });

    document.querySelectorAll('#departamentos-list .btn-delete').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            eliminarDepartamentoConfirmado(id);
        });
    });

    document.querySelectorAll('#departamentos-list .btn-manage').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            departamentoSelectGestionMiembros.value = id;
            cargarMiembrosDepartamento(id);
            document.querySelector('.tab[data-tab="manage-miembros"]')?.click();
        });
    });
}

// Guardar un nuevo departamento
function guardarDepartamento(event) {
    event.preventDefault();

    const id = document.getElementById('id-departamento').value;
    const nombre = document.getElementById('nombre-departamento').value;

    try {
        const nuevoDepartamento = new Departamento(id, nombre);

        if (gestorDepartamentos.agregarDepartamento(nuevoDepartamento)) {
            alert('Departamento agregado correctamente');
            departamentoForm.reset();
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

// Actualizar selects de departamentos
function actualizarSelectDepartamentos() {
    departamentoSelectEditar.innerHTML = '<option value="">Seleccione un departamento...</option>';
    const departamentos = gestorDepartamentos.obtenerTodos();
    departamentos.forEach(departamento => {
        const option = document.createElement('option');
        option.value = departamento.getId();
        option.textContent = `${departamento.getId()} - ${departamento.getNombre()}`;
        departamentoSelectEditar.appendChild(option);
    });
}

function actualizarSelectDepartamentosParaGestionMiembros() {
    departamentoSelectGestionMiembros.innerHTML = '<option value="">Seleccione un departamento...</option>';
    const departamentos = gestorDepartamentos.obtenerTodos();
    departamentos.forEach(departamento => {
        const option = document.createElement('option');
        option.value = departamento.getId();
        option.textContent = `${departamento.getId()} - ${departamento.getNombre()}`;
        departamentoSelectGestionMiembros.appendChild(option);
    });
}

// Cargar departamento para editar
function cargarDepartamentoParaEditar(id) {
    const departamento = gestorDepartamentos.buscarPorId(id);
    if (!departamento) {
        alert('No se encontró el departamento seleccionado');
        return;
    }
    departamentoSelectEditar.value = id;
    document.getElementById('edit-id-departamento').value = departamento.getId();
    document.getElementById('edit-nombre-departamento').value = departamento.getNombre();
}

// Actualizar departamento
function actualizarDepartamento(event) {
    event.preventDefault();
    const id = document.getElementById('edit-id-departamento').value;
    const nuevoNombre = document.getElementById('edit-nombre-departamento').value;

    if (gestorDepartamentos.actualizarDepartamento(id, nuevoNombre)) {
        alert('Departamento actualizado correctamente');
        mostrarDepartamentos();
        actualizarSelectDepartamentos();
        actualizarSelectDepartamentosParaGestionMiembros();
        document.querySelector('.tab[data-tab="view-departamentos"]')?.click();
    } else {
        alert('No se pudo actualizar el departamento');
    }
}

// Eliminar departamento
function eliminarDepartamentoConfirmado(id) {
    if (confirm('¿Está seguro de que desea eliminar este departamento?')) {
        if (gestorDepartamentos.eliminarDepartamento(id)) {
            alert('Departamento eliminado correctamente');
            mostrarDepartamentos();
            actualizarSelectDepartamentos();
            actualizarSelectDepartamentosParaGestionMiembros();
        } else {
            alert('Error: No se pudo eliminar el departamento');
        }
    }
}

// Cargar miembros de un departamento
function cargarMiembrosDepartamento(id) {
    const miembros = gestorDepartamentos.obtenerMiembrosDeDepartamento(id);
    miembrosListElement.innerHTML = '';
    if (miembros.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="3" class="empty-message">No hay miembros registrados</td>';
        miembrosListElement.appendChild(row);
    } else {
        miembros.forEach(persona => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${persona.getCodigo()}</td>
                <td>${persona.getNombreCompleto()}</td>
                <td>
                    <button class="btn-remove-miembro" data-codigo="${persona.getCodigo()}">Eliminar</button>
                </td>
            `;
            miembrosListElement.appendChild(row);
        });
    }
    // Eventos para eliminar miembro
    document.querySelectorAll('.btn-remove-miembro').forEach(btn => {
        btn.addEventListener('click', () => {
            const personaCodigo = btn.getAttribute('data-codigo');
            eliminarMiembroDeDepartamento(id, personaCodigo);
        });
    });
    // Actualizar select de personas disponibles
    actualizarSelectPersonasParaDepartamentos(id);
}

// Actualizar select de personas disponibles para agregar como miembros
function actualizarSelectPersonasParaDepartamentos(departamentoId) {
    personaSelectAgregarMiembroDepartamentos.innerHTML = '<option value="">Seleccione una persona...</option>';
    const todasLasPersonas = gestorPersonas.obtenerTodas();
    const miembrosActuales = gestorDepartamentos.obtenerMiembrosDeDepartamento(departamentoId).map(p => p.getCodigo());
    const personasDisponibles = todasLasPersonas.filter(persona =>
        !miembrosActuales.includes(persona.getCodigo())
    );
    personasDisponibles.forEach(persona => {
        const option = document.createElement('option');
        option.value = persona.getCodigo();
        option.textContent = `${persona.getCodigo()} - ${persona.getNombreCompleto()}`;
        personaSelectAgregarMiembroDepartamentos.appendChild(option);
    });
}

// Agregar miembro a departamento
function agregarMiembroADepartamento(event) {
    event.preventDefault();
    const departamentoId = departamentoSelectGestionMiembros.value;
    const personaCodigo = personaSelectAgregarMiembroDepartamentos.value;
    const persona = gestorPersonas.buscarPorCodigo(personaCodigo);

    if (!departamentoId || !persona) {
        alert('Seleccione un departamento y una persona válida');
        return;
    }

    if (gestorDepartamentos.agregarMiembroADepartamento(departamentoId, persona)) {
        alert('Miembro agregado correctamente');
        cargarMiembrosDepartamento(departamentoId);
        mostrarDepartamentos();
    } else {
        alert('Error: No se pudo agregar el miembro');
    }
}

// Eliminar miembro de departamento
function eliminarMiembroDeDepartamento(departamentoId, personaCodigo) {
    if (confirm('¿Está seguro de que desea eliminar este miembro del departamento?')) {
        if (gestorDepartamentos.eliminarMiembroDeDepartamento(departamentoId, personaCodigo)) {
            alert('Miembro eliminado correctamente');
            cargarMiembrosDepartamento(departamentoId);
            mostrarDepartamentos();
        } else {
            alert('Error: No se pudo eliminar el miembro');
        }
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    mostrarDepartamentos();

    if (departamentoForm) departamentoForm.addEventListener('submit', guardarDepartamento);
    if (departamentoSelectEditar) departamentoSelectEditar.addEventListener('change', () => {
        const id = departamentoSelectEditar.value;
        if (id) {
            cargarDepartamentoParaEditar(id);
        } else {
            editDepartamentoForm.reset();
        }
    });
    if (editDepartamentoForm) editDepartamentoForm.addEventListener('submit', actualizarDepartamento);
    if (deleteDepartamentoBtn) deleteDepartamentoBtn.addEventListener('click', () => {
        const id = document.getElementById('edit-id-departamento').value;
        if (id) {
            eliminarDepartamentoConfirmado(id);
        }
    });
    if (departamentoSelectGestionMiembros) departamentoSelectGestionMiembros.addEventListener('change', () => {
        const id = departamentoSelectGestionMiembros.value;
        if (id) {
            cargarMiembrosDepartamento(id);
        }
    });
    if (agregarMiembroBtn) agregarMiembroBtn.addEventListener('click', agregarMiembroADepartamento);
    if (eliminarMiembroBtn) eliminarMiembroBtn.addEventListener('click', () => {
        const departamentoId = departamentoSelectGestionMiembros.value;
        const personaCodigo = miembroAEliminarSelect.value;
        if (departamentoId && personaCodigo) {
            eliminarMiembroDeDepartamento(departamentoId, personaCodigo);
        }
    });

    // Inicializar selects
    actualizarSelectDepartamentos();
    actualizarSelectDepartamentosParaGestionMiembros();
});