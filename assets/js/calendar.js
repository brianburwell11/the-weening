// Calendar functionality
class Calendar {
    constructor() {
        this.calendarGrid = document.getElementById('calendar-grid');
        this.weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        this.init();
    }

    async init() {
        try {
            await this.loadCalendarData();
            this.renderCalendar();
        } catch (error) {
            console.error('Error loading calendar data:', error);
            this.renderError();
        }
    }

    async loadCalendarData() {
        const response = await fetch('assets/data/calendar-data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        this.calendarData = await response.json();
    }

    renderCalendar() {
        // Clear existing content
        this.calendarGrid.innerHTML = '';

        // Add header row
        this.renderHeaderRow();

        // Add calendar days
        this.renderCalendarDays();
    }

    renderHeaderRow() {
        this.weekDays.forEach(day => {
            const headerCell = document.createElement('div');
            headerCell.className = 'calendar-header-cell';
            headerCell.textContent = day;
            this.calendarGrid.appendChild(headerCell);
        });
    }

    renderCalendarDays() {
        const days = this.calendarData.days;
        const totalCells = 7 * 5; // 7 columns x 5 rows = 35 cells

        // October 2025 starts on Wednesday (day 3 of the week)
        const startOffset = 3; // Wednesday is the 3rd day (0=Sun, 1=Mon, 2=Tue, 3=Wed)

        for (let i = 0; i < totalCells; i++) {
            const cell = document.createElement('div');
            cell.className = 'calendar-cell';

            // Calculate the day index, accounting for the offset
            const dayIndex = i - startOffset;

            if (dayIndex >= 0 && dayIndex < days.length) {
                // Day has data
                const dayData = days[dayIndex];

                // Handle multiple weens and weenies
                const weenEvents = Array.isArray(dayData.ween) ? dayData.ween : [dayData.ween];
                const weenieEvents = Array.isArray(dayData.weenie) ? dayData.weenie : [dayData.weenie];

                const weenButtons = weenEvents.map(event => `<button class="ween-btn">💀 ${event}</button>`).join('');
                const weenieButtons = weenieEvents.map(event => `<button class="weenie-btn">🎃 ${event}</button>`).join('');

                cell.innerHTML = `
                    <div class="date">10/${dayData.date}/2025</div>
                    <div class="day-name">${dayData.dayOfWeek}</div>
                    <div class="content">${dayData.content}</div>
                    <div class="event-buttons">
                        ${weenButtons}
                        ${weenieButtons}
                    </div>
                `;
            } else {
                // Empty cell (before October 1st or after October 31st)
                cell.className = 'calendar-cell empty';
                cell.innerHTML = `
                    <div class="content">-</div>
                `;
            }

            this.calendarGrid.appendChild(cell);
        }
    }

    renderError() {
        this.calendarGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--text-secondary);">
                <h3>Error loading calendar data</h3>
                <p>Please check that the calendar-data.json file exists and is properly formatted.</p>
            </div>
        `;
    }
}

// Initialize calendar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Calendar();
});
