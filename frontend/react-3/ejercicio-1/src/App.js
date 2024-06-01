import React from 'react';
import { EventList } from './EventList';
import { EventForm } from './EventForm';
import { EventProvider } from './Contexts/EventContext';


function App() {

  return (
    <>
      <EventProvider>
        <EventList />
        <EventForm />
      </EventProvider>
    </>
  );
}

export default App;
