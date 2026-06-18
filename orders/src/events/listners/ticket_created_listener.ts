import {Message} from 'node-nats-streaming';
import {Subjects,Listener,TicketCreatedEvent} from '@sgtickets/common';
import {Ticket} from '../../models';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
    readonly subject=Subjects.TicketCreated;
    queueGroupName='orders-service';

    async onMessage(data:TicketCreatedEvent['data'],msg:Message){
        const ticket=Ticket.build({
            id:data.id,
            title:data.title,
            price:data.price
        });

        await ticket.save();

        msg.ack();
    }
}
