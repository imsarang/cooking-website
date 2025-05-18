import '@/styles/create/nutrition.css';

import React from 'react'
import FormInput from './FormInput';

interface NutritionInterface {
    nutrition: {
        calories: string,
        protein: string,
        fat: string,
        carbs: string
    },
    setNutrition: (name: string, value: string) => void,
}
const Nutrition = ({ ...props }: NutritionInterface) => {
    return (
        <div className='nutrition'>
            <div className="nutrition-header">
                Nutrition
            </div>
            <div 
            className="nutrition-content"
            >
                <div className="calories">
                    <FormInput
                        label='Calories'
                        type='input'
                        name='calories'
                        value={props.nutrition.calories}
                        setData={props.setNutrition}
                    />
                </div>
                <div className="protien">
                    <FormInput
                        label='Protien'
                        type='input'
                        name='protein'
                        value={props.nutrition.protein}
                        setData={props.setNutrition}
                    />
                </div>
                <div className="fat">
                    <FormInput
                        label='Fat'
                        type='input'
                        name='fat'
                        value={props.nutrition.fat}
                        setData={props.setNutrition}
                    />
                </div>
                <div className="carbs">
                    <FormInput
                        label='Carbs'
                        type='input'
                        name='carbs'
                        value={props.nutrition.carbs}
                        setData={props.setNutrition}
                    />
                </div>
            </div>
        </div>
    )
}

export default Nutrition