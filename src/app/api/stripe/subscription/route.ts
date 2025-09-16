import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import Stripe from 'stripe'
import { WalletManager } from '@/lib/wallet-manager'

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil'
}) : null

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
    }
    
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { planId } = await request.json()
    const plan = WalletManager.PLANS[planId]
    
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }
    
    // Create or retrieve Stripe customer
    let customer
    const existingCustomers = await stripe.customers.list({
      email: session.user.email,
      limit: 1
    })
    
    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0]
    } else {
      customer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name || undefined,
        metadata: {
          userId: session.user.email
        }
      })
    }
    
    // Create checkout session for subscription
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Bitcoin Drive ${plan.name}`,
              description: plan.features.join(', '),
            },
            unit_amount: Math.round(plan.price * 100),
            recurring: {
              interval: 'month'
            }
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${request.headers.get('origin')}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/subscription/cancel`,
      metadata: {
        userId: session.user.email,
        planId
      }
    })
    
    return NextResponse.json({ 
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id 
    })
  } catch (error) {
    console.error('Stripe subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
}

// Handle subscription updates
export async function PUT(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
    }
    
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { planId } = await request.json()
    
    // Update subscription plan
    const newPlan = WalletManager.PLANS[planId]
    
    if (!newPlan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }
    
    // For subscription updates, we need to create a new price first
    // In production, you'd typically have pre-created price IDs
    // For now, we'll just return a message that plan changes require canceling and resubscribing
    return NextResponse.json({ 
      message: 'Plan changes require canceling current subscription and creating a new one',
      requiresNewSubscription: true 
    })
  } catch (error) {
    console.error('Subscription update error:', error)
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    )
  }
}

// Cancel subscription
export async function DELETE(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
    }
    
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { subscriptionId } = await request.json()
    
    // Cancel at period end (graceful cancellation)
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Subscription cancellation error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}