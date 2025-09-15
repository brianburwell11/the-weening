const WEENING_CAL = "";
const DEV_CAL = "848d6fe6e78d418cf05c3ea819b02340c023d76fd93407981174a2fc0f7b4920@group.calendar.google.com";

// Set this to the calendar ID you want to use for creating events
const DEST_CAL = DEV_CAL;

/**
 * Helper function to create HTML links
 * @param {string} text - The display text for the link
 * @param {string} url - The URL to link to
 * @returns {string} - HTML anchor tag
 */
function createHtmlLink(text, url) {
  return '<a href="' + url + '">' + text + '</a>';
}

/**
 * Helper function to build event description from row data
 * @param {Array} row - The row data from the spreadsheet
 * @returns {string} - Formatted event description
 */
function buildEventDescription(row) {
  const imdbId = row[4]; // Column E (IMDB ID)
  const tmdbId = row[5]; // Column F (TMDB ID)
  const fandangoUrl = row[6]; // Column G (Fandango URL)
  const scaryMeter = row[7]; // Column H (Scary Meter Rating)
  const releaseYear = row[8]; // Column I (Release Year)
  const runtime = row[10]; // Column K (Runtime)
  const plot = row[11]; // Column L (Plot)
  const note = row[12]; // Column M (Notes)
  
  let eventDescription = '';
  
  // Add plot from column L
  if (plot && String(plot).trim()) {
    eventDescription += String(plot).trim();
  }
  
  // Add release year info if it's the current year
  const currentYear = new Date().getFullYear();
  if (releaseYear && String(releaseYear).trim() == currentYear) {
    eventDescription += '<br><br>✨ ' + currentYear + ' Release<br><br>';
  } else {
    // Add blank line if no release year info
    if (eventDescription) {
      eventDescription += '<br><br>';
    }
  }
  
  // Add runtime from column K
  if (runtime && String(runtime).trim()) {
    eventDescription += 'Runtime: ' + String(runtime).trim();
  }
  
  // Add blank line
  if (eventDescription) {
    eventDescription += '<br><br>';
  }
  
  // Add IMDb link from column E
  if (imdbId && String(imdbId).trim()) {
    const imdbUrl = 'https://www.imdb.com/title/' + String(imdbId).trim();
    eventDescription += createHtmlLink('[🎥 IMDb]', imdbUrl);
  }
  
  // Add Scary Meter link from columns H and F
  if (scaryMeter && tmdbId && String(scaryMeter).trim() && String(tmdbId).trim()) {
    const scaryMeterUrl = 'https://scarymeter.com/movie/' + String(tmdbId).trim();
    const scaryMeterText = '[😱 Scary Meter: ' + String(scaryMeter).trim() + ']';
    eventDescription += ' ' + createHtmlLink(scaryMeterText, scaryMeterUrl);
  }
  
  // Add Get Tickets link from column G
  if (fandangoUrl && String(fandangoUrl).trim()) {
    eventDescription += ' ' + createHtmlLink('[🎟️ Fandango]', String(fandangoUrl).trim());
  }
  
  // Add note from column M
  if (note && String(note).trim()) {
    eventDescription += '<br><br>' + String(note).trim();
  }
  
  return eventDescription;
}

/**
 * Google Apps Script to create calendar events from Google Sheet data
 * Reads data from the current sheet and creates events for each row
 * Column A: Date (YYYY-MM-DD format)
 * Column C: Event Title (ID field with movie titles)
 */

function createCalendarEventsFromSheet() {
  try {
    // Get the active spreadsheet and sheet
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getActiveSheet();
    
    // Get all data from the sheet
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    // Skip the header row (row 1) and process data starting from row 2
    const dataRows = values.slice(1);
    
    // Get the specified calendar by ID
    const calendar = CalendarApp.getCalendarById(DEST_CAL);
    
    let eventsCreated = 0;
    let errors = [];
    
    // Process each row
    dataRows.forEach((row, index) => {
      try {
        const dateValue = row[0]; // Column A (Date)
        const typeValue = row[1]; // Column B (Type: Ween or Weenie)
        const titleValue = row[2]; // Column C (ID/Title)
        
        // Skip empty rows
        if (!dateValue || !titleValue) {
          console.log(`Skipping row ${index + 2}: missing date or title`);
          return;
        }
        
        // Parse the date
        let eventDate;
        if (dateValue instanceof Date) {
          eventDate = dateValue;
        } else if (typeof dateValue === 'string') {
          // Parse YYYY-MM-DD format
          eventDate = new Date(dateValue);
        } else {
          throw new Error(`Invalid date format: ${dateValue}`);
        }
        
        // Validate the date
        if (isNaN(eventDate.getTime())) {
          throw new Error(`Invalid date: ${dateValue}`);
        }
        
        // Clean up the title (remove any extra whitespace)
        let eventTitle = String(titleValue).trim();
        
        if (!eventTitle) {
          throw new Error(`Empty title for date: ${dateValue}`);
        }
        
        // Add emoji based on type in column B
        const typeString = String(typeValue).trim().toLowerCase();
        if (typeString === 'ween') {
          eventTitle = '💀 ' + eventTitle;
        } else if (typeString === 'weenie') {
          eventTitle = '🎃 ' + eventTitle;
        }
        
        // Create event description using helper function
        const eventDescription = buildEventDescription(row);
        
        // Check if an event with the same title already exists on this date
        const existingEvents = calendar.getEventsForDay(eventDate);
        const eventExists = existingEvents.some(event => 
          event.getTitle() === eventTitle
        );
        
        if (eventExists) {
          console.log(`Event "${eventTitle}" already exists on ${eventDate.toDateString()}`);
          return;
        }
        
        // Create the all-day event
        const event = calendar.createAllDayEvent(
          eventTitle,
          eventDate,
          {
            description: eventDescription || `Movie night: ${eventTitle}`
          }
        );
        
        // Set event as "Available" (not "Busy") so it doesn't block time
        event.setTransparency(CalendarApp.EventTransparency.TRANSPARENT);
        
        console.log(`Created event: "${eventTitle}" on ${eventDate.toDateString()}`);
        eventsCreated++;
        
      } catch (error) {
        const errorMsg = `Row ${index + 2}: ${error.message}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    });
    
    // Display results
    const message = `Calendar Events Creation Complete!\n\n` +
                   `Events created: ${eventsCreated}\n` +
                   `Errors: ${errors.length}\n\n` +
                   (errors.length > 0 ? `Errors encountered:\n${errors.join('\n')}` : 'All events created successfully!');
    
    SpreadsheetApp.getUi().alert(message);
    
  } catch (error) {
    console.error('Script error:', error);
    SpreadsheetApp.getUi().alert(`Script Error: ${error.message}`);
  }
}

/**
 * Helper function to create events for a specific date range
 * @param {Date} startDate - Start date for the range
 * @param {Date} endDate - End date for the range
 */
function createEventsForDateRange(startDate, endDate) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getActiveSheet();
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    const dataRows = values.slice(1);
    
    const calendar = CalendarApp.getCalendarById(DEST_CAL);
    let eventsCreated = 0;
    
    dataRows.forEach((row, index) => {
      const dateValue = row[0];
      const typeValue = row[1];
      const titleValue = row[2];
      
      if (!dateValue || !titleValue) return;
      
      let eventDate;
      if (dateValue instanceof Date) {
        eventDate = dateValue;
      } else {
        eventDate = new Date(dateValue);
      }
      
      // Check if the date is within the specified range
      if (eventDate >= startDate && eventDate <= endDate) {
        let eventTitle = String(titleValue).trim();
        
        // Add emoji based on type in column B
        const typeString = String(typeValue).trim().toLowerCase();
        if (typeString === 'ween') {
          eventTitle = '💀 ' + eventTitle;
        } else if (typeString === 'weenie') {
          eventTitle = '🎃 ' + eventTitle;
        }
        
        // Create event description using helper function
        const eventDescription = buildEventDescription(row);
        
        const event = calendar.createAllDayEvent(
          eventTitle,
          eventDate,
          {
            description: eventDescription || `Movie night: ${eventTitle}`,
          }
        );
        
        // Set event as "Available" (not "Busy") so it doesn't block time
        event.setTransparency(CalendarApp.EventTransparency.TRANSPARENT);
        
        eventsCreated++;
      }
    });
    
    SpreadsheetApp.getUi().alert(`Created ${eventsCreated} events for the specified date range.`);
    
  } catch (error) {
    SpreadsheetApp.getUi().alert(`Error: ${error.message}`);
  }
}

/**
 * Function to delete events in October of the current year
 * This will only delete events from October 1st to October 31st of the current year
 */
function deleteAllCalendarEvents() {
  const ui = SpreadsheetApp.getUi();
  const currentYear = new Date().getFullYear();
  
  const response = ui.alert(
    'Delete October Events',
    `Are you sure you want to delete ALL events from October ${currentYear} in the Weening calendar? This cannot be undone!`,
    ui.ButtonSet.YES_NO
  );
  
  if (response === ui.Button.YES) {
    try {
      const calendar = CalendarApp.getCalendarById(DEST_CAL);
      
      // Create date range for October of current year
      const octoberStart = new Date(currentYear, 9, 1); // Month is 0-indexed, so 9 = October
      const octoberEnd = new Date(currentYear, 9, 31, 23, 59, 59); // End of October 31st
      
      const events = calendar.getEvents(octoberStart, octoberEnd);
      
      events.forEach(event => {
        event.deleteEvent();
      });
      
      ui.alert(`Deleted ${events.length} events from October ${currentYear}.`);
    } catch (error) {
      ui.alert(`Error deleting events: ${error.message}`);
    }
  }
}

/**
 * Function to create a custom menu in the spreadsheet
 * This adds a menu item to run the script easily
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Calendar Events')
    .addItem('Create All Events', 'createCalendarEventsFromSheet')
    .addSeparator()
    .addItem('Delete October Events', 'deleteAllCalendarEvents')
    .addToUi();
}
