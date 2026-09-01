import mongoose from "mongoose";
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email:{
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password:{
    type: String,
    required: true
  }
}, {timeseries: true})


// Hashing password
userSchema.pre("save", async () => {
  if(!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(this.password, salt)
})

// Compare password
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password)
}

const userModel = mongoose.model("user", userSchema)

export default userModel;