/* eslint-disable react-refresh/only-export-components */
import PropTypes from "prop-types";
import { createContext, useContext, useReducer } from "react";
import storeReducer, { initialStore } from "../store.js";

const StoreContext = createContext();

export function StoreProvider({ children }) {
  const [store, dispatch] = useReducer(storeReducer, initialStore());

  return (
    <StoreContext.Provider value={{ store, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

StoreProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default function useGlobalReducer() {
  const context = useContext(StoreContext);

  if (!context) {
    throw new Error("useGlobalReducer must be used inside StoreProvider");
  }

  return context;
}
