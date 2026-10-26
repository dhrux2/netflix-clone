/** The public showcase is static; local development retains the account API. */
export const guestShowcase = import.meta.env.VITE_GUEST_SHOWCASE === 'true';
