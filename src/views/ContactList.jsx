import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ContactCard } from "../components/ContactCard.jsx";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { loadContacts } from "../store.js";

const ContactList = () => {
  const { store, dispatch } = useGlobalReducer();
  const {
    contacts,
    error,
    hasLoadedContacts,
    isLoadingContacts,
    isSavingContact,
  } = store;
  const hasBootstrapped = useRef(false);

  useEffect(() => {
    if (hasBootstrapped.current) return;
    hasBootstrapped.current = true;
    void loadContacts(dispatch);
  }, [dispatch]);

  const isBusy = isLoadingContacts || isSavingContact;

  return (
    <div className="container">
      <section className="hero-contactos rounded-4 p-4 p-md-5 mb-4 mb-md-5">
        <div className="d-flex flex-column flex-md-row gap-3 align-items-md-center justify-content-between">
          <div>
            <p className="text-uppercase small fw-semibold mb-2">Agenda digital</p>
            <h1 className="display-6 fw-bold mb-2">Lista de contactos</h1>
            <p className="mb-0 text-secondary">
              Gestiona tu agenda de forma simple, clara y rapida.
            </p>
          </div>
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => loadContacts(dispatch)}
              disabled={isBusy}
            >
              {isLoadingContacts ? "Recargando..." : "Recargar"}
            </button>
            <Link to="/add" className="btn btn-primary btn-lg align-self-start">
              Agregar contacto
            </Link>
          </div>
        </div>
      </section>

      <div className="mb-3">
        <h2 className="h4 mb-0">Tus contactos</h2>
      </div>

      {error ? (
        <div
          className="alert alert-danger d-flex justify-content-between align-items-center flex-wrap gap-3"
          role="alert"
        >
          <span>{error}</span>
          <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            onClick={() => loadContacts(dispatch)}
            disabled={isBusy}
          >
            Reintentar
          </button>
        </div>
      ) : null}

      {isLoadingContacts && !hasLoadedContacts ? (
        <div className="contact-feedback-card text-center p-4 mb-4">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h2 className="h5">Cargando contactos...</h2>
          <p className="text-secondary mb-0">
            Conectando con la API oficial para sincronizar la agenda.
          </p>
        </div>
      ) : null}

      {hasLoadedContacts && contacts.length === 0 ? (
        <div className="contact-feedback-card text-center p-4 mb-4">
          <h2 className="h4 mb-2">No hay contactos todavia</h2>
          <p className="text-secondary mb-4">
            Crea el primer contacto y se guardara en la agenda compartida.
          </p>
          <Link to="/add" className="btn btn-primary">
            Crear primer contacto
          </Link>
        </div>
      ) : null}

      <div className="row g-3 g-md-4">
        {contacts.map((contact) => (
          <div className="col-12 col-lg-6" key={contact.id}>
            <ContactCard contact={contact} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactList;
