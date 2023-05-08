import { HOST, HTTPS, PORT } from "../config/agent";

export const APIURL = `${HTTPS ? 'https://' : 'http://'}${HOST}:${PORT}`;

const defaultHeader = { "Content-Type": "application/json" }

export const createSession = (sessionHeaders) => {
    Object.entries(sessionHeaders).forEach(([k, v]) => {
        defaultHeader[k] = v;
    });
}

export const destroySession = (sessionHeaders) => {
    Object.keys(sessionHeaders).forEach((k) => delete defaultHeader[k])
}

export const makeAPI = ( BASEURL = APIURL, headers = defaultHeader ) => (ENDPOINTURL = '') => {
        const URL =  BASEURL + ENDPOINTURL;
        const combinedHeaders = { ...defaultHeader, ...headers};
        return {
            get: async (query) =>  get(URL, combinedHeaders, query),
            post: async (payload, headers) => post(URL, { ...combinedHeaders, ...headers }, payload),
            delete: async () => _delete(URL, combinedHeaders),
            put: async (payload) => put(URL, combinedHeaders, payload)
        };
}
export const get = async (URL, headers = {}, query) => {
    return fetch(`${URL}${query ? '?'+query: ''}`, {headers: { ...headers }}).then(data => data.json());
}

export const post = async (URL, headers = {}, payload = {}) => {
    return fetch(URL,  { method: 'POST', headers: {...headers}, body: JSON.stringify(payload) }).then(data => data.json());
}

export const _delete = async (URL, headers = {}, ) => {
    return fetch(URL, { method: "DELETE", headers: { ...headers }}).then(data => data.json())
}

export const put = async (URL , headers = {}, payload = {}) => {
    return fetch(URL, { method: 'PUT', headers: { ...headers}, body: JSON.stringify(payload) }).then(data => data.json());
}