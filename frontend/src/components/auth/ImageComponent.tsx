"use client";

import React from 'react'
import Image from 'next/image';

import '@/styles/auth/CustomForm.css'

interface ImageIconProps{
    imageSrc:string
    layout?: string
}

const ImageComponent: React.FC<ImageIconProps>= ({imageSrc,layout}) => {
  return (
    <div className={`image`}>
      {
        layout!= "fill"?
        <img
        src={imageSrc}
        alt="Image not found"
        className='image-tag-custom'
        />:
        <img
            src={imageSrc}
            alt="Image not found"
            className='image-tag-fill'
            />
      }
        
    </div>
  )
}

export default ImageComponent