import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export async function POST(request: NextRequest) {
  try {
    console.log('Creating financial connections session...');

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe secret key not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { userId, customerId, permissions, filters } = body as {
      userId?: string;
      customerId?: string;
      permissions?: string[];
      filters?: {
        countries?: string[];
        account_subcategories?: string[];
      };
    };

    // Get authorization token from headers
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    // If customerId not provided, try to fetch it from backend
    let stripeCustomerId = customerId;
    let userEmail: string | undefined;
    let userPhone: string | undefined;
    
    if (!stripeCustomerId && token && userId) {
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
          stripeCustomerId = userData.customer?.id;
          userEmail = userData.email;
          userPhone = userData.phone;
          console.log('Fetched user data from backend:', { 
            customerId: stripeCustomerId, 
            email: userEmail 
          });
        }
      } catch (error) {
        console.warn('Failed to fetch user data from backend:', error);
      }
    }

    // If no customer ID exists, create a new Stripe customer
    if (!stripeCustomerId) {
      try {
        console.log('Creating new Stripe customer...');
        const customerParams: Stripe.CustomerCreateParams = {};
        
        if (userEmail) {
          customerParams.email = userEmail;
        }
        if (userPhone) {
          customerParams.phone = userPhone;
        }
        
        // Add metadata to link the customer to the user
        if (userId) {
          customerParams.metadata = {
            user_id: userId,
          };
        }

        const newCustomer = await stripe.customers.create(customerParams);
        stripeCustomerId = newCustomer.id;
        console.log('Created new Stripe customer:', stripeCustomerId);

        // Optionally, update the backend with the new customer ID
        if (token && userId) {
          try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.koajo.com';
            await fetch(`${apiUrl}/v1/auth/create-customer`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                stripe_customer_id: stripeCustomerId,
              }),
            });
            console.log('Backend updated with new customer ID');
          } catch (updateError) {
            console.warn('Failed to update backend with customer ID:', updateError);
            // Don't fail the request if backend update fails
          }
        }
      } catch (createError) {
        console.error('Failed to create Stripe customer:', createError);
        return NextResponse.json(
          { 
            error: 'Failed to create Stripe customer',
            details: createError instanceof Error ? createError.message : 'Unknown error'
          },
          { status: 500 }
        );
      }
    }

    if (!stripeCustomerId) {
      return NextResponse.json(
        { error: 'Unable to get or create Stripe customer ID' },
        { status: 500 }
      );
    }

    // Get the origin from the request headers
    // Stripe requires HTTPS URLs for return_url
    let origin = request.headers.get('origin');

    console.log('Origin:', origin);
    
    // If no origin header, try to extract from referer
    if (!origin) {
      const referer = request.headers.get('referer');
      if (referer) {
        try {
          const url = new URL(referer);
          origin = url.origin;
        } catch {
          console.warn('Failed to parse referer URL:', referer);
        }
      }
    }
    
    // Convert HTTP to HTTPS if needed (Stripe requires HTTPS)
    if (origin && origin.startsWith('http://')) {
      origin = origin.replace('http://', 'https://');
    }
    
    // If no origin or still localhost/127.0.0.1, use production URL from env
    if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      origin = process.env.NEXT_PUBLIC_BASE_URL || 'https://koajo.com';
    }
    
    // Ensure origin is a valid URL
    if (!origin || (!origin.startsWith('http://') && !origin.startsWith('https://'))) {
      origin = 'https://koajo.com';
    }
    
    // Ensure origin doesn't have trailing slash
    origin = origin.replace(/\/$/, '');
    
    // Construct return URL with proper encoding
    const returnUrl = `${origin}/settings/suscriptions?bank_connection=complete`;
    
    // Validate the URL before using it
    try {
      new URL(returnUrl);
    } catch {
      console.error('Invalid return URL constructed:', returnUrl);
      return NextResponse.json(
        { error: 'Failed to construct valid return URL', details: 'Invalid URL format' },
        { status: 500 }
      );
    }
    
    console.log('Using return URL:', returnUrl);

    // Create Financial Connections session
    // account_holder is required - must be a Stripe customer ID
    const sessionParams: Stripe.FinancialConnections.SessionCreateParams = {
      account_holder: {
        type: 'customer',
        customer: stripeCustomerId,
      },
      permissions: (permissions || ['ownership']) as Stripe.FinancialConnections.SessionCreateParams.Permission[],
      filters: filters ? {
        ...filters,
        account_subcategories: filters.account_subcategories as Stripe.FinancialConnections.SessionCreateParams.Filters.AccountSubcategory[],
      } : {
        countries: ['US'],
        account_subcategories: ['checking', 'savings'] as Stripe.FinancialConnections.SessionCreateParams.Filters.AccountSubcategory[],
      },
      return_url: returnUrl,
    };
    
    const session = await stripe.financialConnections.sessions.create(sessionParams);

    console.log('Financial connections session created:', {
      id: session.id,
      client_secret: session.client_secret?.substring(0, 20) + '...',
    });

    // Financial Connections sessions don't have a direct URL property
    // The client_secret is used to initialize the session on the frontend
    // But we can construct a redirect URL if needed
    return NextResponse.json({
      session_id: session.id,
      client_secret: session.client_secret,
      // Note: Stripe Financial Connections uses client_secret for frontend initialization
      // The actual connection flow is handled via Stripe.js or redirect
    }, {
      status: 200,
      headers: { 'Cache-Control': 'no-store' }
    });
  } catch (error) {
    console.error('Error creating financial connections session:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Failed to create financial connections session',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

