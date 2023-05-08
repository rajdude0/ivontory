import { createContext, useMemo, useState } from "react";

export const NavContext = createContext({
    navState: {},
    setNavState: () => {}
})


export const NavContextProvider = ({ children =[]}) => {

    const [navState, setNavState] = useState({});

    const api = useMemo(()=> {
            return {
                navState,
                setNavState: setNavState
            }
    }, [navState])

    return <NavContext.Provider value={api}>
        {children}
    </NavContext.Provider>
}