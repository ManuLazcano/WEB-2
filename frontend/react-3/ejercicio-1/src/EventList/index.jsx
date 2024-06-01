import React, { useEffect } from "react";
import { EventContext } from "../Contexts/EventContext";
import { formatDate } from "../utils";

function EventList() {
    const { eventList, putValuesInTheForm, deleteEvent } = React.useContext(EventContext);
    
    return (
        <>
            <table border={1}>
                <thead>
                    <tr>
                        <th>Nombre</th><th>Lugar</th><th>Fecha</th><th>Organizador</th><th>Contacto</th><th>Editar</th><th>Borrar</th>
                    </tr>
                </thead>
                <tbody>                  
                    {eventList.map((event, index) => (
                        <tr key={index}>
                            <td>{event.name}</td>
                            <td>{event.location}</td>
                            <td>{formatDate(event.date)}</td>
                            <td>{event.organizer}</td>
                            <td>{event.contact}</td>
                            <td><button onClick={() => putValuesInTheForm(event.name)}>Editar</button></td>
                            <td><button onClick={() => deleteEvent(event.name)}>Borrar</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
}

export { EventList };