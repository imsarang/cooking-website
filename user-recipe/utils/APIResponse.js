export const APIResponseSuccess = (
    res,
    message,
    status,
    data
)=>{
    return res.status(status).json({
        message:message,
        data:data,
        success:true
    })
}

export const APIResponseError = (
    res,
    error,
    status
)=>{
    return res.status(status).json({
        error:error,
        success:false
    })
}

export const APIResponseFailure = (
    res,
    message,
    status
)=>{
    return res.status(status).json({
        message:message,
        success:false
    })
}