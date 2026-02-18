import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const ContactCard = ({ contacto }) => {
  const navegar = useNavigate();
  const { acciones } = useGlobalReducer();

  const alBorrar = async () => {
    const confirmar = window.confirm("¿Seguro que quieres borrar este contacto?");
    if (!confirmar) return;
    await acciones.borrarContacto(contacto.id);
  };

  return (
    <article className="card p-3">
      <h2 className="h5 mb-2">{contacto.full_name}</h2>
      <p className="mb-1">
        <i className="fa-solid fa-envelope me-2" />
        {contacto.email}
      </p>
      <p className="mb-1">
        <i className="fa-solid fa-phone me-2" />
        {contacto.phone}
      </p>
      <p className="mb-3">
        <i className="fa-solid fa-location-dot me-2" />
        {contacto.address}
      </p>

      <div className="d-flex gap-2">
        <button
          className="btn btn-outline-primary btn-sm"
          type="button"
          onClick={() => navegar(`/contacto/${contacto.id}`)}
        >
          Editar
        </button>
        <button className="btn btn-outline-danger btn-sm" type="button" onClick={alBorrar}>
          Borrar
        </button>
      </div>
    </article>
  );
};
