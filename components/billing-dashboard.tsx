"use client"

import { useState, useEffect } from "react"
import { Check, Sparkles, Zap } from "lucide-react"
import { getUserCredits } from "@/app/actions/get-user-credits"

const plans = [
  {
    name: "Starter",
    price: "$9",
    credits: "50 Credits",
    features: ["Standard generation speed", "720p Exports", "Community Support"],
    popular: false,
  },
  {
    name: "Pro",
    price: "$29",
    credits: "200 Credits",
    features: ["Fast generation", "1080p Exports", "Priority Support", "Remove Watermark"],
    popular: true,
  },
  {
    name: "Max",
    price: "$99",
    credits: "1000 Credits",
    features: ["Lightning generation", "4K Exports", "Dedicated Account Manager", "API Access"],
    popular: false,
  }
]

export function BillingDashboard() {
  const [credits, setCredits] = useState<number | null>(null)
  
  useEffect(() => {
    getUserCredits().then(setCredits)
  }, [])

  return (
    <div className="space-y-8 w-full max-w-4xl mx-auto py-2">
      {/* Current Credits Widget */}
      <div 
        className="rounded-2xl p-6 border relative overflow-hidden"
        style={{
          background: "oklch(0.13 0.014 285)",
          borderColor: "oklch(1 0 0 / 0.07)",
        }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary opacity-10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-foreground mb-1 flex items-center gap-2">
              <Zap className="size-5 text-brand-secondary" />
              Available Credits
            </h3>
            <p className="text-sm text-muted-foreground">Used for generating and exporting videos.</p>
          </div>
          <div className="text-4xl font-bold tracking-tight" style={{ color: "oklch(0.96 0.005 285)" }}>
            {credits === null ? "..." : credits}
          </div>
        </div>
      </div>

      {/* Pricing Table */}
      <div>
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Buy Extra Credits</h2>
          <p className="text-sm text-muted-foreground">Choose a plan that fits your creative needs.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div 
              key={plan.name}
              className={`relative rounded-2xl p-6 border flex flex-col ${plan.popular ? 'border-primary/50 bg-primary/5' : 'border-white/10 bg-white/5'}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground flex items-center gap-1 shadow-lg shadow-primary/20">
                  <Sparkles className="size-3" /> Most Popular
                </div>
              )}
              
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-foreground mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">/month</span>
                </div>
              </div>
              
              <div className="py-4 border-y border-white/10 mb-4">
                <div className="text-lg font-semibold text-brand-secondary">{plan.credits}</div>
              </div>
              
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map(feat => (
                  <li key={feat} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="size-4 text-emerald-400 mt-0.5 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              
              <button 
                className={`w-full h-10 rounded-lg font-medium text-sm transition-all ${
                  plan.popular 
                    ? 'gradient-brand text-white shadow-lg shadow-primary/20 hover:opacity-90' 
                    : 'bg-white/10 text-foreground hover:bg-white/20'
                }`}
                onClick={() => alert('Stripe Checkout will open here. Currently in UI mode.')}
              >
                Choose {plan.name}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
