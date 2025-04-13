import { removeFromLocalStorage, storeInLocalStorage } from "@/utils/LocalStorage"
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

export const APIFetchRequestWithTokenFormData = async(
    url: string,
    token: string,
    method = 'GET' as string,
    data: any
)=>{
    const decoded = jwtDecode(token)
    const now = Date.now() / 1000

    let result
    if (decoded?.exp as number < now) {
        const reqToken = await fetch(`${fetchServerEndpointAuth()}/api/auth/refresh`)
        console.log(reqToken);
        
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
        },
        body:data
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

    const response = await fetch(url, headerOptions)
    const result = await response.json()
    return result
}

export const fetchServerEndpointAuth = () => {
    return process.env.NEXT_PUBLIC_AUTH_SERVER_ENDPOINT || 'http://localhost:3001';
    // return `http://localhost:3000`
}

export const fetchServerEndpointRecipe = () => {
    return process.env.NEXT_PUBLIC_AUTH_SERVER_ENDPOINT || 'http://localhost:3002';
}