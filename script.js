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
        const dateSpan = document.createElement('span');
        dateSpan.className = 'week-date';
        dateSpan.textContent = `${startDateStr} - ${endDateStr}`;
        
        // Click-Event nur für das Datum
        dateSpan.addEventListener('click', () => {
            document.querySelectorAll('.week-item').forEach(item => {
                item.classList.remove('active');
            });
            li.classList.add('active');
            
            document.getElementById('weekStart').value = startDateStr;
            document.getElementById('weekEnd').value = endDateStr;
        });
        
        const downloadButton = document.createElement('button');
        downloadButton.className = 'week-download-button';
        downloadButton.innerHTML = '<i class="fi fi-sr-download"></i>';
        
        // Event-Listener für den Download-Button
        downloadButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Verhindert das Auslösen des Click-Events des Eltern-Elements
            
            // Setze die Daten im Hauptformular
            document.getElementById('weekStart').value = startDateStr;
            document.getElementById('weekEnd').value = endDateStr;
            
            // Führe den Download aus
            exportToPDF();
        });
        
        li.appendChild(dateSpan);
        li.appendChild(downloadButton);
        
        weekList.appendChild(li);
        currentDate.setDate(currentDate.getDate() + 7);
    }
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

document.addEventListener('DOMContentLoaded', function() {
    generateWeeksList();
    initializeYearButtons();
});

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

    // Textareas vorbereiten für PDF-Export
    const textareas = element.querySelectorAll('.activity-input');
    textareas.forEach(textarea => {
        // Ersetze \n mit <br> für HTML-Rendering
        const text = textarea.value;
        const div = document.createElement('div');
        div.className = 'activity-input';
        div.innerHTML = text.replace(/\n/g, '<br>');
        textarea.parentNode.insertBefore(div, textarea);
        textarea.style.display = 'none';
    });

    const opt = {
        margin: 0,
        filename: 'Ausbildungsnachweis.pdf',
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { 
            scale: 2,
            useCORS: true,
            letterRendering: true,
            height: 1123, // 297mm in Pixel bei 96dpi
        },
        jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait',
            putOnlyUsedFonts: true
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