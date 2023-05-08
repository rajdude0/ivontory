import { useContext, useMemo, useState } from "react";
import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import "./App.css";
import { Admin } from "./Components/Admin";
import { NavItem, NavLogo, Navbar } from "./Components/Navbar";

import { Home } from "./Components/Home";
import { IconInput } from "./Components/Input";
import { FaSearch, FaBars, FiX } from "react-icons/all";
import { DataContext, DataContextProvider } from "./Components/DataContext";
import { NavContext, NavContextProvider } from './Components/NavContext';
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css";

function App() {

    const { navState, setNavState } = useContext(NavContext);

    const handleFilterOpen = () => {
      setNavState(prev => {
        if(prev.filterOpen) {
          return {...prev, filterOpen: !prev.filterOpen};
        }
        return {...prev, filterOpen: true}
      })
    }

  return (
    <div className="App">
        <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
       <ToastContainer />
      <DataContextProvider>
       
        <Navbar>
           <NavLogo title={"Ivontory"} />
           <IconInput className="navsearch" Icon={FaSearch}  placeholder={"Search.."}/>
          { navState.isFilterOn && <div onClick={handleFilterOpen} className={`filter mobile ${navState.filterOpen? 'active': ''} `}>
             { navState.filterOpen ? <FiX /> : <FaBars /> }
           </div>
          }     
        </Navbar>
        <Routes>
          <Route path="/" element={ <Home /> } />
          <Route path="/admin" element={ <Admin />} />
        </Routes>
        </DataContextProvider>
    </div>
  );
}

export default App;
