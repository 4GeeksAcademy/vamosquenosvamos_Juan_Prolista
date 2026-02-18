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
    <div className="container py-4">
      <h1 className="h3 mb-3">
        {esModoEditar ? "Editar contacto" : "Agregar contacto"}
      </h1>

      <form className="card p-3" onSubmit={alEnviarFormulario}>
        <label className="form-label">Nombre completo</label>
        <input
          className="form-control mb-3"
          type="text"
          name="full_name"
          value={datosFormulario.full_name}
          onChange={alCambiarInput}
          required
        />

        <label className="form-label">Email</label>
        <input
          className="form-control mb-3"
          type="email"
          name="email"
          value={datosFormulario.email}
          onChange={alCambiarInput}
          required
        />

        <label className="form-label">Teléfono</label>
        <input
          className="form-control mb-3"
          type="text"
          name="phone"
          value={datosFormulario.phone}
          onChange={alCambiarInput}
          required
        />

        <label className="form-label">Dirección</label>
        <input
          className="form-control mb-3"
          type="text"
          name="address"
          value={datosFormulario.address}
          onChange={alCambiarInput}
          required
        />

        {errorFormulario && <p className="text-danger mb-3">{errorFormulario}</p>}

        <div className="d-flex gap-2">
          <button className="btn btn-primary" type="submit" disabled={cargandoFormulario}>
            {cargandoFormulario ? "Guardando..." : "Guardar"}
          </button>
          <Link className="btn btn-outline-secondary" to="/">
            Volver
          </Link>
        </div>
      </form>
    </div>
  );
};
