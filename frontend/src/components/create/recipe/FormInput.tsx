"use client";
import React, { useEffect } from 'react'

import '@/styles/create/formInput.css'

interface FormInputProps {
    label: string
    type:string
    name: string
    value: string
    setData: (name: string, value: string) => void
}

const FormInput: React.FC<FormInputProps> = ({ label, type, name, value, setData }) => {

    const handleChange = (e: any) => {
        console.log(e.target.name, e.target.value);
        
        setData(e.target.name, e.target.value)
        // console.log(data);
    }

    return (
        <div className='create-inputMain'>
            <div className={`create-inputBox `}>
                <input
                    className='create-input'
                    type={type}
                    required
                    name={name}
                    onChange={(e) => handleChange(e)}
                    value={value}
                />
                <span className={`create-label`}>
                    {label}
                </span>
            </div>
        </div>
    )
}

export default FormInput