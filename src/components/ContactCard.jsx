import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { deleteContact } from "../store";

export const ContactCard = ({ contact }) => {
  const { store, dispatch } = useGlobalReducer();
  const isBusy = store.isLoadingContacts || store.isSavingContact;

  const alBorrar = async () => {
    const confirmar = window.confirm("¿Seguro que quieres borrar este contacto?");
    if (!confirmar) return;
    await deleteContact(dispatch, contact.id);
  };

  return (
    <article className="card border-0 shadow-sm rounded-4 p-3 p-md-4 contact-card">
      <div className="d-flex align-items-center gap-3 mb-3">
        <div className="contact-avatar">
          {String(contact.name || "?")
            .trim()
            .charAt(0)
            .toUpperCase()}
        </div>
        <div>
          <h2 className="h5 mb-1">{contact.name}</h2>
          <p className="text-secondary mb-0 small">Contacto personal</p>
        </div>
      </div>

      <p className="mb-2 text-secondary">
        <span className="contact-detail-label">Email:</span>
        {contact.email}
      </p>
      <p className="mb-2 text-secondary">
        <span className="contact-detail-label">Telefono:</span>
        {contact.phone}
      </p>
      <p className="mb-4 text-secondary">
        <span className="contact-detail-label">Direccion:</span>
        {contact.address}
      </p>

      <div className="d-flex gap-2 mt-auto">
        <Link
          className="btn btn-outline-primary btn-sm"
          to={`/edit/${contact.id}`}
          aria-label={`Editar ${contact.name}`}
        >
          Editar
        </Link>
        <button
          className="btn btn-outline-danger btn-sm"
          type="button"
          onClick={alBorrar}
          disabled={isBusy}
          aria-label={`Borrar ${contact.name}`}
        >
          Borrar
        </button>
      </div>
    </article>
  );
};

ContactCard.propTypes = {
  contact: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    phone: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
  }).isRequired,
};
