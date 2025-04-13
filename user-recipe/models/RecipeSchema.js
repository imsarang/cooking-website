import mongoose from 'mongoose'

const RecipeSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true,
    },
    description: String,
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
    image: String, // Main recipe image URL
    video: String, // Main recipe video URL
    tags: [String], // e.g. ["vegan", "gluten-free"]
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: Date,
  });

  const Recipe = mongoose.models.Recipe || mongoose.model('Recipe', RecipeSchema)
  export default Recipe
  