import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type UserTier = 'freemium' | 'pro';

interface SubscriptionData {
  tier: UserTier;
  dailyGenerations: number;
  maxGenerations: number;
  features: string[];
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData>({
    tier: 'freemium',
    dailyGenerations: 0,
    maxGenerations: 10,
    features: ['basic_effects', 'short_prompts']
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchSubscription = async () => {
    try {
      // TEMPORAL: Modo Pro habilitado para todos durante testing
      // TODO: Implementar query real cuando tengamos tabla de subscriptions
      const mockData: SubscriptionData = {
        tier: 'pro', // HABILITADO PARA TESTING
        dailyGenerations: 3,
        maxGenerations: 999, // Unlimited for testing
        features: ['all_effects', 'long_prompts', 'advanced_controls']
      };
      
      setSubscription(mockData);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const canUseProFeatures = () => subscription.tier === 'pro';
  
  const canGenerate = () => subscription.dailyGenerations < subscription.maxGenerations;

  const getFeatureAccess = () => ({
    advancedControls: canUseProFeatures(),
    longPrompts: canUseProFeatures(),
    allEffects: canUseProFeatures(),
    unlimitedGenerations: canUseProFeatures()
  });

  return {
    subscription,
    loading,
    canUseProFeatures,
    canGenerate,
    getFeatureAccess,
    refreshSubscription: fetchSubscription
  };
};