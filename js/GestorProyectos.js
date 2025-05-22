document.addEventListener('DOMContentLoaded', () => {
   
    gestorProyectos.cargarDesdeLocalStorage();
    mostrarProyectos();

  
    document.getElementById('proyecto-form').addEventListener('submit', (event) => {
        event.preventDefault();
        const id = document.getElementById('proyecto-id').value;
        const nombre = document.getElementById('proyecto-nombre').value;
        const fechaInicio = new Date(document.getElementById('proyecto-fecha-inicio').value);
        const fechaFin = document.getElementById('proyecto-fecha-fin').value ? new Date(document.getElementById('proyecto-fecha-fin').value) : null;

        const nuevoProyecto = new Proyecto(id, nombre, fechaInicio, fechaFin);
        if (gestorProyectos.agregarProyecto(nuevoProyecto)) {
            alert('Proyecto agregado correctamente');
            gestorProyectos.guardarEnLocalStorage();
            mostrarProyectos();
        } else {
            alert('Error: No se pudo agregar el proyecto. El ID podría estar duplicado.');
        }
    });

    document.getElementById('edit-proyecto-form').addEventListener('submit', (event) => {
        event.preventDefault();
        const id = document.getElementById('edit-proyecto-id').value;
        const proyecto = gestorProyectos.buscarPorId(id);
        if (proyecto) {
            proyecto.setNombre(document.getElementById('edit-proyecto-nombre').value);
            proyecto.setFechaInicio(new Date(document.getElementById('edit-proyecto-fecha-inicio').value));
            proyecto.setFechaFin(document.getElementById('edit-proyecto-fecha-fin').value ? new Date(document.getElementById('edit-proyecto-fecha-fin').value) : null);
            alert('Proyecto actualizado correctamente');
            gestorProyectos.guardarEnLocalStorage();
            mostrarProyectos();
        } else {
            alert('Error: Proyecto no encontrado.');
        }
    });


    document.getElementById('delete-proyecto').addEventListener('click', () => {
        const id = document.getElementById('edit-proyecto-id').value;
        if (gestorProyectos.eliminarProyecto(id)) {
            alert('Proyecto eliminado correctamente');
            gestorProyectos.guardarEnLocalStorage();
            mostrarProyectos();
        } else {
            alert('Error: No se pudo eliminar el proyecto.');
        }
    });
});

function mostrarProyectos() {   
    const proyectos = gestorProyectos.listarProyectos();
    const listaProyectos = document.getElementById('lista-proyectos');
    listaProyectos.innerHTML = ''; 
    proyectos.forEach(proyecto => {
        const li = document.createElement('li');
        li.textContent = `ID: ${proyecto.getId()}, Nombre: ${proyecto.getNombre()}, Fecha Inicio: ${proyecto.getFechaInicio().toLocaleDateString()}, Fecha Fin: ${proyecto.getFechaFin() ? proyecto.getFechaFin().toLocaleDateString() : 'N/A'}`;
        li.addEventListener('click', () => {
            document.getElementById('edit-proyecto-id').value = proyecto.getId();
            document.getElementById('edit-proyecto-nombre').value = proyecto.getNombre();
            document.getElementById('edit-proyecto-fecha-inicio').value = proyecto.getFechaInicio().toISOString().split('T')[0];
            document.getElementById('edit-proyecto-fecha-fin').value = proyecto.getFechaFin() ? proyecto.getFechaFin().toISOString().split('T')[0] : '';
        });
        listaProyectos.appendChild(li);
    });
}
