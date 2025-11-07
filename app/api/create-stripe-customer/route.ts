import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export async function POST(request: NextRequest) {
  try {
    console.log('Creating Stripe customer...');

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe secret key not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { userId, email, phone, name } = body as {
      userId?: string;
      email?: string;
      phone?: string;
      name?: string;
    };

    // Get authorization token from headers
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    // If user info not provided, try to fetch it from backend
    let userEmail = email;
    let userPhone = phone;
    let userName = name;

    if (!userEmail && token && userId) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.koajo.com';
        const userResponse = await fetch(`${apiUrl}/v1/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          userEmail = userData.email;
          userPhone = userData.phone;
          if (userData.first_name || userData.last_name) {
            userName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
          }
          console.log('Fetched user data from backend:', { email: userEmail, phone: userPhone });
        }
      } catch (error) {
        console.warn('Failed to fetch user data from backend:', error);
      }
    }

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Email is required to create a Stripe customer' },
        { status: 400 }
      );
    }

    // Create Stripe customer
    const customerParams: Stripe.CustomerCreateParams = {
      email: userEmail,
      description: userEmail ? `Customer for ${userEmail}` : undefined,
    };

    if (userPhone) {
      customerParams.phone = userPhone;
    }

    if (userName) {
      customerParams.name = userName;
    }

    // Add metadata to link the customer to the user
    if (userId) {
      customerParams.metadata = {
        user_id: userId,
      };
    }

    const customer = await stripe.customers.create(customerParams);
    console.log('Created new Stripe customer:', customer.id);

    // Update the backend with the new customer ID
    if (token && userId) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.koajo.com';
        const updateResponse = await fetch(`${apiUrl}/v1/auth/create-customer`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            stripe_customer_id: customer.id,
          }),
        });

        if (updateResponse.ok) {
          console.log('Backend updated with new customer ID');
        } else {
          console.warn('Failed to update backend with customer ID');
        }
      } catch (updateError) {
        console.warn('Failed to update backend with customer ID:', updateError);
        // Don't fail the request if backend update fails
      }
    }

    return NextResponse.json({
      customer: {
        id: customer.id,
        email: customer.email,
        phone: customer.phone,
        name: customer.name,
      },
    }, {
      status: 200,
      headers: { 'Cache-Control': 'no-store' }
    });
  } catch (error) {
    console.error('Error creating Stripe customer:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Failed to create Stripe customer',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}



