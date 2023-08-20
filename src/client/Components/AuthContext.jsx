import React from "react";
import { useEffect, useState } from "react"
import { useMemo } from "react"
import { Children } from "react"
import { makeAPI } from "../lib/API"

export const AuthContext = React.createContext({
    permissions: "guest",
    isAdmin: false
})


export const AuthContextProvider = ({ children }) => {

    const [authState , setAuthState] = useState({});
    const API = makeAPI();

    useEffect(() => {
        const fetchPermissions = async () => {
            const { permissions } = await API("/api/permissions").get();
            setAuthState(prev => ({...prev, permissions}))
        }
        fetchPermissions();
    }, [])

    const api = useMemo(()=>{
            return { 
                permissions: authState?.permissions,
                isAdmin: authState?.permissions === "admin"
            }
    }, [authState])

    return <AuthContext.Provider value={api}>
        {children}
    </AuthContext.Provider>
}