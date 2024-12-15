function generateWeeks() {
    const startDate = new Date('2024-07-08');
    const endDate = new Date('2026-07-08');
    const weekStartList = document.getElementById('weekdays');
    const weekEndList = document.getElementById('weekdays-end');
    
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
        // Start der Woche
        const startOption = document.createElement('option');
        const startDateStr = currentDate.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        startOption.value = startDateStr;
        weekStartList.appendChild(startOption);
        
        // Ende der Woche (5 Tage später)
        const endDate = new Date(currentDate);
        endDate.setDate(endDate.getDate() + 4);
        const endOption = document.createElement('option');
        const endDateStr = endDate.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        endOption.value = endDateStr;
        weekEndList.appendChild(endOption);
        
        // Nächste Woche
        currentDate.setDate(currentDate.getDate() + 7);
    }
}

// Ausführen der Funktion beim Laden der Seite
generateWeeks();

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