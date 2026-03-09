import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
} from "react-router-dom";
import { Layout } from "./pages/Layout";
import ContactList from "./views/ContactList";
import ContactForm from "./views/ContactForm";

export const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>} >
        <Route index element={<ContactList />} />
        <Route path="/add" element={<ContactForm />} />
        <Route path="/edit/:id" element={<ContactForm />} />
        <Route path="/contacto/nuevo" element={<ContactForm />} />
        <Route path="/contacto/:id" element={<ContactForm />} />
      </Route>
    )
);
