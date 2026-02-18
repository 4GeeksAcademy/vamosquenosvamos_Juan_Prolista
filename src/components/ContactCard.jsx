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
    <article className="card border-0 shadow-sm rounded-4 p-3 p-md-4 contact-card">
      <div className="d-flex align-items-center gap-3 mb-3">
        <div className="contact-avatar">
          {String(contacto.full_name || "?")
            .trim()
            .charAt(0)
            .toUpperCase()}
        </div>
        <div>
          <h2 className="h5 mb-1">{contacto.full_name}</h2>
          <p className="text-secondary mb-0 small">Contacto personal</p>
        </div>
      </div>

      <p className="mb-2 text-secondary">
        <i className="fa-solid fa-envelope me-2 text-primary" />
        {contacto.email}
      </p>
      <p className="mb-2 text-secondary">
        <i className="fa-solid fa-phone me-2 text-primary" />
        {contacto.phone}
      </p>
      <p className="mb-4 text-secondary">
        <i className="fa-solid fa-location-dot me-2 text-primary" />
        {contacto.address}
      </p>

      <div className="d-flex gap-2 mt-auto">
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
