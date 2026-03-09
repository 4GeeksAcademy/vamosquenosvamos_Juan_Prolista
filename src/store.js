const API_BASE_URL = "https://playground.4geeks.com/contact";
const DEFAULT_AGENDA_SLUG = "vamosquenosvamos_juan_prolista";
const JSON_HEADERS = {
  "Content-Type": "application/json",
};
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const AGENDA_SLUG =
  (import.meta.env.VITE_CONTACT_AGENDA_SLUG ?? "").trim() || DEFAULT_AGENDA_SLUG;

export const ACTION_TYPES = Object.freeze({
  setContactsLoading: "set_contacts_loading",
  loadContactsSuccess: "load_contacts_success",
  setSavingContact: "set_saving_contact",
  requestFailure: "request_failure",
  clearError: "clear_error",
});

export const createEmptyContact = () => ({
  name: "",
  email: "",
  phone: "",
  address: "",
});

export const normalizeContact = (contactData = {}) => ({
  id: contactData.id ? Number(contactData.id) : undefined,
  name: (contactData.full_name ?? contactData.name ?? "").trim(),
  email: (contactData.email ?? "").trim(),
  phone: (contactData.phone ?? "").trim(),
  address: (contactData.address ?? "").trim(),
});

export const getContactById = (contacts, contactId) =>
  contacts.find((contact) => contact.id === contactId);

export const validateContactData = (contactData = {}) => {
  const normalizedContact = normalizeContact(contactData);
  const validationErrors = {};

  if (!normalizedContact.name) {
    validationErrors.name = "El nombre es obligatorio";
  }

  if (!normalizedContact.email) {
    validationErrors.email = "El email es obligatorio";
  } else if (!EMAIL_PATTERN.test(normalizedContact.email)) {
    validationErrors.email = "El email no es valido";
  }

  if (!normalizedContact.phone) {
    validationErrors.phone = "El telefono es obligatorio";
  }

  if (!normalizedContact.address) {
    validationErrors.address = "La direccion es obligatoria";
  }

  return validationErrors;
};

const buildContactPayload = (contactData) => {
  const normalizedContact = normalizeContact(contactData);

  return {
    name: normalizedContact.name,
    email: normalizedContact.email,
    phone: normalizedContact.phone,
    address: normalizedContact.address,
    agenda_slug: AGENDA_SLUG,
  };
};

const getAgendaEndpoint = () => `${API_BASE_URL}/agendas/${AGENDA_SLUG}`;

const getAgendaContactsEndpoint = () => `${getAgendaEndpoint()}/contacts`;

const sortContactsByName = (contacts) =>
  [...contacts].sort((currentContact, nextContact) =>
    currentContact.name.localeCompare(nextContact.name)
  );

const getApiErrorMessage = async (response, fallbackMessage) => {
  try {
    const contentType = response.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const payload = await response.json();
      return payload?.msg || payload?.message || fallbackMessage;
    }

    const textPayload = await response.text();
    return textPayload || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
};

export const ensureAgendaExists = async () => {
  const response = await fetch(getAgendaEndpoint(), {
    method: "POST",
    headers: JSON_HEADERS,
  });

  if (!response.ok && ![400, 409].includes(response.status)) {
    throw new Error(
      await getApiErrorMessage(
        response,
        "No se pudo inicializar la agenda de contactos."
      )
    );
  }
};

const parseContactsResponse = async (response) => {
  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "No se pudo cargar la lista de contactos.")
    );
  }

  const payload = await response.json();
  const contacts = Array.isArray(payload?.contacts) ? payload.contacts : [];

  return sortContactsByName(contacts.map(normalizeContact));
};

export const fetchContactsFromApi = async () => {
  const response = await fetch(getAgendaEndpoint());

  if (response.status === 404) {
    await ensureAgendaExists();

    const retryResponse = await fetch(getAgendaEndpoint());
    return parseContactsResponse(retryResponse);
  }

  return parseContactsResponse(response);
};

export const createContactInApi = async (contactData) => {
  await ensureAgendaExists();

  const response = await fetch(getAgendaContactsEndpoint(), {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(buildContactPayload(contactData)),
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "No se pudo crear el contacto.")
    );
  }
};

export const updateContactInApi = async (contactId, contactData) => {
  const response = await fetch(`${API_BASE_URL}/contacts/${contactId}`, {
    method: "PUT",
    headers: JSON_HEADERS,
    body: JSON.stringify(buildContactPayload(contactData)),
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "No se pudo actualizar el contacto.")
    );
  }
};

export const deleteContactInApi = async (contactId) => {
  const response = await fetch(`${getAgendaContactsEndpoint()}/${contactId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "No se pudo borrar el contacto.")
    );
  }
};

export const setContactsLoadingAction = () => ({
  type: ACTION_TYPES.setContactsLoading,
});

export const loadContactsSuccessAction = (contacts) => ({
  type: ACTION_TYPES.loadContactsSuccess,
  payload: contacts,
});

export const setSavingContactAction = () => ({
  type: ACTION_TYPES.setSavingContact,
});

export const requestFailureAction = (message) => ({
  type: ACTION_TYPES.requestFailure,
  payload: message,
});

export const clearErrorAction = () => ({
  type: ACTION_TYPES.clearError,
});

export const initialStore = () => ({
  contacts: [],
  isLoadingContacts: false,
  isSavingContact: false,
  hasLoadedContacts: false,
  error: null,
});

const getFirstValidationError = (validationErrors) =>
  Object.values(validationErrors)[0] || "Revisa los campos del formulario.";

const syncContacts = async (dispatch) => {
  const contacts = await fetchContactsFromApi();
  dispatch(loadContactsSuccessAction(contacts));
};

export const loadContacts = async (dispatch) => {
  dispatch(setContactsLoadingAction());

  try {
    await syncContacts(dispatch);
    return true;
  } catch (error) {
    dispatch(
      requestFailureAction(
        error instanceof Error ? error.message : "No se pudieron cargar los contactos."
      )
    );
    return false;
  }
};

export const addContact = async (dispatch, contactData) => {
  const validationErrors = validateContactData(contactData);

  if (Object.keys(validationErrors).length > 0) {
    dispatch(requestFailureAction(getFirstValidationError(validationErrors)));
    return false;
  }

  dispatch(setSavingContactAction());

  try {
    await createContactInApi(contactData);
    await syncContacts(dispatch);
    return true;
  } catch (error) {
    dispatch(
      requestFailureAction(
        error instanceof Error ? error.message : "No se pudo crear el contacto."
      )
    );
    return false;
  }
};

export const updateContact = async (dispatch, contactId, contactData) => {
  const validationErrors = validateContactData(contactData);

  if (Object.keys(validationErrors).length > 0) {
    dispatch(requestFailureAction(getFirstValidationError(validationErrors)));
    return false;
  }

  dispatch(setSavingContactAction());

  try {
    await updateContactInApi(contactId, contactData);
    await syncContacts(dispatch);
    return true;
  } catch (error) {
    dispatch(
      requestFailureAction(
        error instanceof Error ? error.message : "No se pudo actualizar el contacto."
      )
    );
    return false;
  }
};

export const deleteContact = async (dispatch, contactId) => {
  dispatch(setSavingContactAction());

  try {
    await deleteContactInApi(contactId);
    await syncContacts(dispatch);
    return true;
  } catch (error) {
    dispatch(
      requestFailureAction(
        error instanceof Error ? error.message : "No se pudo borrar el contacto."
      )
    );
    return false;
  }
};

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case ACTION_TYPES.setContactsLoading:
      return {
        ...store,
        isLoadingContacts: true,
        error: null,
      };

    case ACTION_TYPES.loadContactsSuccess:
      return {
        ...store,
        contacts: action.payload,
        isLoadingContacts: false,
        isSavingContact: false,
        hasLoadedContacts: true,
        error: null,
      };

    case ACTION_TYPES.setSavingContact:
      return {
        ...store,
        isSavingContact: true,
        error: null,
      };

    case ACTION_TYPES.requestFailure:
      return {
        ...store,
        isLoadingContacts: false,
        isSavingContact: false,
        error: action.payload,
      };

    case ACTION_TYPES.clearError:
      return {
        ...store,
        error: null,
      };

    default:
      throw new Error("Unknown action.");
  }
}
