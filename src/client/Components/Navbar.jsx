import "./Navbar.css";
import { NavLink } from "react-router-dom";

export const Navbar = ({children}) => {
        return <div className="navbar container">{children}</div>
}

export const NavLogo = ({ title, image }) => {
    return (
      <NavLink to="/">
        <div className="navlogo">
          {image && <img src={image} />}
          {title && <h3>{title}</h3>}
        </div>
      </NavLink>
    );
  };


export const NavItem = (name, path) => {
  return <NavLink to={path}>
         <div className="navitem">name</div>
        </NavLink>
}