function generateWeeksList() {
    const startDate = new Date('2024-07-08');
    const endDate = new Date('2026-07-08');
    let currentDate = new Date(startDate);
    
    let currentMonth = -1;
    let currentYear = -1;
    
    while (currentDate <= endDate) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const weekList = document.getElementById(`weekList${year}`);
        
        // Neuer Monat beginnt
        if (month !== currentMonth || year !== currentYear) {
            const monthDiv = document.createElement('div');
            monthDiv.className = 'month-separator';
            monthDiv.textContent = currentDate.toLocaleDateString('de-DE', {
                month: 'long',
                year: 'numeric'
            });
            weekList.appendChild(monthDiv);
            
            currentMonth = month;
            currentYear = year;
        }
        
        const li = document.createElement('li');
        li.className = 'week-item';
        
        // Startdatum formatieren
        const startDateStr = currentDate.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        
        // Enddatum berechnen (5 Tage später)
        const endDate = new Date(currentDate);
        endDate.setDate(endDate.getDate() + 4);
        const endDateStr = endDate.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        
        // Erstelle einen Container für das Datum und den Download-Button
        const dateSpan = document.createElement('div');
        dateSpan.className = 'week-date';
        dateSpan.textContent = `${startDateStr} - ${endDateStr}`;
        
        // Event-Listener für das Datum hinzufügen
        dateSpan.addEventListener('click', () => {
            // Aktiven Status für alle Week-Items entfernen
            document.querySelectorAll('.week-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Aktiven Status für das geklickte Item setzen
            li.classList.add('active');
            
            // Formular mit den Daten füllen
            updateFormWithDates(startDateStr, endDateStr);
            
            // Scroll zum Formular (optional)
            document.querySelector('.container').scrollIntoView({ behavior: 'smooth' });
        });
        
        const downloadButton = document.createElement('button');
        downloadButton.className = 'week-download-button';
        downloadButton.innerHTML = '<i class="fi fi-sr-download"></i>';
        
        // Event-Listener für den Download-Button
        downloadButton.addEventListener('click', async (e) => {
            e.stopPropagation();
            
            // Setze die Daten im Hauptformular
            document.getElementById('weekStart').value = startDateStr;
            document.getElementById('weekEnd').value = endDateStr;
            
            // Setze das korrekte Ausbildungsjahr basierend auf dem Jahr
            const year = startDateStr.split('.')[2];
            const yearInput = document.querySelector('.year-input');
            switch(year) {
                case '2024':
                    yearInput.value = '1';
                    break;
                case '2025':
                    yearInput.value = '2';
                    break;
                case '2026':
                    yearInput.value = '3';
                    break;
            }
            
            // Setze die korrekte Nummer für diese Woche
            const weekNumber = calculateWeekNumber(startDateStr);
            document.querySelector('.number-input').value = weekNumber;
            
            // Lade die gespeicherten Daten für diese Woche
            await loadFormData(startDateStr);
            
            // Führe den Download aus
            exportToPDF();
        });
        
        li.appendChild(dateSpan);
        li.appendChild(downloadButton);
        
        weekList.appendChild(li);
        currentDate.setDate(currentDate.getDate() + 7);
    }
}

function updateFormWithDates(startDate, endDate) {
    // Datum-Inputs aktualisieren
    document.getElementById('weekStart').value = startDate;
    document.getElementById('weekEnd').value = endDate;
    
    // Alle Aktivitäts-Textareas leeren
    document.querySelectorAll('.activity-input').forEach(textarea => {
        textarea.value = '';
    });
    
    // Stunden auf Standardwerte zurücksetzen
    document.querySelectorAll('.hours-input').forEach(input => {
        if (!input.closest('tr').classList.contains('weekend')) {
            input.value = '8';
        } else {
            input.value = '--';
        }
    });
    
    // Nummer automatisch generieren
    const weekNumber = calculateWeekNumber(startDate);
    document.querySelector('.number-input').value = weekNumber;
    
    // Speichern des aktuellen Datums im localStorage
    localStorage.setItem('currentWeekStart', startDate);
    localStorage.setItem('currentWeekEnd', endDate);
    
    loadPredefinedTexts(startDate);
}

async function loadPredefinedTexts(startDate) {
    try {
        const response = await fetch('./js/weekTexts.json');
        const weekTexts = await response.json();
        
        // Prüfen ob es vordefinierte Texte für diese Woche gibt
        if (weekTexts[startDate]) {
            const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
            const textareas = document.querySelectorAll('.activity-input');
            
            // Die ersten 5 Textareas (Mo-Fr) mit den vordefinierten Texten füllen
            days.forEach((day, index) => {
                if (weekTexts[startDate][day]) {
                    textareas[index].value = weekTexts[startDate][day];
                }
            });
            
            // Speichern der geladenen Daten
            saveFormData(startDate);
        }
    } catch (error) {
        console.error('Fehler beim Laden der vordefinierten Texte:', error);
    }
}

function calculateWeekNumber(dateStr) {
    // Datum aus dem deutschen Format (DD.MM.YYYY) parsen
    const parts = dateStr.split('.');
    const inputDate = new Date(parts[2], parts[1] - 1, parts[0]);
    
    // Referenzdaten für die Jahre
    const startDates = {
        2024: new Date('2024-07-08'),
        2025: new Date('2025-01-01'),
        2026: new Date('2026-01-01')
    };
    
    const year = inputDate.getFullYear();
    const startDate = startDates[year];
    
    // Wenn kein Startdatum für das Jahr existiert oder das Datum vor dem Startdatum liegt
    if (!startDate || inputDate < startDate) {
        return '';
    }
    
    if (year === 2024) {
        // Für 2024: Spezielle Wochenberechnung ab 08.07.2024
        const weeks = [
            '08.07.2024', '15.07.2024', '22.07.2024', '29.07.2024',
            '05.08.2024', '12.08.2024', '19.08.2024', '26.08.2024',
            '02.09.2024', '09.09.2024', '16.09.2024', '23.09.2024', '30.09.2024',
            '07.10.2024', '14.10.2024', '21.10.2024', '28.10.2024',
            '04.11.2024', '11.11.2024', '18.11.2024', '25.11.2024',
            '02.12.2024', '09.12.2024', '16.12.2024', '23.12.2024', '30.12.2024'
        ];
        
        const weekIndex = weeks.indexOf(dateStr);
        if (weekIndex !== -1) {
            return `${weekIndex + 1}/2024`;
        }
    } else {
        // Für 2025 und 2026: Berechne Wochen ab 1. Januar
        const msPerWeek = 1000 * 60 * 60 * 24 * 7;
        const weekNumber = Math.floor((inputDate - startDate) / msPerWeek) + 1;
        return `${weekNumber}/${year}`;
    }
    
    return '';
}

// Jahr-Button-Handler
function initializeYearButtons() {
    const yearButtons = document.querySelectorAll('.year-button');
    
    yearButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Button-Status aktualisieren
            yearButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Listen ein-/ausblenden
            const year = button.dataset.year;
            document.querySelectorAll('.week-list').forEach(list => {
                list.classList.remove('visible');
            });
            document.querySelector(`.week-list[data-year="${year}"]`).classList.add('visible');
        });
    });
}

// Beim Laden der Seite den gespeicherten Status wiederherstellen
document.addEventListener('DOMContentLoaded', function() {
    generateWeeksList();
    initializeYearButtons();
    
    // Gespeicherte Daten wiederherstellen
    const savedStartDate = localStorage.getItem('currentWeekStart');
    const savedEndDate = localStorage.getItem('currentWeekEnd');
    
    if (savedStartDate && savedEndDate) {
        updateFormWithDates(savedStartDate, savedEndDate);
        
        // Aktiven Status in der Liste wiederherstellen
        const weekItems = document.querySelectorAll('.week-date');
        weekItems.forEach(item => {
            if (item.textContent.includes(savedStartDate)) {
                item.closest('.week-item').classList.add('active');
            }
        });
    }
});

// Neue loadFormData Funktion
async function loadFormData(startDate) {
    try {
        const savedData = localStorage.getItem(`formData_${startDate}`);
        if (savedData) {
            const data = JSON.parse(savedData);
            
            // Aktivitäten laden
            const textareas = document.querySelectorAll('.activity-input');
            data.activities.forEach((activity, index) => {
                if (textareas[index]) {
                    textareas[index].value = activity || '';
                }
            });
            
            // Stunden laden
            const hoursInputs = document.querySelectorAll('.hours-input');
            data.hours.forEach((hours, index) => {
                if (hoursInputs[index]) {
                    hoursInputs[index].value = hours || '';
                }
            });
            
            // Nummer laden
            if (data.number) {
                document.querySelector('.number-input').value = data.number;
            }
            
            // Ausbildungsjahr laden, falls gespeichert
            if (data.yearInput) {
                document.querySelector('.year-input').value = data.yearInput;
            } else {
                // Setze Standard-Ausbildungsjahr basierend auf dem Jahr
                const year = startDate.split('.')[2];
                switch(year) {
                    case '2024':
                        document.querySelector('.year-input').value = '1';
                        break;
                    case '2025':
                        document.querySelector('.year-input').value = '2';
                        break;
                    case '2026':
                        document.querySelector('.year-input').value = '3';
                        break;
                }
            }
        } else {
            // Wenn keine gespeicherten Daten existieren
            // Setze Standard-Ausbildungsjahr basierend auf dem Jahr
            const year = startDate.split('.')[2];
            switch(year) {
                case '2024':
                    document.querySelector('.year-input').value = '1';
                    break;
                case '2025':
                    document.querySelector('.year-input').value = '2';
                    break;
                case '2026':
                    document.querySelector('.year-input').value = '3';
                    break;
            }
            
            // Setze die korrekte Nummer für diese Woche
            const weekNumber = calculateWeekNumber(startDate);
            document.querySelector('.number-input').value = weekNumber;
            
            // Lade vordefinierte Texte
            await loadPredefinedTexts(startDate);
        }
    } catch (error) {
        console.error('Fehler beim Laden der Formulardaten:', error);
    }
}

// Bestehende saveFormData Funktion (zur Referenz)
function saveFormData(startDate) {
    const activities = Array.from(document.querySelectorAll('.activity-input'))
        .map(textarea => textarea.value);
    
    const hours = Array.from(document.querySelectorAll('.hours-input'))
        .map(input => input.value);
    
    const number = document.querySelector('.number-input').value;
    const yearInput = document.querySelector('.year-input').value;
    
    const formData = {
        activities,
        hours,
        number,
        yearInput
    };
    
    localStorage.setItem(`formData_${startDate}`, JSON.stringify(formData));
}

// Vereinfachter Event Listener
document.getElementById('weekStart').addEventListener('change', function(e) {
    if (!e.target.value) return;
    
    const parts = e.target.value.split('.');
    if (parts.length !== 3) return;
    
    const startDate = new Date(parts[2], parts[1] - 1, parts[0]);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 4);
    
    const endDateStr = endDate.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    
    document.getElementById('weekEnd').value = endDateStr;
});

// PDF Export Konfiguration und Funktion
function exportToPDF() {
    const element = document.querySelector('.container');
    
    // Hole das Start- und Enddatum für den Dateinamen
    const startDate = document.getElementById('weekStart').value;
    const endDate = document.getElementById('weekEnd').value;
    const fileName = `Berichtsheft_${startDate}-${endDate}.pdf`;

    // Textareas vorbereiten für PDF-Export
    const textareas = element.querySelectorAll('.activity-input');
    textareas.forEach(textarea => {
        const text = textarea.value;
        const div = document.createElement('div');
        div.className = 'activity-input';
        div.innerHTML = text.replace(/\n/g, '<br>');
        textarea.parentNode.insertBefore(div, textarea);
        textarea.style.display = 'none';
    });

    const opt = {
        margin: [0, 0, 0, 0],
        filename: fileName,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { 
            scale: 2,
            useCORS: true,
            letterRendering: true,
            height: 1123,
            windowWidth: 794,
            windowHeight: 1123,
            x: 0,
            y: 0
        },
        jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait',
            putOnlyUsedFonts: true,
            compress: true
        }
    };

    // Temporär den Download-Button ausblenden für den Export
    const downloadBtn = document.querySelector('.download-button');
    downloadBtn.style.display = 'none';

    // Originale Styles speichern
    const originalStyles = {
        height: element.style.height,
        padding: element.style.padding
    };

    // Exakte DIN A4 Höhe setzen
    element.style.height = '297mm';
    element.style.padding = '15mm';
    element.style.overflow = 'hidden';

    // PDF generieren
    html2pdf()
        .set(opt)
        .from(element)
        .toPdf()
        .get('pdf')
        .then((pdf) => {
            if (pdf.internal.pages.length > 1) {
                pdf.deletePage(2);
            }
            return pdf;
        })
        .save()
        .then(() => {
            // Textareas wiederherstellen
            textareas.forEach(textarea => {
                textarea.style.display = '';
                const div = textarea.previousSibling;
                if (div && div.className === 'activity-input') {
                    div.remove();
                }
            });

            // Styles wiederherstellen
            element.style.height = originalStyles.height;
            element.style.padding = originalStyles.padding;
            element.style.overflow = '';
            downloadBtn.style.display = 'flex';
        });
}

// Event Listener für den Download-Button
document.querySelector('.download-button').addEventListener('click', exportToPDF);

// Event-Listener für Änderungen im Formular
document.querySelectorAll('.activity-input, .hours-input, .number-input').forEach(input => {
    input.addEventListener('change', () => {
        const startDate = document.getElementById('weekStart').value;
        saveFormData(startDate);
    });
});

// Event-Listener für die Jahr-Buttons hinzufügen
document.querySelectorAll('.year-button').forEach(button => {
    button.addEventListener('click', function() {
        // Bestehende Button-Logik...
        
        // Ausbildungsjahr basierend auf gewähltem Jahr setzen
        const yearInput = document.querySelector('.year-input');
        const selectedYear = this.dataset.year;
        
        switch(selectedYear) {
            case '2024':
                yearInput.value = '1';
                break;
            case '2025':
                yearInput.value = '2';
                break;
            case '2026':
                yearInput.value = '3';
                break;
        }
    });
});