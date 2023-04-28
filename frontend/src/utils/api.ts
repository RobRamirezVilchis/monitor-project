const baseBackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const api = {
  baseURL: baseBackendUrl,
  endpoints: {
    auth: {
      // https://dj-rest-auth.readthedocs.io/en/latest/api_endpoints.html
      login: "/api/auth/login/",
      social: {
        google: {
          login: "/api/auth/social/google/",
          connect: "/api/auth/social/google/connect/",
        },
      },
      connectedSocialAccounts: "/api/auth/socialaccounts/",
      disconnectSocialAccount: (socialAccountId: number) => `/api/auth/socialaccounts/${socialAccountId}/disconnect/`,
      register: "/api/auth/register/",
      registerTokenValidity: "/api/auth/register/token-valid/",
      registerVerifyEmail: "/api/auth/register/verify-email/",
      registerResendEmail: "/api/auth/register/resend-email/",
      logout: "/api/auth/logout/",
      user: "/api/auth/user/",
      passwordResetRequest: "/api/auth/password/reset/",
      passwordResetValidity: "/api/auth/password/reset-token-valid/",
      passwordResetConfirm: "/api/auth/password/reset/confirm/",
      passwordChange: "/api/auth/password/change/",
    },
  }
};

export default api;
