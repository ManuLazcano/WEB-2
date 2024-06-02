import React from 'react';
import { EventList } from './EventList';
import { EventForm } from './EventForm';
import { Provider } from 'react-redux';
import { store } from './Contexts/store';


function App() {

  return (
    <>
      <Provider store={store}>
        <EventList />
        <EventForm />
      </Provider>
    </>
  );
}

export default App;
