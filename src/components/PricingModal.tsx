import React, { useState } from 'react';
import { X, Check, Zap, Shield, ArrowRight, CreditCard, Sparkles } from 'lucide-react';
import { PLANS } from '../data/mock-data';
import { PlanTier } from '../types/pc-saas';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (planId: PlanTier) => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, onSelectPlan }) => {
  const [selectedPlanId, setSelectedPlanId] = useState<PlanTier>('pro_ultimate');
  const [isProcessingStripe, setIsProcessingStripe] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [generatedLicenseKey, setGeneratedLicenseKey] = useState<string>('');

  if (!isOpen) return null;

  const handleSimulateStripeCheckout = (planId: PlanTier) => {
    if (planId === 'free') {
      onSelectPlan('free');
      onClose();
      return;
    }

    setIsProcessingStripe(true);
    setTimeout(() => {
      setIsProcessingStripe(false);
      setCheckoutSuccess(true);
      const fakeToken = 'PLC_' + Math.random().toString(36).substring(2, 10).toUpperCase() + '_' + Math.random().toString(36).substring(2, 6).toUpperCase();
      setGeneratedLicenseKey(fakeToken);
      onSelectPlan(planId);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
            Offre & Modèle Économique SaaS
          </span>
          <h2 className="text-2xl font-extrabold text-white">
            Tarification Simple, Transparente et Sans Abonnement Forcé
          </h2>
          <p className="text-xs text-slate-400">
            Du diagnostic gratuit pour tous les utilisateurs à la remise en état intégrale assistée par intelligence matérielle.
          </p>
        </div>

        {/* Success Banner if Simulated Checkout */}
        {checkoutSuccess ? (
          <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <Check className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white">Paiement Stripe Réussi (Simulation Sandbox)</h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Le webhook Stripe a vérifié la transaction et délivré votre jeton cryptographique débloquant l'exécution locale sécurisée.
            </p>
            <div className="inline-block p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-400">
              Jeton de Déblocage Machine : <strong>{generatedLicenseKey}</strong>
            </div>
            <div>
              <button
                onClick={onClose}
                className="mt-2 px-5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg cursor-pointer"
              >
                Accéder au Simulateur de Réparation
              </button>
            </div>
          </div>
        ) : (
          /* The 3 Plans Grid */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
            {PLANS.map((plan) => {
              const isSelected = selectedPlanId === plan.id;
              const isPro = plan.id === 'pro_ultimate';

              return (
                <div
                  key={plan.id}
                  className={`rounded-xl p-5 flex flex-col justify-between border transition-all ${
                    isPro
                      ? 'border-cyan-500/60 bg-gradient-to-b from-slate-900 to-slate-950 shadow-lg shadow-cyan-500/10'
                      : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase font-bold text-cyan-400">
                        {plan.badge}
                      </span>
                      {isPro && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                          Recommandé
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white">{plan.name}</h3>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-2xl font-black text-white font-mono tabular-nums">
                          {plan.priceEur === 0 ? '0 €' : `${plan.priceEur.toFixed(2)} €`}
                        </span>
                        <span className="text-xs text-slate-500">/ scan</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        {plan.description}
                      </p>
                    </div>

                    {/* Features list */}
                    <ul className="space-y-2 text-xs text-slate-300 pt-3 border-t border-slate-800/80">
                      {plan.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${isPro ? 'text-cyan-400' : 'text-slate-400'}`} />
                          <span className="text-[11px] leading-tight text-slate-300">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-800/80">
                    <button
                      onClick={() => handleSimulateStripeCheckout(plan.id)}
                      disabled={isProcessingStripe}
                      className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        isPro
                          ? 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-sm shadow-cyan-400/20'
                          : plan.id === 'essential'
                          ? 'bg-blue-600 hover:bg-blue-500 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      {plan.priceEur === 0 ? (
                        <span>Lancer le Scan Gratuit</span>
                      ) : (
                        <>
                          <CreditCard className="h-3.5 w-3.5" />
                          <span>Payer {plan.priceEur.toFixed(2)} € (Stripe)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-500">
          Stripe Checkout sécurisé TLS 1.3 · Aucun stockage de carte bancaire · Remboursement garanti si échec de réparation
        </div>
      </div>
    </div>
  );
};
