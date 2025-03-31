"use client";

import React from 'react'
import "@/styles/recipes/product.css"
import { storeInLocalStorage } from '@/utils/LocalStorage';

interface ProductCardProps {
  image: string,
  title: string,
  description: string,
  rating: number,
  isFavourite: boolean
}

const ProductCard = ({image,title,description,rating,isFavourite} : ProductCardProps) => {
  
  const handleRecipe = () => {
    // console.log('Recipe Clicked')
    storeInLocalStorage('recipe', {image,title,description,rating,isFavourite})
  }

  return (
    <div className='product card' onClick = {handleRecipe}>
      <div className='product image'>
        <img src={image} alt='image not found' className='product img'></img>
      </div>
      <div className='content'>
        <div className='title'>{title}</div>
        <div className='description'>{description}</div>
        <div className='rating'>{rating}/5 </div>
        <div className='favourites'>Add To Favourites</div>
      </div>
    </div>
  )
}

export default ProductCard