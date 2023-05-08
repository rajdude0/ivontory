import { useState } from "react";
import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import "./App.css";
import { Admin } from "./Components/Admin";
import { NavItem, NavLogo, Navbar } from "./Components/Navbar";

import { Home } from "./Components/Home";
import { IconInput } from "./Components/Input";
import { FaSearch } from "react-icons/fa";
import { DataContext, DataContextProvider } from "./Components/DataContext";
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <div className="App">
        <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
       <ToastContainer />
      <DataContextProvider>
        <Navbar>
           <NavLogo title={"Ivontory"} />
           <IconInput className="navsearch" Icon={FaSearch}  placeholder={"Search.."}/>
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
