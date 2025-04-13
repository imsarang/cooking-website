"use client";

import React from 'react'
import'@/styles/auth/HorizontalLine.css'
interface HorizontalLineProps{
    text:string
}

const HorizontalLine:React.FC<HorizontalLineProps> = ({text}) => {
  return (
    <div className={`lineContainer`}>
        <div className={`authLine`}>
        <div className={`auth-content`}>{text}</div>
        </div>
    </div>
  )
}

export default HorizontalLine