import { createContext, useMemo, useState } from "react";

export const DataContext = createContext({
    inventory: [],
    setInventory: () => {}
})


export const DataContextProvider = ({ children =[]}) => {

    const [state, setState] = useState([]);

    const api = useMemo(()=> {
            return {
                inventory: state,
                setInventory: setState
            }
    }, [state])

    return <DataContext.Provider value={api}>
        {children}
    </DataContext.Provider>
}