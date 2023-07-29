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