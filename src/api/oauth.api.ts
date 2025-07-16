import { baseApi } from './baseApi';

export interface UnlinkGoogleResponse {
  message: string;
  user: {
    id: number;
    email: string;
    google_id: string | null;
    provider: string | null;
  };
}

export interface UnlinkGoogleError {
  error: string;
}

export const oauthApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    unlinkGoogle: builder.mutation<UnlinkGoogleResponse, void>({
      query: () => ({
        url: 'oauth/google/unlink',
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useUnlinkGoogleMutation,
} = oauthApi; 