import { Toast } from "@/components/ui/use-toast";

/**
 * Types of subscription-related error responses from the server
 */
export enum SubscriptionErrorType {
  PAYMENT_FAILED = "payment_failed",
  CARD_DECLINED = "card_declined",
  ALREADY_SUBSCRIBED = "already_subscribed",
  TRIAL_ENDED = "trial_ended",
  SUBSCRIPTION_NOT_FOUND = "subscription_not_found",
  STRIPE_ERROR = "stripe_error",
  INVALID_PLAN = "invalid_plan",
  SERVICE_UNAVAILABLE = "service_unavailable",
  UNKNOWN = "unknown",
}

/**
 * Subscription error response structure from server
 */
export interface SubscriptionErrorResponse {
  error: {
    type: SubscriptionErrorType;
    message: string;
    code?: number;
    details?: any;
  };
}

/**
 * Parses error responses from subscription API calls and provides user-friendly messages
 * 
 * @param error - The error object from the failed API call
 * @param translate - Translation function (passes through the string if no translation is provided)
 * @returns An object with title and description for display in toast notifications
 */
export function handleSubscriptionError(
  error: any, 
  translate: (key: string) => string = (key) => key
): { title: string; description: string } {
  // Default error message
  let title = translate("Subscription Error");
  let description = translate("An error occurred while processing your subscription. Please try again later.");
  
  // Try to parse the error response
  try {
    // Handle error responses in standard format
    if (error.error && error.error.type) {
      const errorType = error.error.type as SubscriptionErrorType;
      
      switch (errorType) {
        case SubscriptionErrorType.PAYMENT_FAILED:
          title = translate("Payment Failed");
          description = translate("Your payment could not be processed. Please check your payment details and try again.");
          break;
          
        case SubscriptionErrorType.CARD_DECLINED:
          title = translate("Card Declined");
          description = translate("Your card was declined. Please use a different payment method or contact your bank.");
          break;
          
        case SubscriptionErrorType.ALREADY_SUBSCRIBED:
          title = translate("Already Subscribed");
          description = translate("You already have an active subscription to this plan.");
          break;
          
        case SubscriptionErrorType.TRIAL_ENDED:
          title = translate("Trial Ended");
          description = translate("Your free trial has ended. Please choose a subscription plan to continue.");
          break;
          
        case SubscriptionErrorType.SUBSCRIPTION_NOT_FOUND:
          title = translate("Subscription Not Found");
          description = translate("We couldn't find your subscription. Please contact support if you believe this is an error.");
          break;
          
        case SubscriptionErrorType.STRIPE_ERROR:
          title = translate("Payment Processing Error");
          description = translate("There was an error processing your payment. Please try again or use a different payment method.");
          break;
          
        case SubscriptionErrorType.INVALID_PLAN:
          title = translate("Invalid Plan");
          description = translate("The selected subscription plan is not valid. Please choose a different plan.");
          break;
          
        case SubscriptionErrorType.SERVICE_UNAVAILABLE:
          title = translate("Service Unavailable");
          description = translate("The subscription service is temporarily unavailable. Please try again later.");
          break;
          
        default:
          // Use the message from the error if available
          if (error.error.message) {
            description = error.error.message;
          }
      }
    } else if (error.message) {
      // Simple error with just a message
      description = error.message;
    } else if (typeof error === 'string') {
      // String error
      description = error;
    }
  } catch (parseError) {
    // If we can't parse the error, use the default message
    console.error("Error parsing subscription error:", parseError);
  }
  
  return { title, description };
}

/**
 * Creates a toast configuration object for subscription errors
 * 
 * @param error - The error object from the failed API call
 * @param translate - Translation function
 * @returns Toast configuration object
 */
export function createSubscriptionErrorToast(
  error: any,
  translate: (key: string) => string = (key) => key
): Toast {
  const { title, description } = handleSubscriptionError(error, translate);
  
  return {
    title,
    description,
    variant: "destructive",
  };
}

/**
 * Extracts the error code from a subscription error response
 * 
 * @param error - The error object from the failed API call
 * @returns The error code or null if not found
 */
export function getSubscriptionErrorCode(error: any): number | null {
  try {
    if (error.error && error.error.code) {
      return error.error.code;
    }
    return null;
  } catch {
    return null;
  }
}