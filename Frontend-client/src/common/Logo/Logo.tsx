import { NavLink, useNavigate } from "react-router-dom";
import "./Logo.scss";
import type { LogoProps } from "../Types/Interfaces";

// Logo component for brand logo and name display
const Logo = ({ disabled = false, compressSidebar }: LogoProps) => {
    const navigate = useNavigate();
    
    return (
        <div className="logo-wraper flex gap-3 items-center group cursor-pointer" onClick={() => navigate("/")}>
            {/* Logo icon as a Link */}
            <div className="logo group w-fit">
                <NavLink
                    to="/"
                    title={disabled ? "Go to the home page" : "Logo"}
                    className={`logo-mark transition duration-[300ms] rounded-[12px] min-h-[64px] min-w-[64px] flex items-center justify-center ${
                        !disabled && "group-hover:scale-[1.03]"
                    }`}
                    onClick={(e) => disabled && e.preventDefault()} // Disable click if disabled
                >
                    <img src="/brand-logo.svg" alt="DRB logo" className="logo-image" />
                </NavLink>
            </div>

            {/* Show name and title if sidebar is expanded */}
            {!compressSidebar && (
                <div>
                    <h4 className="text-lg black-c font-semibold mb-0 ">
                         <span className="green-c">BHEL</span>
                    </h4>
                    <p className="text-sm gray-c font-normal mb-0 ">Task Scheduler</p>
                </div>
            )}
        </div>
    );
};

export default Logo;
