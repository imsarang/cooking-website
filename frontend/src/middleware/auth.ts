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

