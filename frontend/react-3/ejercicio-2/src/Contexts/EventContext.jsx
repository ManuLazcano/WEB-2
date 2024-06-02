import React, { useState, createContext } from "react";

const EventContext = createContext();

function EventProvider({children}) {
    const currentDate = new Date().toISOString();

    const [ eventList, setEventList ] = useState([    
        { name: "Evento 1", location: "Lugar 1", date: currentDate, organizer: "Organizador 1", contact: "example1@gmail.com" },
        { name: "Evento 2", location: "Lugar 2", date: currentDate, organizer: "Organizador 2", contact: "example2@gmail.com" },
        { name: "Evento 3", location: "Lugar 3", date: currentDate, organizer: "Organizador 3", contact: "example3@gmail.com" },
    ]);
    const [ valueToEdit, setValueToEdit ] = useState(null);

    const addEvent = (newEvent) => {
        const eventWithFormattedDate = {
            ...newEvent,
            date: newEvent.date.toISOString() // Guardar en formato ISO para consistencia
          };
          setEventList([...eventList, eventWithFormattedDate]);
    }

    const putValuesInTheForm = (eventName) => {
        const eventToEdit = eventList.find(event => event.name === eventName);
        setValueToEdit(eventToEdit);
    }

    const edditEvent = (editedEvent) => {
        const updatedEventList = eventList.map(event => 
            event.name === editedEvent.name ? { ...editedEvent, date: editedEvent.date.toISOString() } : event
        );
        setEventList(updatedEventList);
        setValueToEdit(null);
    }

    const deleteEvent = (eventName) => {
        const updatedEventList = eventList.filter(event => event.name !== eventName);
        setEventList(updatedEventList);
    }

    return (
        <>
            <EventContext.Provider value={{
                eventList,
                addEvent,
                valueToEdit,
                putValuesInTheForm,
                edditEvent,
                deleteEvent
            }}>
                {children}
            </EventContext.Provider>
        </>
    );
}

export { EventContext, EventProvider };