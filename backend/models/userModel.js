import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
        serviceName:{
                type: String,
                required: true
        },
        name:{
                type: String,
                required: true
        },
        email:{
                type: String,
                required: true
        },
        contactNumber:{
                type: String,
                required: true
        },
        date:{
                type: Date,
                required: true
        }
})

export default mongoose.model("Shedule", userSchema)