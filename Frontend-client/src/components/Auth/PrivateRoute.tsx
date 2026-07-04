import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAppSelector } from "../../utils/redux-toolkit/reduxHooks";
import type { AccountType } from "../../utils/redux-toolkit/authSlice";

interface PrivateRouteProps {
    children: ReactNode;
    allowedRoles?: AccountType[];
}

const PrivateRoute = ({ children, allowedRoles }: PrivateRouteProps) => {
    const { token, user } = useAppSelector((state) => state.auth);
    const location = useLocation();

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.accountType)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default PrivateRoute;
