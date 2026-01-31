import { createContext } from "react";
import useAuthBackend from "../../hooks/useAuthBackend";

export const authContext = createContext();

const AuthProvider = ({ children }) => {
    const allContext = useAuthBackend();
    return (
        <authContext.Provider value={allContext}>
            {children}
        </authContext.Provider>
    );
};

export default AuthProvider;
