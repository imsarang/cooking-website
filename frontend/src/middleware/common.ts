import { fetchFromLocalStorage, removeFromLocalStorage, storeInLocalStorage } from "@/utils/LocalStorage"
import { jwtDecode } from 'jwt-decode'

export const APIFetchRequestWithToken = async (
    url: string,
    token: string,
    method = 'GET' as string,
    data: any
) => {
    // console.log(token, content, data);

    const decoded = jwtDecode(token)
    const now = Date.now() / 1000

    let result
    if (decoded?.exp as number < now) {
        const reqToken = await fetch(`${fetchServerEndpointAuth()}/api/auth/refresh`)
        result = await reqToken.json()
        token = result.data.accessToken

        console.log(token);

        removeFromLocalStorage("AccessToken")
        storeInLocalStorage('AccessToken', token)
    }


    const headerOptions = {
        method: method,
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }

    console.log(headerOptions);

    return await fetch(url, headerOptions)
}


const parseToken = (token: string) => {
    try {
        const base64payload = token.split('.')[1]
        const payload = atob(base64payload)
        return JSON.parse(payload)
    } catch (e) {
        console.log(e);
        return null
    }
}

const isTokenExpired = (token: string) => {

    console.log("Checking if token is expired");
    console.log(token);
    const decoded = parseToken(token)
    console.log(decoded);
    
    if (!decoded) return true
    const now = Math.floor(Date.now() / 1000)
    console.log(decoded.exp, now);
    
    return decoded.exp < now
}

const refreshAccessToken = async () => {

    console.log("Geneating new token");
    
    try {
        const reqToken = await fetch(`${fetchServerEndpointAuth()}/api/auth/refresh`)
        const result = await reqToken.json()
        const token = result.data.accessToken

        console.log(`New Token : ${token}`);

        removeFromLocalStorage("AccessToken")
        storeInLocalStorage('AccessToken', token)
        return token
    }
    catch (e) {
        console.log(e);
        return null
    }
}

export const APIFetchRequestWithTokenFormData = async (
    url: string,
    token: string,
    method = 'GET' as string,
    data: any
) => {

    let accessToken = fetchFromLocalStorage('AccessToken')

    if (!accessToken || isTokenExpired(accessToken)) {
        console.log(`Token has expired, Refreshing the token`);
        
        accessToken = await refreshAccessToken()
    }

    const headerOptions = {
        method: method,
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        body: data
    }

    console.log(headerOptions);

    return await fetch(url, headerOptions)
}

export const APIFetchRequest = async (
    url: string,
    method = 'GET' as string,
    data?: object
) => {
    console.log(url);

    let headerOptions = {};
    if (method != 'GET') {
        headerOptions = {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }
    }
    console.log(headerOptions);

    const response = await fetch(url, headerOptions)

    console.log("Request sent to service");

    const result = await response.json()
    console.log(`Response from service : ${response}`);
    
    console.log(`Result after api request : ${result}`);
    
    return result
}

export const fetchServerEndpointAuth = () => {
    console.log(process.env.NODE_ENV);
    
    return process.env.NODE_ENV === 'production'?
        "http://localhost"
        :
        "http://localhost:3001"
    // return process.env.NEXT_PUBLIC_AUTH_SERVER_ENDPOINT || 'http://localhost';
    // return `http://localhost`
}

export const fetchServerEndpointRecipe = () => {
    console.log(process.env.NODE_ENV);
    return process.env.NODE_ENV === 'production'?
        "http://localhost"
        :
        "http://localhost:3002"
    // return process.env.NEXT_PUBLIC_AUTH_SERVER_ENDPOINT || 'http://localhost:3002';
}