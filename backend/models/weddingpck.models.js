import mongoose from 'mongoose';
const pckschema=new mongoose.Schema({
    pckCode:{
        type:String,
        required:true,
    },
    packageName:{
        type:String,
        required:true,
    },
    price:{
        type:Number,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    image:{
        type:String,
    }
    },
{
   timestamps:true,
    }
);

const pck=mongoose.model('Package',pckschema);
export default pck;