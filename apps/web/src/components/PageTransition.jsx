import { useLocation } from "react-router-dom";

export const PageTransition = ({ children }) => {
    const location = useLocation();

    return (
        <div className="page-transition" key={location.pathname}>
            {children}
        </div>
    );
};
