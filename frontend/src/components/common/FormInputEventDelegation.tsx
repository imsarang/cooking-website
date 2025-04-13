"use client";
import React, { useEffect } from 'react'

import '@/styles/create/formInput.css'

interface FormInputProps {
    label: string
    type:string
    name: string
    value: string
    index: Number
    action: string
}

const FormInput: React.FC<FormInputProps> = ({ label, type, name, value, index, action }) => {

    // const handleChange = (e: any) => {
    //     console.log(e.target.name, e.target.value);
        
    //     setData(e.target.name, e.target.value)
    //     // console.log(data);
    // }

    return (
        <div className='create-inputMain'>
            <div className={`create-inputBox `}>
                <input
                    className='create-input'
                    type={type}
                    required
                    name={name}
                    data-index={index}
                    value={value}
                    onChange={()=>{}}
                    data-action={action}
                />
                <span className={`create-label`}>
                    {label}
                </span>
            </div>
        </div>
    )
}

export default FormInput