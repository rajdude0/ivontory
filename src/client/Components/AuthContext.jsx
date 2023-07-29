import { useState } from "react"
import { useMemo } from "react"
import { Children } from "react"

const AuthContext = React.createContext({
    isAdmin: false,
    token: null,
})


export const AuthContextProvider = ({ children }) => {

    const [authState , setAuthState] = useState();

    const api = useMemo(()=>{
            return { 
                setToken : (token) => {
                    setAuthState(prev => ({ ...prev, token: token}));
                },
                getToken: () => { return authState.token}
            }
    }, [])

    return <AuthContext.Provider>
        {Children}
    </AuthContext.Provider>
}