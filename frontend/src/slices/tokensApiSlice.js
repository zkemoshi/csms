import { apiSlice } from './apiSlice';

const TOKENS_URL = '/api/tokens';

export const tokensApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all tokens
    getTokens: builder.query({
      query: () => ({
        url: `${TOKENS_URL}`,
        method: 'GET',
      }),
    }),

    // Get token by idTag
    getTokenById: builder.query({
      query: (idTag) => ({
        url: `${TOKENS_URL}/${idTag}`,
        method: 'GET',
      }),
    }),

    // Create new token
    createToken: builder.mutation({
      query: (data) => ({
        url: `${TOKENS_URL}`,
        method: 'POST',
        body: data,
      }),
    }),

    // Update token
    updateToken: builder.mutation({
      query: ({ idTag, ...data }) => ({
        url: `${TOKENS_URL}/${idTag}`,
        method: 'PUT',
        body: data,
      }),
    }),

    // Delete token
    deleteToken: builder.mutation({
      query: (idTag) => ({
        url: `${TOKENS_URL}/${idTag}`,
        method: 'DELETE',
      }),
    }),

    // Activate token
    activateToken: builder.mutation({
      query: (idTag) => ({
        url: `${TOKENS_URL}/${idTag}/activate`,
        method: 'POST',
      }),
    }),

    // Block token
    blockToken: builder.mutation({
      query: (idTag) => ({
        url: `${TOKENS_URL}/${idTag}/block`,
        method: 'POST',
      }),
    }),

    // Get authorization settings
    getAuthorizationSettings: builder.query({
      query: () => ({
        url: `${TOKENS_URL}/settings/authorization`,
        method: 'GET',
      }),
    }),

    // Update authorization settings
    updateAuthorizationSettings: builder.mutation({
      query: (data) => ({
        url: `${TOKENS_URL}/settings/authorization`,
        method: 'PUT',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetTokensQuery,
  useGetTokenByIdQuery,
  useCreateTokenMutation,
  useUpdateTokenMutation,
  useDeleteTokenMutation,
  useActivateTokenMutation,
  useBlockTokenMutation,
  useGetAuthorizationSettingsQuery,
  useUpdateAuthorizationSettingsMutation,
} = tokensApiSlice;