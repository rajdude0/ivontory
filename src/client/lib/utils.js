import React from "react"
import { useLocation } from "react-router-dom";

export const isDefined = (value) => {
    return value!==undefined && value !== null && value !=='';
}

export const NoopFunction = () => {};


export const createFileFromURI = async (url, name, defaultType = "image/jpeg") => {
    const res  = await fetch(url);
    const data = await res.blob();
    return new File([data], name, {
        type: data.type || defaultType
    });
}

export const useQuery  = () =>  {
    const { search } = useLocation();
  
    return React.useMemo(() => new URLSearchParams(search), [search]);
}

export const getCookies = () => {
    return document.cookie.split(";").reduce((acc, curr) => {
        const [key, value] = curr.split("=").map(str => str.trim());
        acc[key] = value;
        return acc;
    } , {})
}

export const getCookie = (key) => {
    return getCookies()[key];
}