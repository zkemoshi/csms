import { apiSlice } from './apiSlice';

const SESSIONS_URL = '/api/sessions';

export const sessionsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all sessions
    getSessions: builder.query({
      query: (params = {}) => ({
        url: `${SESSIONS_URL}`,
        method: 'GET',
        params,
      }),
    }),

    // Get session by ID
    getSessionById: builder.query({
      query: (id) => ({
        url: `${SESSIONS_URL}/${id}`,
        method: 'GET',
      }),
    }),

    // Get session by session ID
    getSessionBySessionId: builder.query({
      query: (sessionId) => ({
        url: `${SESSIONS_URL}/session/${sessionId}`,
        method: 'GET',
      }),
    }),

    // Get active sessions
    getActiveSessions: builder.query({
      query: () => ({
        url: `${SESSIONS_URL}/active`,
        method: 'GET',
      }),
    }),

    // Get completed sessions
    getCompletedSessions: builder.query({
      query: (params = {}) => ({
        url: `${SESSIONS_URL}/completed`,
        method: 'GET',
        params,
      }),
    }),

    // Get sessions by station
    getSessionsByStation: builder.query({
      query: ({ stationId, ...params }) => ({
        url: `${SESSIONS_URL}/station/${stationId}`,
        method: 'GET',
        params,
      }),
    }),

    // Get sessions by user (idTag)
    getSessionsByUser: builder.query({
      query: ({ idTag, ...params }) => ({
        url: `${SESSIONS_URL}/user/${idTag}`,
        method: 'GET',
        params,
      }),
    }),

    // Get session statistics
    getSessionStats: builder.query({
      query: (params = {}) => ({
        url: `${SESSIONS_URL}/stats`,
        method: 'GET',
        params,
      }),
    }),

    // Get sessions by date range
    getSessionsByDateRange: builder.query({
      query: (params) => ({
        url: `${SESSIONS_URL}/date-range`,
        method: 'GET',
        params,
      }),
    }),

    // Get pending OCPI sessions
    getPendingOcpiSessions: builder.query({
      query: () => ({
        url: `${SESSIONS_URL}/pending-ocpi`,
        method: 'GET',
      }),
    }),

    // Create session
    createSession: builder.mutation({
      query: (data) => ({
        url: `${SESSIONS_URL}`,
        method: 'POST',
        body: data,
      }),
    }),

    // Update session
    updateSession: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${SESSIONS_URL}/${id}`,
        method: 'PUT',
        body: data,
      }),
    }),

    // Complete session
    completeSession: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${SESSIONS_URL}/${id}/complete`,
        method: 'PUT',
        body: data,
      }),
    }),

    // Mark OCPI sent
    markOcpiSent: builder.mutation({
      query: (id) => ({
        url: `${SESSIONS_URL}/${id}/ocpi-sent`,
        method: 'PUT',
      }),
    }),

    // Delete session
    deleteSession: builder.mutation({
      query: (id) => ({
        url: `${SESSIONS_URL}/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useGetSessionsQuery,
  useGetSessionByIdQuery,
  useGetSessionBySessionIdQuery,
  useGetActiveSessionsQuery,
  useGetCompletedSessionsQuery,
  useGetSessionsByStationQuery,
  useGetSessionsByUserQuery,
  useGetSessionStatsQuery,
  useGetSessionsByDateRangeQuery,
  useGetPendingOcpiSessionsQuery,
  useCreateSessionMutation,
  useUpdateSessionMutation,
  useCompleteSessionMutation,
  useMarkOcpiSentMutation,
  useDeleteSessionMutation,
} = sessionsApiSlice;