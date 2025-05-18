// Clase GestorDepartamentos - Para manejar colecciones de departamentos
class GestorDepartamentos {
    #departamentos;

    constructor() {
        this.#departamentos = [];
        this.cargarDeLocalStorage();
    }

    agregarDepartamento(departamento) {
        if (!(departamento instanceof Departamento)) return false;
        if (this.#departamentos.some(d => d.getId() === departamento.getId())) return false;
        this.#departamentos.push(departamento);
        this.guardarEnLocalStorage();
        return true;
    }

    obtenerTodos() {
        return [...this.#departamentos];
    }

    buscarPorId(id) {
        return this.#departamentos.find(d => d.getId() === id) || null;
    }

    actualizarDepartamento(id, nuevoNombre) {
        const dep = this.buscarPorId(id);
        if (!dep) return false;
        dep.setNombre(nuevoNombre);
        this.guardarEnLocalStorage();
        return true;
    }

    eliminarDepartamento(id) {
        const idx = this.#departamentos.findIndex(d => d.getId() === id);
        if (idx === -1) return false;
        this.#departamentos.splice(idx, 1);
        this.guardarEnLocalStorage();
        return true;
    }

    agregarMiembroADepartamento(id, persona) {
        const dep = this.buscarPorId(id);
        if (!dep) return false;
        const ok = dep.agregarMiembro(persona);
        if (ok) this.guardarEnLocalStorage();
        return ok;
    }

    eliminarMiembroDeDepartamento(id, codigoPersona) {
        const dep = this.buscarPorId(id);
        if (!dep) return false;
        const ok = dep.eliminarMiembro(codigoPersona);
        if (ok) this.guardarEnLocalStorage();
        return ok;
    }

    obtenerMiembrosDeDepartamento(id) {
        const dep = this.buscarPorId(id);
        return dep ? dep.getMiembros() : [];
    }

    guardarEnLocalStorage() {
        const data = this.#departamentos.map(dep => ({
            id: dep.getId(),
            nombre: dep.getNombre(),
            miembros: dep.getMiembros().map(m => m.getCodigo())
        }));
        localStorage.setItem('departamentos', JSON.stringify(data));
    }

    cargarDeLocalStorage() {
        const data = JSON.parse(localStorage.getItem('departamentos') || '[]');
        this.#departamentos = data.map(depData => {
            const dep = new Departamento(depData.id, depData.nombre);
            // Los miembros deben ser restaurados externamente según tu modelo de Persona
            return dep;
        });
    }
}