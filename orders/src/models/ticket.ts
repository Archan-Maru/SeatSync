import mongoose from "mongoose";
import { Order } from "./order";
import { OrderStatus } from "@sgtickets/common";

interface TicketAttrs{
    id:string;
    title:string;
    price:number;
}

export interface TicketDoc extends mongoose.Document{
    title:string;
    price:number;
    isReserved():Promise<Boolean>;
    version:number;
    id:string;
}

interface TicketModel extends mongoose.Model<TicketDoc>{
    build(attrs:TicketAttrs):TicketDoc;
}

const ticketSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true,
        min:0
    }
},{
    toJSON:{
        transform(doc,ret:any){
            ret.id=ret._id;
            delete ret._id;
        }
    }
});

ticketSchema.set('versionKey','version');
ticketSchema.pre('save', function () {
    this.$where = {
        ...this.$where,
        version: this.get('version')
    };
    this.increment();
});

ticketSchema.statics.build=(attrs:TicketAttrs)=>{
    return new Ticket({
        _id:attrs.id,
        title:attrs.title,
        price:attrs.price
    });
};

ticketSchema.methods.isReserved= async function () {
        const existingOrder=await Order.findOne({
        ticket:this,
        status:{
            $in: [
                OrderStatus.Created,
                OrderStatus.AwaitingPayment,
                OrderStatus.Complete
            ]
        }
    });

    return !!existingOrder;
}

const Ticket=mongoose.model<TicketDoc,TicketModel>('Ticket',ticketSchema);

export {Ticket};