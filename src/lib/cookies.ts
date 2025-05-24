import Cookies from 'js-cookie';

const ONBOARDING_COMPLETED_COOKIE = 'onboarding_completed';

export const hasCompletedOnboarding = (): boolean => {
  if (typeof window === 'undefined') return false;
  return Cookies.get(ONBOARDING_COMPLETED_COOKIE) === 'true';
};

export const setOnboardingCompleted = (): void => {
  if (typeof window === 'undefined') return;
  // Set cookie to expire in 1 year
  Cookies.set(ONBOARDING_COMPLETED_COOKIE, 'true', { 
    expires: 365,
    path: '/',
    sameSite: 'lax'
  });
};
