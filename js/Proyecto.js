class Proyecto {
    #id;
    #nombre;
    #fechaInicio;
    #fechaFin;

    constructor(id, nombre, fechaInicio, fechaFin = null) {
        this.#id = id;
        this.#nombre = nombre;
        this.#fechaInicio = fechaInicio instanceof Date ? fechaInicio : new Date(fechaInicio);
        this.#fechaFin = fechaFin instanceof Date || fechaFin === null ? fechaFin : new Date(fechaFin);
    }

    getId() {
        return this.#id;
    }

    getNombre() {
        return this.#nombre;
    }

    setNombre(nombre) {
        this.#nombre = nombre;
    }

    getFechaInicio() {
        return this.#fechaInicio;
    }

    setFechaInicio(fechaInicio) {
        this.#fechaInicio = fechaInicio instanceof Date ? fechaInicio : new Date(fechaInicio);
    }

    getFechaFin() {
        return this.#fechaFin;
    }

    setFechaFin(fechaFin) {
        if (fechaFin === null) {
            this.#fechaFin = null;
        } else {
            this.#fechaFin = fechaFin instanceof Date ? fechaFin : new Date(fechaFin);
        }
    }

    // This method allows JSON.stringify() to serialize the instance correctly
    toJSON() {
        return {
            id: this.#id,
            nombre: this.#nombre,
            fechaInicio: this.#fechaInicio?.toISOString() ?? null,
            fechaFin: this.#fechaFin?.toISOString() ?? null
        };
    }
}
