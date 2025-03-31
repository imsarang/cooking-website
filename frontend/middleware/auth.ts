import { removeFromLocalStorage, storeInLocalStorage } from "../src/utils/LocalStorage"

export function emailValidation(email: string): boolean {
    const pattern = /^[a-zA-Z1-9]*@[a-z]*.[a-z]{0,4}$/
    if (pattern.test(email))
        return true
    return false
}

export function passwordValidation(password: string): boolean {
    const pattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z0-9!@#$%^&*(),.?":{}|<>]{8,}$/
    if (pattern.test(password))
        return true
    return false
}
export function passwordMatch(password: string, confirmPassword?: string): boolean {
    if (password == confirmPassword)
        return true
    return false
}

export const APIFetchRequestWithToken = async (
    url: string,
    token: string,
    method = 'GET' as string
) => {
    let response = await fetch(url, {
        method: method,
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    let result = await response.json()

    if(response.status == 401 && result?.message == "Token has expired"){

        const reqToken = await fetch(`/api/auth/refresh`)
        result = await reqToken.json()
        response = await fetch(url, {
            method: method,
            headers: {
                Authorization: `Bearer ${result!.data!.accessToken}`
            }
        })

        token = result.data.accessToken
        result = await response.json();

        removeFromLocalStorage("AccessToken")
        storeInLocalStorage('AccessToken',token)
    }
  
    return result
}

export const APIFetchRequest = async(
    url:string,
    method = 'GET' as string,
    data?:object
)=>{
    console.log(url);
    
    let headerOptions = {};
    if(method != 'GET')
    {
        headerOptions = {
            method:method,
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify(data)
        }
    }
    
    const response = await fetch(url,headerOptions)
    const result = await response.json()
    return result
}

export const fetchServerEndpoint = () =>{
    // console.log(process.env.NEXT_PUBLIC_FRONTEND_ENDPOINT);
    // console.log(process.env.NEXT_PUBLIC_AUTH_SERVER_PORT);
    
    
    // return `http://localhost`;
    return process.env.NEXT_PUBLIC_AUTH_SERVER_ENDPOINT || 'http://localhost:3001';
    // return `${process.env.NEXT_PUBLIC_FRONTEND_ENDPOINT}:${process.env.NEXT_PUBLIC_AUTH_SERVER_PORT_1}`;
}