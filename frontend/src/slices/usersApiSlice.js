import { apiSlice } from './apiSlice';
const USERS_URL = '/api/users';
const AUTH_URL = '/api/auth';

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

 
  // login user
  login: builder.mutation({
    query: (data) => ({
      url: `${USERS_URL}/login`,
      method: 'POST',
      body: data,
    }),
  }),
  // Get user info
  getUser: builder.query({
    query: () => ({
      url: `${USERS_URL}/`,
      method: 'GET',
    }),
  }),
 
  // logout user
    logout: builder.mutation({
      query: () => ({
        url: `${AUTH_URL}/logout`,
        method: 'POST',
      }),
    }),
  }),
});

export const {
  
  useLogoutMutation,
  useGetUserQuery,
  useLoginMutation,
  useLazyGetUserQuery,
} = usersApiSlice;
