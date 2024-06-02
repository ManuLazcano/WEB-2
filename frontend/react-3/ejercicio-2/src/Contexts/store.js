import { configureStore } from "@reduxjs/toolkit";
import eventsReducer from "./eventSlice.jsx";

const store = configureStore({
    reducer: {
        events: eventsReducer,
    }
});

export { store };