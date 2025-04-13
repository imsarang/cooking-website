import React from 'react'
import { useState } from 'react'
import FormInput from '@/components/common/FormInputEventDelegation'
import '@/styles/create/ingredients.css'
import { FaPlus, FaTrash } from 'react-icons/fa'

interface IngredientsInterface {
  ingredients: [
    {
      index: number,
      name: string,
      quantity: string
    }
  ],
  handleCreateIngredients: (e: React.FormEvent<HTMLDivElement>) => void,
  handleAddIngredient: () => void,
  handleRemoveIngredient: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
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
            className="add-ingredients"
            onChange={(e) => props.handleCreateIngredients(e)}
            onClick={(e) => props.handleRemoveIngredient(e)}
            key={item.index}
            data-action='null'
          >
            <div className="add-ingredient-name">
              <FormInput
                label='name'
                type='input'
                name='name'
                value={item.name}
                index={index}
                action='null'
              />

            </div>

            <div className="add-ingredient-name">
              <FormInput
                label='quantity'
                type='input'
                name='quantity'
                value={item.quantity}
                index={index}
                action='null'
              />

            </div>
            <div
              className="remove-ingredient"
              data-action="remove"
              data-index={index}
            >
              <FaTrash />
            </div>
          </div>
        })
      }

      <div className="add-ingredient-btn-wrapper"
        onClick={() => props.handleAddIngredient()}
      >
        <button
          className="add-ingredient-btn"
        >
          <FaPlus />
        </button>
      </div>

    </div>
  )
}

export default Ingredients