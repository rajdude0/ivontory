import { useCallback, useEffect, useState, useContext} from "react"
import { Button, IconInput } from "./Input";
import { FaUser, FaKey, FaSignInAlt } from "react-icons/fa"
import "./Login.css"
import { useQuery } from "../lib/utils"
import { NavContext } from "./NavContext";

export const LoginBox = ({ children = []}) => {

    const { navState, setNavState } = useContext(NavContext);
    const query =  useQuery()
    const redirect = query.get("redirect");

    useEffect(() => {
        setNavState(prev => {
            return { ...prev, isSearchOn: false }
        })
    }, [])

    return <form action={`api/login?redirect=${redirect ? redirect : "/"}`} method="POST" className="loginbox">
                
                   <IconInput Icon={FaUser} name="username" placeholder={"Enter your username"} />
                    <IconInput Icon={FaKey}  type={"password"} name="password" placeholder={"Enter your password"} />
                    <Button Icon={FaSignInAlt} type="submit" label={"Login"}/>
            </form>  
}


