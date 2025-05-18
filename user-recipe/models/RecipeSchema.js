import mongoose from 'mongoose'

const RecipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true, // Ensure title is unique
    trim: true, // Remove extra spaces
    maxlength: 100, // Limit title length
  },
  description: String,
  nutrition: {
    calories: Number,
    protein: String,
    carbs: String,
    fat: String,
    // add more if needed
  },
  ingredients: [
    {
      name: String,
      quantity: String,
    },
  ],
  steps: [
    {
      stepNumber: Number,
      description: String,
      image: String, // Optional image per step
      video: String, // Optional video per step
    },
  ],
  prepTime: Number, // in minutes
  cookTime: Number, // in minutes
  totalTime: Number, // computed or manually added
  servings: Number,
  cuisine: String, // e.g. "Italian", "Mexican"
  category: String, // e.g. "Dessert", "Main Dish"
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  veg: Boolean,
  image: String, // Main recipe image URL
  video: String, // Main recipe video URL
  tags: [String], // e.g. ["vegan", "gluten-free"]
  createdAt: {
    type: Date,
    default: Date.now,
  },
  favouritedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }
  ],
  dowloads: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }
  ],
  reviews: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: {
        type: String,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      }
    }
  ],
  averageRating: {
    type: Number,
    default: 0,
  },
  searchTags:{
    type: String,
  },
  updatedAt: Date,
});

RecipeSchema.index({
  title: 1,
  category: 1,
})

const Recipe = mongoose.models.Recipe || mongoose.model('Recipe', RecipeSchema)
export default Recipe
