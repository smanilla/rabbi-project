import { useContext } from "react";
// import { authContext } from "../context/AuthProvider";
import { authContext } from './../contexts/AuthProvider/AuthProvider';

const useAuth = () => {
    return useContext(authContext);
};

export default useAuth;
