import mongoose from "mongoose";

interface PaymentAttrs{
    orderId:string,
    stripeId:string
}

interface PaymentDoc{
    orderId:string,
    stripeId:string
}

interface paymentModel extends mongoose.Model<PaymentDoc>{
    build(attrs:PaymentAttrs):mongoose.HydratedDocument<PaymentDoc>;
}

const paymentSchema =new mongoose.Schema({
    orderId:{
        type:String,
        required:true

    },
    stripeId:{
        type:String,
        required:true
    }
},{
    toJSON:{
        transform(doc:any,ret:any){
            ret.id=ret._id,
            delete ret._id
        }
    }
})

paymentSchema.statics.build = (attrs:PaymentAttrs) => {
    return new Payment(attrs);
}

const Payment = mongoose.model<PaymentDoc, paymentModel>("Payment", paymentSchema);

export { Payment };
