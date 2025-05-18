"use client";
import React, { useEffect } from 'react'

import '@/styles/auth/FormInput.css'

interface FormInputProps {
    label: string
    type:string
    name: string
    value: string
    setData: (name: string, value: string) => void
    handleKeyDown?: (e: React.KeyboardEvent) => void
}

const FormInput: React.FC<FormInputProps> = ({ ...props }: FormInputProps) => {

    const handleChange = (e: any) => {
        props.setData(e.target.name, e.target.value)
        // console.log(data);
    }

    return (
        <div className='inputMain'>
            <div className={`inputBox `}>
                <input
                    className='input'
                    type={props.type}
                    required
                    name={props.name}
                    onChange={(e) => handleChange(e)}
                    onKeyDown={(e)=> props.handleKeyDown?.(e)}
                    value={props.value}
                />
                <span className={`label`}>
                    {props.label}
                </span>
            </div>
        </div>
    )
}

export default FormInput