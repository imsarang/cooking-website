import React from 'react'
import { useState } from 'react'
import FormInput from '@/components/common/FormInputEventDelegation'
import '@/styles/create/ingredients.css'
import { FaPlus, FaTrash } from 'react-icons/fa'

interface IngredientsInterface {
  ingredients: 
    {
      index: number,
      name: string,
      quantity: string
    }[],
}

const Ingredients = ({ ...props }: IngredientsInterface) => {

  return (
    <div className='ingredients'>
      <div className="ingredients-header">
        Ingredients
      </div>
      {
        props.ingredients.map((item, index) => {
          return <div
            className="view-ingredients"
            key={item.index}
            data-action='null'
          >
            <div className="view-ingredient-name">
              {item.name}

            </div>

            <div className="view-ingredient-name">
              {item.quantity}
            </div>
          </div>
        })
      }
    </div>
  )
}

export default Ingredients