import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAppSelector } from "../../utils/redux-toolkit/reduxHooks";

interface OpenRouteProps {
    children: ReactNode;
}

const OpenRoute = ({ children }: OpenRouteProps) => {
    const token = useAppSelector((state) => state.auth.token);

    if (token) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default OpenRoute;
