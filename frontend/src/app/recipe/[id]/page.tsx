"use client";

import React, { useRef } from 'react'
import { useParams } from 'next/navigation'
import { useState, useEffect } from "react"

import GeneralInformation from '@/components/recipe/GeneralInformation'
import Ingredients from '@/components/recipe/Ingredients'
import Steps from '@/components/recipe/Steps'
import Media from '@/components/recipe/Media'
import Nutrition from '@/components/recipe/Nutrition';
import { APIFetchRequest, APIFetchRequestWithToken, fetchServerEndpointRecipe } from '@/middleware/common';

import '@/styles/view/review.css'
import '@/styles/view/recipe.css'
import { fetchFromLocalStorage } from '@/utils/LocalStorage';
import { useRouter } from 'next/navigation';
const recipe = () => {

  const { id } = useParams()

  const [token, setToken] = useState("")
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [recipe, setRecipe] = useState({
    title: "",
    description: "",
    prepTime: "",
    cookTime: "",
    totalTime: "",
    servings: "",
    cuisine: "",
    category: "",
    difficulty: "",
    author: "",
    image: "",
    video: ""
  })

  const [nutrition, setNutrition] = useState({
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    // add more if needed
  })

  const [ingredients, setIngredients] = useState([{
    index: Date.now(),
    name: "",
    quantity: ""
  }],)

  const [steps, setSteps] = useState(
    [{
      stepNumber: 0,
      description: "",
      image: "",
      video: ""
    }]
  )

  const [media, setMedia] = useState({
    image: "",
    video: ""
  })

  const [reviews, setReviews] = useState([{
    user: "",
    rating: 0,
    comment: "",
    date: ""
  }])

  const [newReview, setNewReview] = useState({
    user: "",
    rating: 0,
    comment: "",
    date: ""
  })

  const [addClick, setAddClick] = useState(false)

  useEffect(() => {
    setToken(fetchFromLocalStorage("AccessToken") as string)
    fetchRecipeData()
  }, [])

  const fetchRecipeData = async () => {
    console.log(`Recipe Id : ${id}`);
    setLoading(true)
    // if(!id) return
    const result = await APIFetchRequest(
      `${fetchServerEndpointRecipe()}/api/recipe/view/${id}`,
      'GET'
    )

    console.log(`Result : ${result.data}, Success: ${result.success}`);
    console.log(result.data.general);
    
    if (result.success) {
      setRecipe(result.data.general)
      setNutrition(result.data.nutrition)
      setIngredients(result.data.ingredients)
      setSteps(result.data.steps)
      setMedia(result.data.media)
      setReviews(result.data.reviews)
    }
    setLoading(false)
  }

  const handleAddReview = () => {
    // Logic to add a review
    setAddClick(!addClick)
  }

  const handleCloseAddReview = () => {
    setAddClick(!addClick)
  }

  const handleAddReviewChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewReview({
      ...newReview,
      [e.target.name]: e.target.value
    })
  }
  const handleAddReviewSubmit = async () => {
    // Logic to submit the review

    const sendBackend = await APIFetchRequestWithToken(
      `${fetchServerEndpointRecipe()}/api/recipe/view/${id}`,
      token,
      'POST',
      newReview
    )

    if (sendBackend.ok) {
      setReviews([
        ...reviews,
        {
          user: newReview.user,
          rating: newReview.rating,
          comment: newReview.comment,
          date: new Date().toLocaleDateString()
        }
      ])
      setNewReview({
        user: "",
        rating: 0,
        comment: "",
        date: ""
      })
      setAddClick(false)
      router.push('/')
    }
  }

  // if (!recipe) return <p>Loading...</p>
  if(loading) return <p>Loading...</p>

  return (
    <div className='recipe-container'>
      <div className="recipe-main">

        <div className="recipe-text">
          <GeneralInformation
            title={recipe.title}
            description={recipe.description}
            prepTime={recipe.prepTime}
            cookTime={recipe.cookTime}
            totalTime={recipe.totalTime}
            servings={recipe.servings}
            cuisine={recipe.cuisine}
            category={recipe.category}
            difficulty={recipe.difficulty}
          />
          <Nutrition
            nutrition={nutrition}
          />

          <Ingredients
            ingredients={ingredients}
          />

          <Steps
            steps={steps}
          />
        </div>
        <Media
          media={media}
        />
      </div>
      <div className="reviews">
        <div className='reviews-header'>
          <div className="reviews-header-heading">
            Reviews
          </div>
          <div className="reviews-heading-btn">
            <button
              className="add-review-btn"
              onClick={() => handleAddReview()}>
              Add Review
            </button>
          </div>
        </div>
        <div className="all-reviews">
          {
            addClick ?
              <div className="add-review">
                <div className="add-review-header">
                  <div className="add-review-header-title">
                    Add Review
                  </div>
                  <div className="add-review-header-close">
                    <button
                      className="add-review-close-btn"
                      onClick={() => handleCloseAddReview()}>
                      X
                    </button>
                  </div>
                </div>
                <div className="add-review-body-rating">
                  <input
                    type="text"
                    placeholder='Rating'
                    name='rating'
                    value={newReview.rating}
                    onChange={(e) => handleAddReviewChange(e)}
                    className='rating-input'
                  />
                </div>
                <div className="add-review-body-comment">
                  <textarea
                    placeholder='Comment'
                    value={newReview.comment}
                    name='comment'
                    onChange={(e) => handleAddReviewChange(e)}
                    className='comment-textarea'
                  >
                    {newReview.comment}
                  </textarea>
                </div>
                <div className="add-review-footer">
                  <button
                    className="add-review-submit-btn"
                    onClick={() => handleAddReviewSubmit()}>
                    Submit
                  </button>
                </div>
              </div>
              :
              <></>
          }
          {reviews.length > 1 ? reviews.map((review, index) => (
            <div className="review-card" key={index}>
              <div className="review-card-header">
                <div className="review-card-header-user">
                  {review.user}
                </div>
                <div className="review-card-header-rating">
                  Rating : {review.rating} / 5
                </div>
              </div>
              <div className="review-card-body">
                Comment : {review.comment}
              </div>
              <div className="review-card-footer">
                Date : {review.date}
              </div>
            </div>
          ))
            :
            <div className="no-reviews">
              No reviews yet. Be the first to review!
            </div>
          }
        </div>
      </div>
    </div>

  )
}

export default recipe