import { useCallback } from "react";
import Logo from "../Logo/Logo";
import {
    useAppDispatch,
    useAppSelector,
} from "../../utils/redux-toolkit/reduxHooks";
import { setActiveBar as setActiveBarAction } from "../../utils/redux-toolkit/sidebarSlice";
import "./Navbar.scss";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../../utils/redux-toolkit/authSlice";
import { notify } from "../../utils/functions/notify";
// import ChangeModeIcon from "../Controlling_Icons/ChangeModeIcon.jsx";

const Navbar = () => {
    const activeBar = useAppSelector((state) => state.sidebar.activeBar);
    const token = useAppSelector((state) => state.auth.token);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const setActiveBar = useCallback(
        (active: boolean) => {
            dispatch(setActiveBarAction(active));
        },
        [dispatch]
    );

    // Toggle sidebar state
    const toggleSidebar = () => {
        setActiveBar(!activeBar);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        dispatch(logout());
        notify("success", "Logged out");
        navigate("/login");
    };

    // Icon class based on activeBar state
    const menuIconClass = `fa-solid fa-bars bx-menu-burger-icon text-4xl cursor-pointer trans-3 ${
        activeBar ? "green-c" : "black-c"
    }`;

    return (
        <nav className="navbar nav-bg fixed top-0 w-screen lg:hidden">
            <div className="container flex justify-between items-center py-3 px-6">
                <Logo disabled={true} />

                {/* Right Side */}
                <div className="right flex items-center gap-4 md:gap-9">
                    {/* Color Mode */}
                    {/* <ChangeModeIcon /> */}

                    {token ? (
                        <button
                            type="button"
                            className="mobile-auth-link"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    ) : (
                        <Link className="mobile-auth-link" to="/login">
                            Login
                        </Link>
                    )}

                    {/* Sidebar Toggle Icon */}
                    <i onClick={toggleSidebar} className={menuIconClass}></i>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
