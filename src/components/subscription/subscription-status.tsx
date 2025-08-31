"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/user.store";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import paymentService from "@/services/payment.service";

export function SubscriptionStatus() {
  const { user } = useUserStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    try {
      setIsLoading(true);
      const response = await paymentService.initializePayment();
      if (response?.success && response?.authorizationUrl?.authorizationUrl) {
        // Save the payment reference to localStorage
        if (response.authorizationUrl.reference) {
          localStorage.setItem('paymentReference', response.authorizationUrl.reference);
        }
        
        // Add the reference to the success URL as a query parameter
        const successUrl = new URL(response.authorizationUrl.authorizationUrl);
        successUrl.searchParams.set('payment_reference', response.authorizationUrl.reference || '');
        
        // Redirect to Paystack checkout with the updated URL
        router.push(successUrl.toString())
      }
    } catch (error) {
      console.error("Failed to initialize payment:", error);
      toast.error("Failed to initialize payment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Check for successful payment when component mounts
  useEffect(() => {
    const checkPaymentStatus = async () => {
      // Check for reference in URL first (from Paystack redirect)
      const params = new URLSearchParams(window.location.search);
      const referenceFromUrl = params.get('reference') || params.get('trxref');
      
      // Fall back to localStorage if not in URL
      const reference = referenceFromUrl || localStorage.getItem('paymentReference');
      
      if (reference) {
        try {
          // Remove the reference from URL to prevent duplicate checks
          if (referenceFromUrl) {
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete('reference');
            newUrl.searchParams.delete('trxref');
            window.history.replaceState({}, '', newUrl.toString());
          }
          
          // Verify payment with your backend
          const { success } = await paymentService.verifyPayment(reference);
          if (success) {
            toast.success('Payment successful! Your subscription has been upgraded.');
          }
        } catch (error) {
          console.error('Error verifying payment:', error);
          toast.error('Failed to verify payment. Please contact support if you were charged.');
        } finally {
          localStorage.removeItem('paymentReference');
        }
      }
    };

    checkPaymentStatus();
  }, []);

  const isPremium = user?.subscription?.status === 'active' && 
                   (user.subscription.plan === 'premium' || user.subscription.plan === 'enterprise');

  if (!user) return null;

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant={isPremium ? "default" : "outline"}
        className={isPremium ? "bg-green-600 hover:bg-green-700" : ""}
      >
        {isPremium ? "Premium" : "Free"}
      </Badge>
      
      {!isPremium && (
        <Button 
          onClick={handleUpgrade}
          size="sm"
          variant="outline"
          className="border-orange-500 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Upgrade"
          )}
        </Button>
      )}
    </div>
  );
}