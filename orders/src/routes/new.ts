import express, { Request, Response } from "express";
import { requireAuth,validateRequest,NotFoundError,OrderStatus, BadRequestError } from "@sgtickets/common";
import {body} from 'express-validator';
import {Order,Ticket} from '../models';
import {OrderCreatedPublisher} from '../events/publishers';
import { natsWrapper } from "../nats_wrapper";

const router = express.Router();

router.post('/api/orders', requireAuth,[
    body('ticketId').not()
    .isEmpty()
    .withMessage('TicketId must be provided')
],validateRequest, async (req: Request, res: Response) => {
    
    const {ticketId}=req.body;
    const ticket=await Ticket.findById(ticketId);
    if(!ticket){
        throw new NotFoundError();
    }

    const isReserved=await ticket.isReserved();
    if(isReserved){
        throw new BadRequestError("Ticket is already reserved");
    }

    const expiration=new Date();
    expiration.setSeconds(expiration.getSeconds()+15*60);
    const order=Order.build({
        userId:req.currentUser!.id,
        status:OrderStatus.Created,
        expiresAt:expiration,
        ticket:ticket
    })

    await order.save();

    new OrderCreatedPublisher(natsWrapper.client).publish({
        id:order.id,
        version:order.version,
        status:order.status,
        userId:order.userId,
        expiresAt:order.expiresAt.toISOString(),
        ticket:{
            id:ticket.id,
            price:ticket.price
        }
    })

    res.status(201).send(order);

})

export { router as newOrderRouter };