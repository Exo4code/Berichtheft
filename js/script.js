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
            switch (year) {
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

    // Feste Liste der Wochen und ihrer Nummern
    const weekMap = {
        '08.07.2024': '01/2024',
        '15.07.2024': '02/2024',
        '22.07.2024': '03/2024',
        '29.07.2024': '04/2024',
        '05.08.2024': '05/2024',
        '12.08.2024': '06/2024',
        '19.08.2024': '07/2024',
        '26.08.2024': '08/2024',
        '02.09.2024': '09/2024',
        '09.09.2024': '10/2024',
        '16.09.2024': '11/2024',
        '23.09.2024': '12/2024',
        '30.09.2024': '13/2024',
        '07.10.2024': '14/2024',
        '14.10.2024': '15/2024',
        '21.10.2024': '16/2024',
        '28.10.2024': '17/2024',
        '04.11.2024': '18/2024',
        '11.11.2024': '19/2024',
        '18.11.2024': '20/2024',
        '25.11.2024': '21/2024',
        '02.12.2024': '22/2024',
        '09.12.2024': '23/2024',
        '16.12.2024': '24/2024',
        '23.12.2024': '25/2024',
        '30.12.2024': '26/2024'
    };

    // Direkt die Nummer aus der Map zurückgeben
    if (weekMap[dateStr]) {
        return weekMap[dateStr];
    }

    // Für 2025 und 2026: Weiterzählen ab der letzten 2024er Nummer
    const startDate = new Date('2024-07-08');
    const msPerWeek = 1000 * 60 * 60 * 24 * 7;
    const weekNumber = Math.floor((inputDate - startDate) / msPerWeek) + 1;
    const year = inputDate.getFullYear();

    return `${weekNumber.toString().padStart(2, '0')}/${year}`;
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

// Neue Funktion zur Erkennung des aktuellen Datums und der Woche
function selectCurrentWeek() {
    const today = new Date();
    const currentYear = today.getFullYear();

    // Prüfe ob das aktuelle Jahr in unseren Ausbildungsjahren liegt
    if (currentYear >= 2024 && currentYear <= 2026) {
        // Aktiviere den korrekten Jahr-Button
        const yearButtons = document.querySelectorAll('.year-button');
        yearButtons.forEach(button => {
            if (button.dataset.year === currentYear.toString()) {
                button.click(); // Simuliere Klick auf den richtigen Jahr-Button
            }
        });

        // Finde die aktuelle Woche
        const weekItems = document.querySelectorAll('.week-item');
        let currentWeekItem = null;
        let smallestDiff = Infinity;

        weekItems.forEach(item => {
            const dateSpan = item.querySelector('.week-date');
            const dateText = dateSpan.textContent;
            const [startDateStr] = dateText.split(' - ');

            // Konvertiere das Datum aus dem deutschen Format (DD.MM.YYYY)
            const [day, month, year] = startDateStr.split('.');
            const weekDate = new Date(year, month - 1, day);

            // Berechne die Differenz zum heutigen Datum
            const diff = Math.abs(today - weekDate);

            // Wenn diese Woche näher am aktuellen Datum ist
            if (diff < smallestDiff) {
                smallestDiff = diff;
                currentWeekItem = item;
            }
        });

        // Wenn eine passende Woche gefunden wurde, wähle sie aus
        if (currentWeekItem) {
            const dateSpan = currentWeekItem.querySelector('.week-date');
            const dateText = dateSpan.textContent;
            const [startDate, endDate] = dateText.split(' - ');

            // Setze aktiven Status
            document.querySelectorAll('.week-item').forEach(item => {
                item.classList.remove('active');
            });
            currentWeekItem.classList.add('active');

            // Formular mit den Daten der aktuellen Woche füllen
            updateFormWithDates(startDate, endDate);

            // Speichere die aktuelle Auswahl im localStorage
            localStorage.setItem('currentWeekStart', startDate);
            localStorage.setItem('currentWeekEnd', endDate);

            // Scrolle zur ausgewählten Woche
            currentWeekItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

// Beim Laden der Seite
document.addEventListener('DOMContentLoaded', function () {
    generateWeeksList();
    initializeYearButtons();

    // Persönliche Daten laden
    loadPersonalData();

    // Event Listener für Änderungen an den persönlichen Daten
    document.querySelectorAll('.name-input, .profession-input').forEach(input => {
        input.addEventListener('change', savePersonalData);
    });

    // Automatische Erkennung und Auswahl der aktuellen Woche
    selectCurrentWeek();
});

// Neue loadFormData Funktion
async function loadFormData(startDate) {
    try {
        // Persönliche Daten laden
        loadPersonalData();

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
                switch (year) {
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
            switch (year) {
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

    // Persönliche Daten auch hier speichern
    savePersonalData();

    const formData = {
        activities,
        hours,
        number,
        yearInput
    };

    localStorage.setItem(`formData_${startDate}`, JSON.stringify(formData));
}

// Neue Funktion zum Speichern der persönlichen Daten
function savePersonalData() {
    const nameInputs = document.querySelectorAll('.name-input');
    const professionInputs = document.querySelectorAll('.profession-input');

    // Nimm den Wert vom ersten Input-Feld
    const name = nameInputs[0]?.value || '';
    const profession = professionInputs[0]?.value || '';

    // Speichern im localStorage
    localStorage.setItem('apprenticeName', name);
    localStorage.setItem('apprenticeProfession', profession);

    // Aktualisiere alle anderen Instanzen der gleichen Felder
    nameInputs.forEach(input => input.value = name);
    professionInputs.forEach(input => input.value = profession);
}

// Neue Funktion zum Laden der persönlichen Daten
function loadPersonalData() {
    const nameInputs = document.querySelectorAll('.name-input');
    const professionInputs = document.querySelectorAll('.profession-input');

    const savedName = localStorage.getItem('apprenticeName') || '';
    const savedProfession = localStorage.getItem('apprenticeProfession') || '';

    // Setze die Werte in alle entsprechenden Input-Felder
    nameInputs.forEach(input => input.value = savedName);
    professionInputs.forEach(input => input.value = savedProfession);
}

// Vereinfachter Event Listener
document.getElementById('weekStart').addEventListener('change', function (e) {
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

    // Temporär den Download-Button ausblenden für den Export
    const downloadBtn = document.querySelector('.download-button');
    downloadBtn.style.display = 'none';

    // Originale Styles speichern
    const originalStyles = {
        height: element.style.height,
        padding: element.style.padding,
        margin: element.style.margin,
        position: element.style.position,
        top: element.style.top
    };

    // Exakte Positionierung für den Export setzen
    element.style.position = 'fixed';
    element.style.top = '0';
    element.style.height = '297mm';
    element.style.padding = '10mm 15mm 15mm 15mm';
    element.style.margin = '0';
    element.style.overflow = 'hidden';
    element.style.backgroundColor = 'white';

    const opt = {
        margin: 0,
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            letterRendering: true,
            width: 794, // Exakte A4-Breite in Pixeln
            height: 1123, // Exakte A4-Höhe in Pixeln
            x: 0,
            y: 0,
            scrollY: 0,
            windowWidth: 794,
            windowHeight: 1123,
            removeContainer: true,
            logging: false,
            backgroundColor: '#FFFFFF'
        },
        jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait',
            putOnlyUsedFonts: true,
            compress: true,
            precision: 16
        }
    };

    // PDF generieren
    html2pdf()
        .set(opt)
        .from(element)
        .toPdf()
        .get('pdf')
        .then((pdf) => {
            // Entferne zusätzliche Seiten, falls vorhanden
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

            // Originale Styles wiederherstellen
            element.style.position = originalStyles.position;
            element.style.top = originalStyles.top;
            element.style.height = originalStyles.height;
            element.style.padding = originalStyles.padding;
            element.style.margin = originalStyles.margin;
            element.style.overflow = '';
            element.style.backgroundColor = '';
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
    button.addEventListener('click', function () {
        // Bestehende Button-Logik...

        // Ausbildungsjahr basierend auf gewähltem Jahr setzen
        const yearInput = document.querySelector('.year-input');
        const selectedYear = this.dataset.year;

        switch (selectedYear) {
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

// Neue Funktion für den kombinierten PDF-Download 2024
async function downloadCombinedPDF2024() {
    // Zeige das Overlay
    const overlay = document.querySelector('.download-overlay');
    overlay.classList.add('active');

    try {
        // Alle Wochen-Items aus 2024 holen
        const weekItems = document.querySelectorAll('#weekList2024 .week-item');
        let mergedPdf = await PDFLib.PDFDocument.create();

        // Status-Text aktualisieren
        const statusText = document.querySelector('.download-status');
        let currentPage = 0;
        const totalPages = weekItems.length;

        // Für jede Woche eine Seite erstellen
        for (const weekItem of weekItems) {
            currentPage++;
            statusText.textContent = `Verarbeite Seite ${currentPage} von ${totalPages}...`;

            const dateSpan = weekItem.querySelector('.week-date');
            const dateText = dateSpan.textContent;
            const [startDate, endDate] = dateText.split(' - ');

            // Formular mit den Daten der Woche füllen
            document.getElementById('weekStart').value = startDate;
            document.getElementById('weekEnd').value = endDate;
            document.querySelector('.year-input').value = '1';
            document.querySelector('.number-input').value = calculateWeekNumber(startDate);

            // Lade die gespeicherten Daten für diese Woche
            await loadFormData(startDate);

            // Generiere PDF für diese Woche
            const element = document.querySelector('.container');

            // Vorbereitung für PDF-Export
            const textareas = element.querySelectorAll('.activity-input');
            textareas.forEach(textarea => {
                const text = textarea.value;
                const div = document.createElement('div');
                div.className = 'activity-input';
                div.innerHTML = text.replace(/\n/g, '<br>');
                textarea.parentNode.insertBefore(div, textarea);
                textarea.style.display = 'none';
            });

            // PDF für diese Woche generieren
            const pdfBytes = await html2pdf()
                .set({
                    margin: 0,
                    filename: `Berichtsheft_${startDate}.pdf`,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: {
                        scale: 2,
                        useCORS: true,
                        letterRendering: true,
                        width: 794,
                        height: 1123,
                        x: 0,
                        y: 0,
                        scrollY: 0,
                        windowWidth: 794,
                        windowHeight: 1123,
                        removeContainer: true,
                        logging: false,
                        backgroundColor: '#FFFFFF'
                    },
                    jsPDF: {
                        unit: 'mm',
                        format: 'a4',
                        orientation: 'portrait',
                        compress: true
                    }
                })
                .from(element)
                .outputPdf('arraybuffer');

            // PDF zur zusammengeführten PDF hinzufügen
            const currentPdf = await PDFLib.PDFDocument.load(pdfBytes);
            const copiedPages = await mergedPdf.copyPages(currentPdf, [0]);
            mergedPdf.addPage(copiedPages[0]);

            // Cleanup
            textareas.forEach(textarea => {
                textarea.style.display = '';
                const div = textarea.previousSibling;
                if (div && div.className === 'activity-input') {
                    div.remove();
                }
            });
        }

        // Finale PDF speichern und herunterladen
        statusText.textContent = 'PDF wird heruntergeladen...';
        const mergedPdfBytes = await mergedPdf.save();
        const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'Berichtshefte_2024_komplett.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

    } catch (error) {
        console.error('Fehler beim Erstellen der kombinierten PDF:', error);
        alert('Es gab einen Fehler beim Erstellen der PDF. Bitte versuchen Sie es erneut.');
    } finally {
        // Overlay ausblenden
        overlay.classList.remove('active');
    }
}

// Neue Funktion für den kombinierten PDF-Download 2025
async function downloadCombinedPDF2025() {
    // Zeige das Overlay
    const overlay = document.querySelector('.download-overlay');
    overlay.classList.add('active');

    try {
        // Alle Wochen-Items aus 2025 holen
        const weekItems = document.querySelectorAll('#weekList2025 .week-item');
        let mergedPdf = await PDFLib.PDFDocument.create();

        // Status-Text aktualisieren
        const statusText = document.querySelector('.download-status');
        let currentPage = 0;
        const totalPages = weekItems.length;

        // Für jede Woche eine Seite erstellen
        for (const weekItem of weekItems) {
            currentPage++;
            statusText.textContent = `Verarbeite Seite ${currentPage} von ${totalPages}...`;

            const dateSpan = weekItem.querySelector('.week-date');
            const dateText = dateSpan.textContent;
            const [startDate, endDate] = dateText.split(' - ');

            // Formular mit den Daten der Woche füllen
            document.getElementById('weekStart').value = startDate;
            document.getElementById('weekEnd').value = endDate;
            document.querySelector('.year-input').value = '2';
            document.querySelector('.number-input').value = calculateWeekNumber(startDate);

            // Lade die gespeicherten Daten für diese Woche
            await loadFormData(startDate);

            // Generiere PDF für diese Woche
            const element = document.querySelector('.container');

            // Vorbereitung für PDF-Export
            const textareas = element.querySelectorAll('.activity-input');
            textareas.forEach(textarea => {
                const text = textarea.value;
                const div = document.createElement('div');
                div.className = 'activity-input';
                div.innerHTML = text.replace(/\n/g, '<br>');
                textarea.parentNode.insertBefore(div, textarea);
                textarea.style.display = 'none';
            });

            // PDF für diese Woche generieren
            const pdfBytes = await html2pdf()
                .set({
                    margin: 0,
                    filename: `Berichtsheft_${startDate}.pdf`,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: {
                        scale: 2,
                        useCORS: true,
                        letterRendering: true,
                        width: 794,
                        height: 1123,
                        x: 0,
                        y: 0,
                        scrollY: 0,
                        windowWidth: 794,
                        windowHeight: 1123,
                        removeContainer: true,
                        logging: false,
                        backgroundColor: '#FFFFFF'
                    },
                    jsPDF: {
                        unit: 'mm',
                        format: 'a4',
                        orientation: 'portrait',
                        compress: true
                    }
                })
                .from(element)
                .outputPdf('arraybuffer');

            // PDF zur zusammengeführten PDF hinzufügen
            const currentPdf = await PDFLib.PDFDocument.load(pdfBytes);
            const copiedPages = await mergedPdf.copyPages(currentPdf, [0]);
            mergedPdf.addPage(copiedPages[0]);

            // Cleanup
            textareas.forEach(textarea => {
                textarea.style.display = '';
                const div = textarea.previousSibling;
                if (div && div.className === 'activity-input') {
                    div.remove();
                }
            });
        }

        // Finale PDF speichern und herunterladen
        statusText.textContent = 'PDF wird heruntergeladen...';
        const mergedPdfBytes = await mergedPdf.save();
        const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'Berichtshefte_2025_komplett.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

    } catch (error) {
        console.error('Fehler beim Erstellen der kombinierten PDF:', error);
        alert('Es gab einen Fehler beim Erstellen der PDF. Bitte versuchen Sie es erneut.');
    } finally {
        // Overlay ausblenden
        overlay.classList.remove('active');
    }
}

// Neue Funktion für den kombinierten PDF-Download 2026
async function downloadCombinedPDF2026() {
    // Zeige das Overlay
    const overlay = document.querySelector('.download-overlay');
    overlay.classList.add('active');

    try {
        // Alle Wochen-Items aus 2026 holen
        const weekItems = document.querySelectorAll('#weekList2026 .week-item');
        let mergedPdf = await PDFLib.PDFDocument.create();

        // Status-Text aktualisieren
        const statusText = document.querySelector('.download-status');
        let currentPage = 0;
        const totalPages = weekItems.length;

        // Für jede Woche eine Seite erstellen
        for (const weekItem of weekItems) {
            currentPage++;
            statusText.textContent = `Verarbeite Seite ${currentPage} von ${totalPages}...`;

            const dateSpan = weekItem.querySelector('.week-date');
            const dateText = dateSpan.textContent;
            const [startDate, endDate] = dateText.split(' - ');

            // Formular mit den Daten der Woche füllen
            document.getElementById('weekStart').value = startDate;
            document.getElementById('weekEnd').value = endDate;
            document.querySelector('.year-input').value = '3';
            document.querySelector('.number-input').value = calculateWeekNumber(startDate);

            // Lade die gespeicherten Daten für diese Woche
            await loadFormData(startDate);

            // Generiere PDF für diese Woche
            const element = document.querySelector('.container');

            // Vorbereitung für PDF-Export
            const textareas = element.querySelectorAll('.activity-input');
            textareas.forEach(textarea => {
                const text = textarea.value;
                const div = document.createElement('div');
                div.className = 'activity-input';
                div.innerHTML = text.replace(/\n/g, '<br>');
                textarea.parentNode.insertBefore(div, textarea);
                textarea.style.display = 'none';
            });

            // PDF für diese Woche generieren
            const pdfBytes = await html2pdf()
                .set({
                    margin: 0,
                    filename: `Berichtsheft_${startDate}.pdf`,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: {
                        scale: 2,
                        useCORS: true,
                        letterRendering: true,
                        width: 794,
                        height: 1123,
                        x: 0,
                        y: 0,
                        scrollY: 0,
                        windowWidth: 794,
                        windowHeight: 1123,
                        removeContainer: true,
                        logging: false,
                        backgroundColor: '#FFFFFF'
                    },
                    jsPDF: {
                        unit: 'mm',
                        format: 'a4',
                        orientation: 'portrait',
                        compress: true
                    }
                })
                .from(element)
                .outputPdf('arraybuffer');

            // PDF zur zusammengeführten PDF hinzufügen
            const currentPdf = await PDFLib.PDFDocument.load(pdfBytes);
            const copiedPages = await mergedPdf.copyPages(currentPdf, [0]);
            mergedPdf.addPage(copiedPages[0]);

            // Cleanup
            textareas.forEach(textarea => {
                textarea.style.display = '';
                const div = textarea.previousSibling;
                if (div && div.className === 'activity-input') {
                    div.remove();
                }
            });
        }

        // Finale PDF speichern und herunterladen
        statusText.textContent = 'PDF wird heruntergeladen...';
        const mergedPdfBytes = await mergedPdf.save();
        const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'Berichtshefte_2026_komplett.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

    } catch (error) {
        console.error('Fehler beim Erstellen der kombinierten PDF:', error);
        alert('Es gab einen Fehler beim Erstellen der PDF. Bitte versuchen Sie es erneut.');
    } finally {
        // Overlay ausblenden
        overlay.classList.remove('active');
    }
}

// Neue Funktion für den Theoriephase PDF-Download (erste Woche bis 10.10.2025)
async function downloadTheoriephasePDF() {
    // Zeige das Overlay
    const overlay = document.querySelector('.download-overlay');
    overlay.classList.add('active');

    try {
        // Alle Wochen-Items sammeln
        const allWeekItems = [
            ...document.querySelectorAll('#weekList2024 .week-item'),
            ...document.querySelectorAll('#weekList2025 .week-item')
        ];

        // Filtere nur Wochen bis einschließlich 10.10.2025
        const endDate = new Date('2025-10-10');
        const filteredWeeks = [];

        for (const weekItem of allWeekItems) {
            const dateSpan = weekItem.querySelector('.week-date');
            const dateText = dateSpan.textContent;
            const [startDateStr] = dateText.split(' - ');

            // Konvertiere das Datum aus dem deutschen Format (DD.MM.YYYY)
            const [day, month, year] = startDateStr.split('.');
            const weekDate = new Date(year, month - 1, day);

            // Füge nur Wochen hinzu, die bis einschließlich 10.10.2025 sind
            if (weekDate <= endDate) {
                filteredWeeks.push(weekItem);
            }
        }

        let mergedPdf = await PDFLib.PDFDocument.create();

        // Status-Text aktualisieren
        const statusText = document.querySelector('.download-status');
        let currentPage = 0;
        const totalPages = filteredWeeks.length;

        // Für jede Woche eine Seite erstellen
        for (const weekItem of filteredWeeks) {
            currentPage++;
            statusText.textContent = `Verarbeite Seite ${currentPage} von ${totalPages}...`;

            const dateSpan = weekItem.querySelector('.week-date');
            const dateText = dateSpan.textContent;
            const [startDate, endDate] = dateText.split(' - ');

            // Formular mit den Daten der Woche füllen
            document.getElementById('weekStart').value = startDate;
            document.getElementById('weekEnd').value = endDate;

            // Setze das korrekte Ausbildungsjahr basierend auf dem Jahr
            const year = startDate.split('.')[2];
            const yearInput = document.querySelector('.year-input');
            switch (year) {
                case '2024':
                    yearInput.value = '1';
                    break;
                case '2025':
                    yearInput.value = '2';
                    break;
            }

            document.querySelector('.number-input').value = calculateWeekNumber(startDate);

            // Lade die gespeicherten Daten für diese Woche
            await loadFormData(startDate);

            // Generiere PDF für diese Woche
            const element = document.querySelector('.container');

            // Vorbereitung für PDF-Export
            const textareas = element.querySelectorAll('.activity-input');
            textareas.forEach(textarea => {
                const text = textarea.value;
                const div = document.createElement('div');
                div.className = 'activity-input';
                div.innerHTML = text.replace(/\n/g, '<br>');
                textarea.parentNode.insertBefore(div, textarea);
                textarea.style.display = 'none';
            });

            // PDF für diese Woche generieren
            const pdfBytes = await html2pdf()
                .set({
                    margin: 0,
                    filename: `Berichtsheft_${startDate}.pdf`,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: {
                        scale: 2,
                        useCORS: true,
                        letterRendering: true,
                        width: 794,
                        height: 1123,
                        x: 0,
                        y: 0,
                        scrollY: 0,
                        windowWidth: 794,
                        windowHeight: 1123,
                        removeContainer: true,
                        logging: false,
                        backgroundColor: '#FFFFFF'
                    },
                    jsPDF: {
                        unit: 'mm',
                        format: 'a4',
                        orientation: 'portrait',
                        compress: true
                    }
                })
                .from(element)
                .outputPdf('arraybuffer');

            // PDF zur zusammengeführten PDF hinzufügen
            const currentPdf = await PDFLib.PDFDocument.load(pdfBytes);
            const copiedPages = await mergedPdf.copyPages(currentPdf, [0]);
            mergedPdf.addPage(copiedPages[0]);

            // Cleanup
            textareas.forEach(textarea => {
                textarea.style.display = '';
                const div = textarea.previousSibling;
                if (div && div.className === 'activity-input') {
                    div.remove();
                }
            });
        }

        // Finale PDF speichern und herunterladen
        statusText.textContent = 'PDF wird heruntergeladen...';
        const mergedPdfBytes = await mergedPdf.save();
        const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'Berichtshefte_Theoriephase_07-2024_bis_10-2025.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

    } catch (error) {
        console.error('Fehler beim Erstellen der kombinierten PDF:', error);
        alert('Es gab einen Fehler beim Erstellen der PDF. Bitte versuchen Sie es erneut.');
    } finally {
        // Overlay ausblenden
        overlay.classList.remove('active');
    }
}

// Event-Listener für den Batch-Download-Button
document.querySelector('.all2024files').addEventListener('click', downloadCombinedPDF2024);
document.querySelector('.all2025files').addEventListener('click', downloadCombinedPDF2025);
document.querySelector('.all2026files').addEventListener('click', downloadCombinedPDF2026);
document.querySelector('.theoriephase').addEventListener('click', downloadTheoriephasePDF);

function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

function updateWeekNumber() {
    const weekStartInput = document.getElementById('weekStart');
    const numberInput = document.querySelector('.number-input');

    if (weekStartInput.value) {
        const date = new Date(weekStartInput.value);
        const weekNumber = getWeekNumber(date);
        const year = date.getFullYear();
        numberInput.value = `${weekNumber}/${year}`;
    }
}

// Fügen Sie diesen Event-Listener zu Ihrem bestehenden Code hinzu
document.getElementById('weekStart').addEventListener('change', updateWeekNumber);