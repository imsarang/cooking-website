import React from 'react'
import '@/styles/view/steps.css'
import { FaPlus, FaTrash } from 'react-icons/fa'

interface StepsInterface {
    steps: 
        {
            stepNumber: number,
            description: string,
            image?: string,
            video?: string
        }[]
    ,
}

const Steps = ({ ...props }: StepsInterface) => {
    return (
        <div className='view-recipe-steps'>
            <div className="view-recipe-steps-header">
                Steps to Cook
            </div>
            <div className="view-recipe-steps-main">
                {
                    props.steps.map((item, index) => {
                        return <div
                            className="view-recipe-step"
                            key={item.stepNumber}
                            data-action='null'
                        >
                            <div
                                className="view-recipe-step-header"
                                data-action='null'
                            >
                                <div className="view-recipe-step-number">
                                    Step {item.stepNumber + 1}
                                </div>
                            </div>
                            <div className="view-recipe-step-description">
                                <p className="recipe-step-para">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    })
                }
            </div>
        </div>
    )
}

export default Steps