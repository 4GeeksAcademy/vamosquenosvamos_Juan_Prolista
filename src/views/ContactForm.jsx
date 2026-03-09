import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import {
  addContact,
  clearErrorAction,
  createEmptyContact,
  getContactById,
  loadContacts,
  updateContact,
  validateContactData,
} from "../store.js";

const FORM_FIELDS = [
  {
    name: "name",
    label: "Nombre completo",
    type: "text",
  },
  {
    name: "email",
    label: "Email",
    type: "email",
  },
  {
    name: "phone",
    label: "Telefono",
    type: "tel",
  },
  {
    name: "address",
    label: "Direccion",
    type: "text",
  },
];

const ContactForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const contactId = id ? Number(id) : null;
  const isEditMode = id !== undefined;
  const hasInvalidId = isEditMode && !Number.isInteger(contactId);
  const { store, dispatch } = useGlobalReducer();
  const {
    contacts,
    error,
    hasLoadedContacts,
    isLoadingContacts,
    isSavingContact,
  } = store;
  const [formData, setFormData] = useState(createEmptyContact);
  const [errors, setErrors] = useState({});

  const selectedContact =
    isEditMode && !hasInvalidId ? getContactById(contacts, contactId) : null;

  useEffect(() => {
    if (isEditMode || hasInvalidId) {
      return;
    }

    setFormData(createEmptyContact());
    setErrors({});
  }, [hasInvalidId, isEditMode]);

  useEffect(() => {
    if (!isEditMode || hasInvalidId || hasLoadedContacts || isLoadingContacts) {
      return;
    }

    void loadContacts(dispatch);
  }, [
    dispatch,
    hasInvalidId,
    hasLoadedContacts,
    isEditMode,
    isLoadingContacts,
  ]);

  useEffect(() => {
    if (!isEditMode || !selectedContact) {
      return;
    }

    setFormData({
      name: selectedContact.name,
      email: selectedContact.email,
      phone: selectedContact.phone,
      address: selectedContact.address,
    });
  }, [isEditMode, selectedContact]);

  const alCambiarInput = ({ target }) => {
    const { name, value } = target;

    setFormData((valorAnterior) => ({
      ...valorAnterior,
      [name]: value,
    }));

    setErrors((erroresActuales) => {
      if (!erroresActuales[name]) {
        return erroresActuales;
      }

      return {
        ...erroresActuales,
        [name]: null,
      };
    });

    if (error) {
      dispatch(clearErrorAction());
    }
  };

  const alEnviarFormulario = async (evento) => {
    evento.preventDefault();

    const validationErrors = validateContactData(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const guardadoOk = isEditMode
      ? await updateContact(dispatch, contactId, formData)
      : await addContact(dispatch, formData);

    if (guardadoOk) {
      navigate("/");
    }
  };

  if (hasInvalidId) {
    return (
      <div className="container">
        <div className="contact-feedback-card text-center p-4">
          <h1 className="h4 mb-2">ID de contacto invalido</h1>
          <p className="text-secondary mb-4">
            La ruta actual no apunta a un contacto valido.
          </p>
          <Link to="/" className="btn btn-primary">
            Volver a contactos
          </Link>
        </div>
      </div>
    );
  }

  if (isEditMode && !hasLoadedContacts) {
    return (
      <div className="container">
        <div className="contact-feedback-card text-center p-4">
          {isLoadingContacts ? (
            <>
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading contact...</span>
              </div>
              <h1 className="h4">Cargando contacto...</h1>
              <p className="text-secondary mb-0">
                Obteniendo los datos antes de abrir el modo edicion.
              </p>
            </>
          ) : (
            <>
              <h1 className="h4">Todavia no se pudo cargar el contacto</h1>
              <p className="text-secondary mb-4">
                Recarga la agenda antes de editar este contacto.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => loadContacts(dispatch)}
              >
                Reintentar carga
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  if (isEditMode && hasLoadedContacts && !selectedContact) {
    return (
      <div className="container">
        <div className="contact-feedback-card text-center p-4">
          <h1 className="h4 mb-2">Contacto no encontrado</h1>
          <p className="text-secondary mb-4">
            El contacto seleccionado ya no esta disponible en esta agenda.
          </p>
          <Link to="/" className="btn btn-primary">
            Volver a contactos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <section className="mx-auto" style={{ maxWidth: "760px" }}>
        <div className="mb-4">
          <p className="text-uppercase small fw-semibold mb-2">
            {isEditMode ? "Actualizar" : "Crear"}
          </p>
          <h1 className="display-6 fw-bold mb-0">
            {isEditMode ? "Editar contacto" : "Agregar contacto"}
          </h1>
        </div>

        <form
          className="contact-form-card card border-0 shadow-sm rounded-4 p-3 p-md-4"
          noValidate
          onSubmit={alEnviarFormulario}
        >
          <div className="row g-3">
            {FORM_FIELDS.map((field) => (
              <div
                key={field.name}
                className={field.name === "address" ? "col-12" : "col-12 col-md-6"}
              >
                <label className="form-label" htmlFor={field.name}>
                  {field.label}
                </label>
                <input
                  className={`form-control form-control-lg ${errors[field.name] ? "is-invalid" : ""}`}
                  type={field.type}
                  id={field.name}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={alCambiarInput}
                />
                {errors[field.name] ? (
                  <div className="invalid-feedback">{errors[field.name]}</div>
                ) : null}
              </div>
            ))}
          </div>

          {error ? <p className="text-danger mt-3 mb-0">{error}</p> : null}

          <div className="d-flex flex-column flex-sm-row gap-2 mt-4">
            <button
              className="btn btn-primary px-4"
              type="submit"
              disabled={isSavingContact}
            >
              {isSavingContact
                ? "Guardando..."
                : isEditMode
                  ? "Guardar cambios"
                  : "Guardar contacto"}
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

export default ContactForm;
