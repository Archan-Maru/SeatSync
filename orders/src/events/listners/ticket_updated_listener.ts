import {Message} from 'node-nats-streaming';
import {Subjects,Listener,TicketUpdatedEvent, NotFoundError} from '@sgtickets/common';
import {Ticket} from '../../models';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent>{
    readonly subject=Subjects.TicketUpdated;
    queueGroupName='orders-service';

    async onMessage(data:TicketUpdatedEvent['data'],msg:Message){

        const ticket=await Ticket.findOne({
            _id: data.id,
            version: data.version-1
        });

        if(!ticket){
            throw new NotFoundError();
        }

        ticket.set({
            title:data.title,
            price:data.price
        });

        await ticket.save();

        msg.ack();
    }
}