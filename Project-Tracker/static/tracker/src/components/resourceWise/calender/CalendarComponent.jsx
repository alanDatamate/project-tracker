import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'tailwindcss/tailwind.css'; 
import CustomToolbar from '../../shared/CustomToolbar';

const localizer = momentLocalizer(moment);

const CalendarComponent = ({ events }) => {
  
  // Function to get the style for each day cell (highlight busy days)
  const dayPropGetter = (date) => {
    const currentDate = moment(date).startOf('day');
    
    const isBusy = events && events.length > 0 && events.some((event) => {
      const eventStart = moment(event.start).startOf('day');
      const eventEnd = moment(event.end).endOf('day');
      return currentDate.isBetween(eventStart, eventEnd, null, '[]');
    });

    return {
      style: {
        backgroundColor: isBusy ? "orange" : "lightblue",
        color: isBusy ? "white" : "black",
      },
    };
  };

  // Custom rendering of events inside the calendar cell (including multiple events)
  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: 'orange', // Use orange color for the events
        color: 'white', // White text color for better readability
        padding: '2px', // Small padding for clarity
        marginBottom: '2px', // Space between stacked events
        fontSize: '12px',
      }
    };
  };

  // Group events by date (same date multiple events)
  const groupedEvents = (events) => {
    const grouped = {};

    events.forEach(event => {
      const eventDate = moment(event.start).format('YYYY-MM-DD');
      if (!grouped[eventDate]) {
        grouped[eventDate] = [];
      }
      grouped[eventDate].push(event);
    });

    return grouped;
  };

  const eventsGroupedByDate = groupedEvents(events);

  // Custom event rendering to handle multiple events on the same day
  const renderEventContent = ({ event }) => {
    const eventDate = moment(event.start).format('YYYY-MM-DD');
    const eventsForDay = eventsGroupedByDate[eventDate];

    // Render events for a specific day
    if (eventsForDay) {
      return eventsForDay.map((ev, index) => (
        <div key={index} style={{ padding: '1px', fontWeight: 'bold', fontSize: '12px' }}>
          {ev.title}
        </div>
      ));
    }

    return null;
  };

  return (
    <div className="p-4">
      <div style={{ height: '500px' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
          components={{
            toolbar: CustomToolbar,
            event: renderEventContent, // Custom event rendering for displaying titles
          }}
          dayPropGetter={dayPropGetter}
          eventPropGetter={eventStyleGetter} // Style event with custom color
        />
      </div>
    </div>
  );
};

export default CalendarComponent;
