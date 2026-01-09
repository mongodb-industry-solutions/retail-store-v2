import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk to send event to API
export const sendEvent = createAsyncThunk(
  'events/sendEvent',
  async (eventData, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Event sent ${data.event.tags.event}:`, data.event);
      return data;
    } catch (error) {
      console.error('Failed to send event:', error);
      return rejectWithValue(error.message);
    }
  }
);

const eventsSlice = createSlice({
  name: 'events',
  initialState: {
    events: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    clearEvents: (state) => {
      state.events = [];
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        // Add the actual stored event from the API response (includes MongoDB _id)
        state.events.push({
          ...action.payload.event, // The stored document with _id from MongoDB
        });
      })
      .addCase(sendEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearEvents, clearError } = eventsSlice.actions;
export default eventsSlice.reducer;