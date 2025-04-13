"use client";
import React, { useEffect } from 'react'

import '@/styles/auth/FormInput.css'

interface FormInputProps {
    label: string
    type:string
    name: string
    value: string
    setData: (name: string, value: string) => void
}

const FormInput: React.FC<FormInputProps> = ({ label, type, name, value, setData }) => {

    const handleChange = (e: any) => {
        setData(e.target.name, e.target.value)
        // console.log(data);
    }

    return (
        <div className='inputMain'>
            <div className={`inputBox `}>
                <input
                    className='input'
                    type={type}
                    required
                    name={name}
                    onChange={(e) => handleChange(e)}
                    value={value}
                />
                <span className={`label`}>
                    {label}
                </span>
            </div>
        </div>
    )
}

export default FormInput