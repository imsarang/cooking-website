import '@/styles/create/nutrition.css';
import React from 'react'

interface NutritionInterface {
    nutrition: {
        calories: string,
        protein: string,
        fat: string,
        carbs: string
    }
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
                    {props.nutrition.calories}
                </div>
                <div className="protien">
                    {props.nutrition.protein}
                </div>
                <div className="fat">
                    {props.nutrition.fat}
                </div>
                <div className="carbs">
                    {props.nutrition.carbs}
                </div>
            </div>
        </div>
    )
}

export default Nutrition