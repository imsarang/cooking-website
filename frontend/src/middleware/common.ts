import { fetchFromLocalStorage, removeFromLocalStorage, storeInLocalStorage } from "@/utils/LocalStorage"
import { jwtDecode } from 'jwt-decode'

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

export const fetchServerEndpointChat = () => {
    console.log(process.env.NODE_ENV);
    return process.env.NODE_ENV === 'production'?
        "http://localhost"
        :
        "http://localhost:3003"
}

export const fetchUser = async (
    url: string
) => {
    const response = await fetch(url);
    const result = await response.json();
    return result?.user
}

export const getAccessToken = async () => {
    try {
        const response = await fetch(`${fetchServerEndpointAuth()}/api/auth/token`, {
            method: 'GET',
            credentials: 'include' // Important to send the refresh token cookie
        })
        
        if (!response.ok) {
            throw new Error('Failed to get access token')
        }
        
        const result = await response.json()
        if (!result.success) {
            throw new Error(result.message || 'Failed to get access token')
        }
        console.log(`Access token : ${result.data.accessToken}`);
        
        return result.data.accessToken
    } catch (error) {
        console.error('Error getting access token:', error)
        return null
    }
}

export const refreshAccessToken = async () => {
    try{
        const response = await fetch(`${fetchServerEndpointAuth()}/api/auth/refresh`, {
            method: 'GET',
            credentials: 'include'
        })
        const result = await response.json()
        if(!result.success)
        {
            return {success : false, message : result.message}   
        }
        return {success : true, accessToken : result.accessToken}
    }
    catch(err)
    {
        console.log(`Error while refreshing access token : ${err}`);
        return null
    }
}

export const APIFetchRequestWithToken = async (
    url: string,
    token: string,
    method = 'GET' as string,
    data: any
) => {
    console.log(url);
    
    let headerOptions: { method: string; headers: { Authorization: string; 'Content-Type'?: string }; body?: string } = {
        method: method,
        headers: {
            Authorization: `Bearer ${token}`
        }
    };

    if(method != 'GET'){
        headerOptions.headers['Content-Type'] = 'application/json';
        headerOptions.body = JSON.stringify(data);
    }
    let result = await fetch(url, headerOptions)
    let response = await result.json()
    
    console.log(`Response from api request : ${response.status} ${response.message}`);
    
    // If we get a 401, try to refresh the tokelo
    if (response.status === 401 || response.status === 403) {
        console.log('Token expired, attempting to refresh...')
        // Get new access token
        const newToken = await refreshAccessToken()
        
        if (newToken) {
            console.log('Got new token, retrying request...')
            // Retry the original request with new token
            headerOptions.headers.Authorization = `Bearer ${newToken}`
            const newResult = await fetch(url, headerOptions)
            response = await newResult.json()
            
            // If the retry was successful, return the new token
            if (response.success) {
                return { response, newToken : newToken.accessToken }
            }
        }
    }
    else
    {
        return { response, newToken: token }
    }
}

export const APIFetchRequestWithTokenFormData = async (
    url: string,
    token: string,
    method = 'GET' as string,
    data: any
) => {
    const headerOptions = {
        method: method,
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: data
    }

    let response = await fetch(url, headerOptions)
    
    // If we get a 401, try to refresh the token
    if (response.status === 401) {
        // Get new access token
        const newTokenResult = await refreshAccessToken()
        const newToken = newTokenResult?.accessToken
        console.log(`New token : ${newToken}`);
        
        if (newToken) {
            // Retry the original request with new token
            headerOptions.headers.Authorization = `Bearer ${newToken}`
            response = await fetch(url, headerOptions)
        }
    }

    return response
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
