import { apiSlice } from './apiSlice';
const STATIONS_URL = '/api/stations';

export const stationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // get all stations
    getStations: builder.query({
      query: () => ({
        url: `${STATIONS_URL}`,
        method: 'GET',
      }),
    }),
    
    // get station by id
    getStationById: builder.query({
      query: (id) => ({
        url: `${STATIONS_URL}/${id}`,
        method: 'GET',
      }),
    }),

    // get station stats
    getStationStats: builder.query({
      query: () => ({
        url: `${STATIONS_URL}/stats`,
        method: 'GET',
      }),
    }),

    // get online stations
    getOnlineStations: builder.query({
      query: () => ({
        url: `${STATIONS_URL}/online`,
        method: 'GET',
      }),
    }),

    // get offline stations
    getOfflineStations: builder.query({
      query: () => ({
        url: `${STATIONS_URL}/offline`,
        method: 'GET',
      }),
    }),

    // get available stations
    getAvailableStations: builder.query({
      query: () => ({
        url: `${STATIONS_URL}/available`,
        method: 'GET',
      }),
    }),

    // get charging stations
    getChargingStations: builder.query({
      query: () => ({
        url: `${STATIONS_URL}/charging`,
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useGetStationsQuery,
  useGetStationByIdQuery,
  useGetStationStatsQuery,
  useGetOnlineStationsQuery,
  useGetOfflineStationsQuery,
  useGetAvailableStationsQuery,
  useGetChargingStationsQuery,
} = stationApiSlice;