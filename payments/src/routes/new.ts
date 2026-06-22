import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { BadRequestError, requireAuth, validateRequest, NotAuthorizedError, NotFoundError, OrderStatus } from '@sgtickets/common';
import { Order,Payment } from '../models';
import { stripe } from '../stripe';
import {PaymentCreatedPublisher} from '../events/publishers';
import { natsWrapper } from '../nats_wrapper';

const router = express.Router();

router.post('/api/payments',
    requireAuth,
    [body('token').notEmpty(), body('orderId').notEmpty()],
    validateRequest,
    async (req: Request, res: Response) => {

        const { token, orderId } = req.body;

        const order = await Order.findById(orderId);

        if (!order) {
            throw new NotFoundError();
        }

        if (order.userId !== req.currentUser!.id) {
            throw new NotAuthorizedError();
        }

        if (order.status === OrderStatus.Cancelled) {
            throw new BadRequestError('Cannot pay for cancelled order');
        }

        const charge=await stripe.charges.create({
            currency: 'inr',
            amount: order.price * 100,
            source: token
        });

        const payment=Payment.build({
            orderId,
            stripeId:charge.id,
        });

        await payment.save();

        new PaymentCreatedPublisher(natsWrapper.client).publish({
            id:payment.id,
            orderId:payment.orderId,
            stripeId:payment.stripeId
        })

        res.status(201).send({ success: true });
    });

export { router as createPaymentRouter }