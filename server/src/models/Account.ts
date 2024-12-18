import { type Document, model, Schema } from 'mongoose'
import { type Account } from '../@types'

interface I extends Document, Account {email: string, phone?:number, avatar?:string}

const instance = new Schema<I>(
  {
    /*
      document ID is set by default via MongoDB - the next line is deprecated!
      _id: mongoose.Schema.Types.ObjectId,
    */

    username: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ['user', 'admin'],
      default: 'user',
    },
    phone: {
      type: Number,
      required: false,
    },
    avatar: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
)

// NOTE! use a singular model name, mongoose automatically creates a collection like so:
// model: 'Account' === collection: 'accounts'
const modelName = 'Account'

export default model<I>(modelName, instance)

