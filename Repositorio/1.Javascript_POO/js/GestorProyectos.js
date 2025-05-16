class GestorDepartamentos {
    #departamentos;

    constructor() {
        this.#departamentos = this.cargarDesdeLocalStorage();
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

    obtenerTodos() {
        return [...this.#departamentos];
    }

    buscarPorId(id) {
        return this.#departamentos.find(departamento => departamento.getId() === id) || null;
    }

    actualizarDepartamento(id, nuevoNombre) {
        const departamento = this.buscarPorId(id);
        if (!departamento) {
            console.error("Error: Departamento no encontrado.");
            return false;
        }

        departamento.setNombre(nuevoNombre);
        this.guardarEnLocalStorage();
        return true;
    }

    eliminarDepartamento(id) {
        const indice = this.#departamentos.findIndex(departamento => departamento.getId() === id);
        if (indice === -1) {
            console.error("Error: Departamento no encontrado.");
            return false;
        }

        this.#departamentos.splice(indice, 1);
        this.guardarEnLocalStorage();
        return true;
    }

    guardarEnLocalStorage() {
        localStorage.setItem("departamentos", JSON.stringify(this.#departamentos.map(d => ({
            id: d.getId(),
            nombre: d.getNombre()
            // No guardamos los miembros aquí; la relación se gestiona a través de Persona
        }))));
    }

    cargarDesdeLocalStorage() {
        const datos = localStorage.getItem("departamentos");
        if (datos) {
            try {
                const departamentosParseados = JSON.parse(datos);
                return departamentosParseados.map(d => new Departamento(d.id, d.nombre));
            } catch (error) {
                console.error("Error al cargar departamentos desde localStorage:", error);
                return [];
            }
        }
        return [];
    }

    agregarMiembroADepartamento(departamentoId, persona) {
        const departamento = this.buscarPorId(departamentoId);
        if (!departamento) {
            console.error(`Error: Departamento con ID ${departamentoId} no encontrado.`);
            return false;
        }
        return departamento.agregarMiembro(persona);
    }

    eliminarMiembroDeDepartamento(departamentoId, personaCodigo) {
        const departamento = this.buscarPorId(departamentoId);
        if (!departamento) {
            console.error(`Error: Departamento con ID ${departamentoId} no encontrado.`);
            return false;
        }
        return departamento.eliminarMiembro(personaCodigo);
    }

    obtenerMiembrosDeDepartamento(departamentoId) {
        const departamento = this.buscarPorId(departamentoId);
        if (!departamento) {
            console.error(`Error: Departamento con ID ${departamentoId} no encontrado.`);
            return [];
        }
        return departamento.getMiembros();
    }
}