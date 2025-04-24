import { useEffect, useState } from 'react';
import { AlertCircle, X, Clock } from 'lucide-react';
import { useSubscription } from '@/hooks/use-subscription';
import { useTranslation } from '@/hooks/use-translation';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

/**
 * Subscription Status Banner Component
 * 
 * Displays a banner at the top of the application when there are important 
 * subscription status notifications, like trial expiration, payment issues,
 * or subscription cancellation.
 */
export function SubscriptionStatusBanner() {
  const { subscription, isLoading } = useSubscription();
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(true);
  const [hasDismissed, setHasDismissed] = useState(false);

  // Check if the banner has been dismissed in this session
  useEffect(() => {
    const dismissed = sessionStorage.getItem('subscription_banner_dismissed');
    if (dismissed === 'true') {
      setHasDismissed(true);
    }
  }, []);

  // Skip rendering if loading, no subscription, or banner was dismissed
  if (isLoading || !subscription || hasDismissed || !isVisible) {
    return null;
  }

  // Calculate days left in trial
  const daysLeftInTrial = subscription.trialEnd
    ? Math.max(0, Math.ceil((new Date(subscription.trialEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  // Calculate days left in billing period for canceled subscriptions
  const daysLeftInPeriod = subscription.currentPeriodEnd
    ? Math.ceil((new Date(subscription.currentPeriodEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Determine if there is any alert condition
  const isTrialExpiring = subscription.status === 'trialing' && daysLeftInTrial <= 3;
  const isTrialExpired = subscription.status === 'trialing' && daysLeftInTrial <= 0;
  const isCanceled = subscription.status === 'canceled' && daysLeftInPeriod <= 7;
  const isPastDue = subscription.status === 'past_due';

  // If there's no alert condition, don't render anything
  if (!isTrialExpiring && !isTrialExpired && !isCanceled && !isPastDue) {
    return null;
  }

  // Dismiss the banner
  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('subscription_banner_dismissed', 'true');
    setHasDismissed(true);
  };

  let backgroundColor = '';
  let textColor = '';
  let icon = null;
  let message = '';
  let actionText = '';

  // Set banner appearance based on the condition
  if (isTrialExpired) {
    backgroundColor = 'bg-red-500';
    textColor = 'text-white';
    icon = <AlertCircle className="h-5 w-5" />;
    message = t('Your trial has expired. Upgrade now to continue using premium features.');
    actionText = t('Upgrade');
  } else if (isTrialExpiring) {
    backgroundColor = 'bg-amber-500';
    textColor = 'text-white';
    icon = <Clock className="h-5 w-5" />;
    message = daysLeftInTrial === 1
      ? t('Your trial expires tomorrow. Upgrade now to maintain access to premium features.')
      : t(`Your trial expires in ${daysLeftInTrial} days. Upgrade now to maintain access.`);
    actionText = t('Upgrade');
  } else if (isPastDue) {
    backgroundColor = 'bg-red-500';
    textColor = 'text-white';
    icon = <AlertCircle className="h-5 w-5" />;
    message = t('Your subscription payment has failed. Please update your payment information.');
    actionText = t('Update Payment');
  } else if (isCanceled) {
    backgroundColor = 'bg-gray-500';
    textColor = 'text-white';
    icon = <AlertCircle className="h-5 w-5" />;
    message = daysLeftInPeriod <= 1
      ? t('Your subscription ends today. Resubscribe now to maintain access.')
      : t(`Your subscription ends in ${daysLeftInPeriod} days. Resubscribe to maintain access.`);
    actionText = t('Resubscribe');
  }

  return (
    <div className={`${backgroundColor} ${textColor} py-2 px-4 flex items-center justify-between`}>
      <div className="flex items-center space-x-2 text-sm">
        {icon}
        <span>{message}</span>
      </div>
      
      <div className="flex items-center space-x-2">
        <Link href="/subscription-plans">
          <Button size="sm" variant="secondary" className="h-8">
            {actionText}
          </Button>
        </Link>
        
        <button
          onClick={handleDismiss}
          className="rounded-full p-1 hover:bg-black/10 transition-colors"
          aria-label={t('Dismiss')}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}