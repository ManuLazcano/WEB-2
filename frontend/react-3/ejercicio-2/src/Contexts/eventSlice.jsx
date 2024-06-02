import { createSlice } from '@reduxjs/toolkit';

const currentDate = new Date().toISOString();
const initialState = {
    eventList: [
        { name: "Evento 1", location: "Lugar 1", date: currentDate, organizer: "Organizador 1", contact: "example1@gmail.com" },
        { name: "Evento 2", location: "Lugar 2", date: currentDate, organizer: "Organizador 2", contact: "example2@gmail.com" },
        { name: "Evento 3", location: "Lugar 3", date: currentDate, organizer: "Organizador 3", contact: "example3@gmail.com" },
    ],
    valueToEdit: null,
};

const eventSlice = createSlice({
    name: 'events',
    initialState,
    reducers: {
        addEvent: (state, action) => {
            const newEvent = action.payload;           
            state.eventList.push({
                ...newEvent,
                date: newEvent.date.toISOString(),
            });
        },
        setEditEvent: (state, action) => {
            state.valueToEdit = state.eventList.find(event => event.name === action.payload);
        },
        editEvent: (state, action) => {
            const editedEvent = action.payload;
            const eventIndex = state.eventList.findIndex(event => event.name === editedEvent.name);

            if(eventIndex !== -1) {
                state.eventList[eventIndex] = {
                    ...editedEvent,
                    date: new Date(editedEvent.date).toISOString(),
                };
                state.valueToEdit = null;
            }
        },
        deleteEvent: (state, action) => {
            state.eventList = state.eventList.filter(event => event.name !== action.payload);
        },
    }
});

export const { addEvent, setEditEvent, editEvent, deleteEvent } = eventSlice.actions;
export default eventSlice.reducer;