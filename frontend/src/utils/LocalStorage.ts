
export const storeInLocalStorage = (
    key:string,
    value:any
)=>{
    localStorage.setItem(key,value)
}

export const removeFromLocalStorage = (
    key:string
)=>{
    localStorage.removeItem(key)
}

export const fetchFromLocalStorage = (
    key:string
)=>{
    return localStorage.getItem(key)
}