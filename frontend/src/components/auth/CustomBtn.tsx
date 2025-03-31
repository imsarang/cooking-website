"use client";

import React from 'react'
import '@/styles/auth/CustomBtn.css'
import ImageComponent from '../auth/ImageComponent';

interface CustomBtnProps {
    text: string
    icon?: string
    customClassName: string
    onButtonClick:()=>void
}

const CustomBtn: React.FC<CustomBtnProps> = ({ text, icon, customClassName, onButtonClick }) => {
    return (
        <div className={`btnContainer`}>
            <button className={`${customClassName}` || `defaultClass`} type='submit' onClick={onButtonClick}>
                {icon ?
                    <div className={`icon`}>
                        <ImageComponent
                            imageSrc={icon}
                            layout='fill' />
                    </div>
                    :
                    <></>}
                <div className={`text`}>{text}</div>
            </button>
        </div>
    )
}

export default CustomBtn