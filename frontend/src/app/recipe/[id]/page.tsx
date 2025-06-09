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

interface Review {
  user: {
    _id: string;
    email: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

const recipe = () => {

  const { id } = useParams()

  const [token, setToken] = useState("")
  const [currentUser, setCurrentUser] = useState({})
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

  const [reviews, setReviews] = useState<Review[]>([{
    user: { _id: '', email: '' },
    rating: 0,
    comment: "",
    createdAt: ""
  }])

  const [newReview, setNewReview] = useState({
    user: currentUser,
    rating: 0,
    comment: "",
    createdAt: ""
  })

  const [addClick, setAddClick] = useState(false)

  useEffect(() => {
    fetchAccessToken()
    fetchRecipeData()
  }, [])

  const fetchAccessToken = async () => {
    const result = await APIFetchRequest(
      `${fetchServerEndpointRecipe()}/api/auth/token`,
    )

    if(result.success) {
      setToken(result.data.accessToken)
      setCurrentUser(result.data.data)
    } else {
      throw new Error("Failed to fetch access token")
    }
  }

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
    console.log(result.data.reviews);
    
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
    try {
        // Validate review data
        if (!newReview.rating || !newReview.comment) {
            alert("Please provide both rating and comment")
            return
        }

        // Prepare review data
        const reviewData = {
            recipeId: id,
            rating: Number(newReview.rating),
            comment: newReview.comment,
            userId: currentUser
        }

        // Send review to backend
        const result = await APIFetchRequestWithToken(
            `${fetchServerEndpointRecipe()}/api/recipe/add-review/${id}`,
            token,
            'POST',
            reviewData
        )

        if (!result) {
            throw new Error('Failed to submit review')
        }

        const { response, newToken } = result
        console.log(`Response after api req: ${response}`);
        
        if (newToken) {
            setToken(newToken as unknown as string)
        }

        if (!response.success) {
            console.log(`Error while converting response to json : ${response.message}`);
            
            throw new Error(response.message || 'Failed to submit review')
        }
        else
        {
          setReviews(prevReviews => [...prevReviews, response.data])
            
            // Reset form
            setNewReview({
                user: currentUser,
                rating: 0,
                comment: "",
                createdAt: ""
            })
            setAddClick(false)
            
            // Show success message
            alert("Review submitted successfully!")
            window.location.reload()
        }
      
    } catch (error: any) {
        console.error('Error submitting review:', error?.message)
        alert(error?.message || 'Failed to submit review. Please try again.')
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
          {reviews.length > 0 && reviews[0].comment !== "" ? reviews.map((review, index) => (
            <div className="review-card" key={index}>
                <div className="review-card-header">
                    <div className="review-card-header-user">
                        {review.user?.email || 'Anonymous User'}
                    </div>
                    <div className="review-card-header-rating">
                        Rating: {review.rating} / 5
                    </div>
                </div>
                <div className="review-card-body">
                    {review.comment}
                </div>
                <div className="review-card-footer">
                    Posted on: {new Date(review.createdAt).toLocaleDateString()}
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