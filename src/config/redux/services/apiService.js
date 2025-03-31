import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { BASE_URL } from "../../../utils/constants"

export const apiService = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL, // Replace with your base URL
    prepareHeaders: (headers, { getState }) => {
      // Get the token from Redux state
      const token = getState().general.token // Assuming the token is stored in `auth.token`

      // If we have a token, add it to the headers
      if (token) {
        headers.set("Authorization", `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ["cartList"],
  endpoints: (builder) => ({
    updateProfile: builder.mutation({
      query: (body) => ({
        url: "/api/profile/update",
        method: "POST",
        body,
      }),
    }),
    login: builder.mutation({
      query: (body) => ({
        url: "/api/auth/login",
        method: "POST",
        body,
      }),
    }),
    getListTransaction: builder.mutation({
      query: (body) => {
        const url =
          body?.page > 1
            ? `/api/profile/transaction/lists?page=${body?.page}`
            : `/api/profile/transaction/lists`
        return {
          url,
          method: "POST",
          body,
        }
      },
    }),
    updateTransactionStatus: builder.mutation({
      query: (body) => ({
        url: "/api/delivery/update",
        method: "POST",
        body,
      }),
    }),

    // cart
    getCartList: builder.query({
      query: () => "/api/cart/list",
      providesTags: ["cartList"],
    }),
    addCart: builder.mutation({
      query: (body) => ({
        url: "/api/cart/add",
        method: "POST",
        body,
      }),
      invalidatesTags: ["cartList"],
    }),
    removeCart: builder.mutation({
      query: (body) => ({
        url: "/api/cart/remove",
        method: "POST",
        body,
      }),
      invalidatesTags: ["cartList"],
    }),
    updateCart: builder.mutation({
      query: (body) => ({
        url: "/api/cart/update",
        method: "POST",
        body,
      }),
      invalidatesTags: ["cartList"],
    }),
    // get shipping method
    getShippingMethod: builder.query({
      query: () => "/api/expedition/list",
    }),

    // notification
    getNotification: builder.query({
      query: () => "/api/notification/list",
    }),
    readNotification: builder.mutation({
      query: (body) => ({
        url: "/api/notification/read",
        method: "POST",
        body,
      }),
    }),

    // address
    getAddress: builder.query({
      query: () => "/api/profile/address/list",
    }),
    saveAddress: builder.mutation({
      query: (body) => ({
        url: "/api/profile/address/save",
        method: "POST",
        body,
      }),
    }),

    deleteAddress: builder.mutation({
      query: (body) => ({
        url: "/api/profile/address/delete",
        method: "POST",
        body,
      }),
    }),
  }),
})

// Export the auto-generated hook for the `getPosts` query endpoint
export const {
  useUpdateProfileMutation,
  useLoginMutation,
  useGetListTransactionMutation,
  useUpdateTransactionStatusMutation,
  useGetCartListQuery,
  useAddCartMutation,
  useRemoveCartMutation,
  useUpdateCartMutation,
  useGetShippingMethodQuery,
  useGetNotificationQuery,
  useReadNotificationMutation,
  useGetAddressQuery,
  useSaveAddressMutation,
  useDeleteAddressMutation,
} = apiService
