import {Listener,OrderCreatedEvent,Subjects} from '@sgtickets/common';
import {Message} from 'node-nats-streaming';
import {Order} from '../../models/order';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject=Subjects.OrderCreated;
    queueGroupName='payments-service';

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        
        const order=Order.build({
            id:data.id,
            version:data.version,
            userId:data.userId,
            price:data.ticket.price,
            status:data.status
        });
        await order.save();
        msg.ack();
    }

}