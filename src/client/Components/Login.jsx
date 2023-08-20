import { useCallback, useState } from "react"
import { Button, IconInput } from "./Input";
import { FaUser, FaKey, FaSignInAlt } from "react-icons/fa"
import "./Login.css"
import { useQuery } from "../lib/utils"

export const LoginBox = ({ children = []}) => {

    const query =  useQuery()
    const redirect = query.get("redirect");

    return <form action={`api/login?redirect=${redirect ? redirect : "/"}`} method="POST" className="loginbox">
                
                   <IconInput Icon={FaUser} name="username" placeholder={"Enter your username"} />
                    <IconInput Icon={FaKey}  type={"password"} name="password" placeholder={"Enter your password"} />
                    <Button Icon={FaSignInAlt} type="submit" label={"Login"}/>
            </form>  
}


