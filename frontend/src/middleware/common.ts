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

interface APIResponse {
    response: any;
    newToken: string;
}

export const APIFetchRequestWithToken = async (
    url: string,
    token: string,
    method: string,
    body: any,
    options: RequestInit = {}
): Promise<APIResponse> => {
    try {
        console.log('Making API request to:', url);
        console.log('Method:', method);
        console.log('Token:', token ? 'Present' : 'Missing');
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: method !== 'GET' ? JSON.stringify(body) : undefined,
            ...options
        });

        console.log('Response status:', response.status);
        
        if (response.status === 401 || response.status === 403) {
            console.log('Token expired, attempting to refresh...');
            const newToken = await getAccessToken();
            if (newToken) {
                console.log('Got new token, retrying request...');
                return APIFetchRequestWithToken(url, newToken, method, body, options);
            }
        }

        const data = await response.json();
        return {
            response: data,
            newToken: token
        };
    } catch (error) {
        console.error('API request error:', error);
        throw error;
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
