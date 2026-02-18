import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const AddContact = () => {
  const { id } = useParams();
  const navegar = useNavigate();
  const { store, acciones } = useGlobalReducer();
  const esModoEditar = Boolean(id);

  const [datosFormulario, setDatosFormulario] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [cargandoFormulario, setCargandoFormulario] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState("");

  useEffect(() => {
    const cargarContactoEditar = async () => {
      if (!esModoEditar) return;

      let listaActual = store.listaContactos;
      if (listaActual.length === 0) {
        listaActual = await acciones.obtenerContactos();
      }

      const contactoEncontrado = listaActual.find(
        (itemContacto) => String(itemContacto.id) === String(id)
      );

      if (!contactoEncontrado) {
        setErrorFormulario("No se encontró el contacto para editar.");
        return;
      }

      setDatosFormulario({
        full_name: contactoEncontrado.full_name || "",
        email: contactoEncontrado.email || "",
        phone: contactoEncontrado.phone || "",
        address: contactoEncontrado.address || "",
      });
    };

    cargarContactoEditar();
  }, [acciones, esModoEditar, id, store.listaContactos]);

  const alCambiarInput = (evento) => {
    const { name, value } = evento.target;
    setDatosFormulario((valorAnterior) => ({
      ...valorAnterior,
      [name]: value,
    }));
  };

  const alEnviarFormulario = async (evento) => {
    evento.preventDefault();
    setCargandoFormulario(true);
    setErrorFormulario("");

    let guardadoOk = false;
    if (esModoEditar) {
      guardadoOk = await acciones.actualizarContacto(id, datosFormulario);
    } else {
      guardadoOk = await acciones.crearContacto(datosFormulario);
    }

    setCargandoFormulario(false);

    if (!guardadoOk) {
      setErrorFormulario("No se pudo guardar el contacto.");
      return;
    }

    navegar("/");
  };

  return (
    <div className="container">
      <section className="mx-auto" style={{ maxWidth: "760px" }}>
        <div className="mb-4">
          <p className="text-uppercase small fw-semibold mb-2">
            {esModoEditar ? "Actualizar" : "Crear"}
          </p>
          <h1 className="display-6 fw-bold mb-0">
            {esModoEditar ? "Editar contacto" : "Agregar contacto"}
          </h1>
        </div>

        <form className="card border-0 shadow-sm rounded-4 p-3 p-md-4" onSubmit={alEnviarFormulario}>
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label">Nombre completo</label>
              <input
                className="form-control form-control-lg"
                type="text"
                name="full_name"
                value={datosFormulario.full_name}
                onChange={alCambiarInput}
                required
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label">Email</label>
              <input
                className="form-control form-control-lg"
                type="email"
                name="email"
                value={datosFormulario.email}
                onChange={alCambiarInput}
                required
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label">Teléfono</label>
              <input
                className="form-control form-control-lg"
                type="text"
                name="phone"
                value={datosFormulario.phone}
                onChange={alCambiarInput}
                required
              />
            </div>

            <div className="col-12">
              <label className="form-label">Dirección</label>
              <input
                className="form-control form-control-lg"
                type="text"
                name="address"
                value={datosFormulario.address}
                onChange={alCambiarInput}
                required
              />
            </div>
          </div>

          {errorFormulario && <p className="text-danger mt-3 mb-0">{errorFormulario}</p>}

          <div className="d-flex flex-column flex-sm-row gap-2 mt-4">
            <button className="btn btn-primary px-4" type="submit" disabled={cargandoFormulario}>
              {cargandoFormulario ? "Guardando..." : "Guardar"}
            </button>
            <Link className="btn btn-outline-secondary px-4" to="/">
              Volver
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
};
