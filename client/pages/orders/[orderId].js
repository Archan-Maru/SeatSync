import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Router from 'next/router';
import useRequest from '../../hooks/use-request';

const stripePromise = loadStripe(
  'pk_test_51TkqLOFSpiOYlI9BwA7UVtRdGFfN1CRl6aVlu6yFKnLiBGPLNA8Hf5vK3PhKEhnTc470Ohf15Ia0jur0VIS0JRv100j7rYaT7o'
);

const CheckoutForm = ({ order, currentUser }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const { doRequest, errors } = useRequest({
    url: '/api/payments',
    method: 'post',
    body: {
      orderId: order.id,
    },
    onSuccess: () => Router.push('/orders'),
  });

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };

    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, [order]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setPaying(true);

    const cardElement = elements.getElement(CardElement);
    const { error, token } = await stripe.createToken(cardElement);

    if (error) {
      console.error(error);
      setPaying(false);
      return;
    }

    await doRequest({ token: token.id });
    setPaying(false);
  };

  if (timeLeft < 0) {
    return <div>Order Expired</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <p>Time left to pay: {timeLeft} seconds</p>
      <p>Paying as: {currentUser.email}</p>
      <p>
        <strong>Amount: ₹{order.ticket.price.toFixed(2)}</strong>
      </p>
      <div
        style={{
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '10px',
          marginBottom: '15px',
        }}
      >
        <CardElement
          options={{
            hidePostalCode: true,
            style: {
              base: {
                fontSize: '16px',
                color: '#32325d',
                '::placeholder': { color: '#aab7c4' },
              },
              invalid: { color: '#fa755a' },
            },
          }}
        />
      </div>
      {errors}
      <button
        className="btn btn-primary"
        type="submit"
        disabled={!stripe || paying}
      >
        {paying ? 'Processing...' : `Pay ₹${order.ticket.price.toFixed(2)}`}
      </button>
    </form>
  );
};

const OrderShow = ({ order, currentUser }) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm order={order} currentUser={currentUser} />
    </Elements>
  );
};

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);

  return { order: data };
};

export default OrderShow;
