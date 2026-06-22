import { Subjects,Listener,PaymentCreatedEvent,OrderStatus } from "@sgtickets/common";
import {Message} from 'node-nats-streaming';
import {Order} from '../../models';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent>{

    readonly subject = Subjects.PaymentCreated;
    
    queueGroupName='orders-service';

    async onMessage(data:PaymentCreatedEvent['data'],msg:Message){
        const order = await Order.findById(data.orderId);

        if (!order) {
            throw new Error('Order not found');
        }

        order.set({
            status:OrderStatus.Complete
        });

        await order.save();

        msg.ack();
    }
}