import React from 'react'
import '@/styles/create/steps.css'
import { FaPlus, FaTrash } from 'react-icons/fa'

interface StepsInterface {
    steps: [
        {
            stepNumber: number,
            description: string,
            image?: string,
            video?: string
        }
    ],
    handleCreateSteps: (e: React.FormEvent<HTMLDivElement>) => void,
    handleAddSteps: () => void,
    handleRemoveSteps: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
}

const Steps = ({ ...props }: StepsInterface) => {
    return (
        <div className='create-recipe-steps'>
            <div className="create-recipe-steps-header">
                Steps to Cook
            </div>
            <div className="create-recipe-steps-main">
                {
                    props.steps.map((item, index) => {
                        return <div
                            className="create-recipe-step"
                            onChange={(e) => props.handleCreateSteps(e)}
                            onClick={(e) => props.handleRemoveSteps(e)}
                            key={item.stepNumber}
                            data-action='null'
                        >
                            <div
                                className="create-recipe-step-header"
                                data-action='null'
                            >
                                <div className="create-recipe-step-number">
                                    Step {item.stepNumber + 1}
                                </div>
                                <div 
                                className="create-recipe-remove"
                                data-action="remove"
                                data-index={index}
                                >
                                    <FaTrash/>
                                </div>
                            </div>
                            <div className="create-recipe-step-description">
                                <textarea
                                    name="description"
                                    className="step-description-content"
                                    value={item.description}
                                    rows={5}
                                    cols={33}
                                    data-index={index}
                                    onChange={() => { }}
                                    data-action='null'
                                    required
                                >
                                    {/* {item.description} */}
                                </textarea>
                                <span className='create-steps-desc-label'>
                                    Description
                                </span>
                            </div>
                        </div>
                    })
                }
                <div className="add-step-btn-wrapper"
                    onClick={() => props.handleAddSteps()}
                >
                    <button
                        className="add-step-btn"
                    >
                        <FaPlus />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Steps