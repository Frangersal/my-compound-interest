import React from 'react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

// Componente reutilizable que recibe una ref a un elemento y muestra un
// botón que genera un PDF usando html2canvas + jsPDF. Captura canvases
// como imágenes y soporta multipágina.
export default function PdfExporter({ targetRef, graphRef = null, inputsRef = null, formValues = null, className, buttonText = 'Descargar resumen en PDF' }) {
    async function handleDownloadPDF() {
        if (!targetRef || !targetRef.current) return

        // EXTRAER tabla desde targetRef (results) para renderizar con autoTable
        const clonedTable = targetRef.current.querySelector('table')

        // Preparar resumen de inputs como filas de texto (para que sea texto plano en el PDF)
        const mf = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        const summaryRows = []
        if (formValues) {
            const deposit = formValues.deposit || 0
            const rate = formValues.rate || 0
            const years = formValues.years || 0
            const contrib = formValues.contrib || 0
            const contribInflation = formValues.contribInflation || 0
            const freqMap = { anualmente: 'Anualmente', mensualmente: 'Mensualmente', quincenalmente: 'Quincenalmente', semanalmente: 'Semanalmente', diariamente: 'Diariamente' }
            const freqLabel = freqMap[formValues.frequency] || formValues.frequency || 'Anualmente'

            summaryRows.push(['Depósito inicial', `$${mf.format(deposit)}`])
            summaryRows.push(['Tasa anual', `${rate}%`])
            summaryRows.push(['Años', `${years} ${years === 1 ? 'año' : 'años'}`])
            summaryRows.push(['Frecuencia', freqLabel])
            summaryRows.push(['Aportación periódica', `$${mf.format(contrib)}`])
            summaryRows.push(['Incremento % aportación', `${contribInflation}%`])
        } else if (inputsRef && inputsRef.current) {
            // Fallback: intentar extraer texto simple desde el DOM clonado
            try {
                const clone = inputsRef.current.cloneNode(true)
                const texts = Array.from(clone.querySelectorAll('label, input, span')).map(n => n.textContent && n.textContent.trim()).filter(Boolean)
                texts.forEach((t, i) => summaryRows.push([`Campo ${i + 1}`, t]))
            } catch (err) {
                // ignore
            }
        }

        // Obtener imagen del gráfico: preferir canvas.toDataURL cuando esté disponible
        let imgData = null
        let canvasWidth = 0
        let canvasHeight = 0
        if (graphRef && graphRef.current) {
            try {
                const graphCanvas = graphRef.current
                if (typeof graphCanvas.toDataURL === 'function') {
                    imgData = graphCanvas.toDataURL('image/png')
                    canvasWidth = graphCanvas.width
                    canvasHeight = graphCanvas.height
                }
            } catch (err) {
                // ignore and fallback to html2canvas below
            }
        }

        // Si no conseguimos la imagen vía toDataURL, usamos html2canvas sobre el canvas DOM
        let tempWrapper = null
        try {
            if (!imgData && graphRef && graphRef.current) {
                const tmp = document.createElement('div')
                tmp.style.position = 'fixed'
                tmp.style.left = '-9999px'
                tmp.appendChild(graphRef.current.cloneNode(true))
                document.body.appendChild(tmp)
                tempWrapper = tmp
                const c = await html2canvas(tmp, { scale: 2, useCORS: true })
                imgData = c.toDataURL('image/png')
                canvasWidth = c.width
                canvasHeight = c.height
            }

            const pdf = new jsPDF({ unit: 'pt', format: 'a4' })
            const pageWidth = pdf.internal.pageSize.getWidth()
            const pageHeight = pdf.internal.pageSize.getHeight()
            let pageJustAdded = false

            // Insertar título y párrafo introductorio antes de la tabla de valores
            const imgLeft = 20
            pdf.setFontSize(14)
            pdf.text('Calculadora de Interes Compuesto', imgLeft, 28)
            pdf.setFontSize(10)
            const intro = 'El interés compuesto es el interés calculado sobre el capital inicial más los intereses previamente generados; es decir, los intereses también generan intereses con el tiempo, lo que acelera el crecimiento del ahorro o la inversión.'
            const maxTextWidth = pageWidth - imgLeft * 2
            const splitIntro = pdf.splitTextToSize(intro, maxTextWidth)
            // colocar el párrafo debajo del título
            const introStartY = 40
            pdf.text(splitIntro, imgLeft, introStartY)

            // Calcular startY para la tabla de resumen (debajo del párrafo)
            const lineHeight = 12
            const introHeight = splitIntro.length * lineHeight
            const summaryStartY = introStartY + introHeight + 12

            // Primero: renderizar el resumen como tabla de texto (autoTable)
            if (summaryRows.length > 0) {
                autoTable(pdf, {
                    head: [['Campo', 'Valor']],
                    body: summaryRows,
                    startY: summaryStartY,
                    theme: 'grid',
                    styles: { fontSize: 11, cellPadding: 4 },
                    headStyles: { fillColor: [240, 240, 240], textColor: 20 }
                })
            }

            // Calcular Y donde colocar la imagen del gráfico
            const availableWidth = pageWidth - imgLeft * 2
            const scaledImgWidth = availableWidth
            const scaledImgHeight = canvasWidth ? (canvasHeight * scaledImgWidth) / canvasWidth : 0
            const startY = pdf.lastAutoTable ? (pdf.lastAutoTable.finalY + 12) : 40

            if (imgData) {
                    // Añadir imagen(s) centradas al tamaño real (no agrandar). Convertir px -> pt (72/96)
                    const pxToPt = 72 / 96
                    const imgWpt = (canvasWidth || 0) * pxToPt
                    const imgHpt = (canvasHeight || 0) * pxToPt
                    const maxW = availableWidth
                    let drawW = imgWpt
                    let drawH = imgHpt
                    // No agrandar: si la imagen es más ancha que el espacio, escalar hacia abajo
                    if (drawW > maxW) {
                        const scl = maxW / drawW
                        drawW = drawW * scl
                        drawH = drawH * scl
                    }
                    const left = (pageWidth - drawW) / 2
                    const pageUsableHeightPt = pageHeight - startY - 20

                    if (drawH <= pageUsableHeightPt) {
                        pdf.addImage(imgData, 'PNG', left, startY, drawW, drawH)
                        pdf.addPage(); pageJustAdded = true
                    } else {
                        // dividir la imagen en trozos verticales manteniendo tamaño real
                        const img = new Image()
                        img.src = imgData
                        // crear canvas fuente en px
                        const sourceCanvas = document.createElement('canvas')
                        const sCtx = sourceCanvas.getContext('2d')
                        const srcW = canvasWidth || img.width
                        const srcH = canvasHeight || img.height
                        sourceCanvas.width = srcW
                        sourceCanvas.height = srcH
                        sCtx.drawImage(img, 0, 0)

                        // pieza en px: corresponde a la altura util de página en pt convertido a px
                        const pieceHeightPx = Math.floor(pageUsableHeightPt / pxToPt)
                        const pageCanvas = document.createElement('canvas')
                        const pageCtx = pageCanvas.getContext('2d')
                        pageCanvas.width = srcW
                        pageCanvas.height = pieceHeightPx

                        let remainingPx = srcH
                        let pos = 0
                        while (remainingPx > 0) {
                            pageCtx.clearRect(0, 0, pageCanvas.width, pageCanvas.height)
                            const h = Math.min(pageCanvas.height, remainingPx)
                            pageCtx.drawImage(sourceCanvas, 0, pos, sourceCanvas.width, h, 0, 0, pageCanvas.width, h)
                            const pieceData = pageCanvas.toDataURL('image/png')
                            const pieceHpt = h * pxToPt * (drawW / imgWpt) // scale factor if we scaled width earlier
                            pdf.addImage(pieceData, 'PNG', left, startY, drawW, pieceHpt)
                            remainingPx -= h
                            pos += h
                            if (remainingPx > 0) { pdf.addPage(); pageJustAdded = true }
                        }
                        pdf.addPage(); pageJustAdded = true
                    }
            }

            // Finalmente renderizar la tabla de desglose anual desde targetRef (como datos, no captura)
            if (clonedTable) {
                // Asegurar que la tabla comience al inicio de una página
                if (!pageJustAdded) { pdf.addPage(); pageJustAdded = true }
                const headers = Array.from(clonedTable.querySelectorAll('thead th')).map(h => h.textContent.trim())
                const rows = Array.from(clonedTable.querySelectorAll('tbody tr')).map(tr =>
                    Array.from(tr.querySelectorAll('td')).map(td => td.textContent.trim())
                )
                autoTable(pdf, {
                    head: [headers],
                    body: rows,
                    startY: 40,
                    theme: 'striped',
                    styles: { halign: 'center' }
                })
            }

            // Añadir pie de página (disclaimer) en todas las páginas
            try {
                const footer = 'Esta aplicación tiene fines exclusivamente didácticos y no constituye una recomendación de inversión. Para obtener orientación financiera adecuada, consulte con un especialista certificado.'
                const footerFontSize = 8
                pdf.setFontSize(footerFontSize)
                const pageCount = pdf.getNumberOfPages()
                const footerMaxWidth = pageWidth - 40
                const footerLines = pdf.splitTextToSize(footer, footerMaxWidth)
                for (let i = 1; i <= pageCount; i++) {
                    pdf.setPage(i)
                    const y = pageHeight - 20 - (footerLines.length - 1) * 4
                    pdf.text(footerLines, pageWidth / 2, y, { align: 'center' })
                }
            } catch (e) {
                // ignore footer rendering errors
            }

            pdf.save('resumen calculo interes compuesto.pdf')
        } catch (err) {
            console.error('Error generando PDF:', err)
            const printWindow = window.open('', '_blank')
            if (printWindow) {
                printWindow.document.write('<html><head><title>Resumen</title>')
                printWindow.document.write('<style>body{font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial; padding:20px; color:#222} .results-card{background:transparent;border-radius:8px;padding:0} table{width:100%;border-collapse:collapse} th,td{padding:8px;border:1px solid #ddd;text-align:center} thead th{font-weight:700}</style>')
                printWindow.document.write('</head><body>')
                printWindow.document.write(targetRef.current.innerHTML)
                printWindow.document.write('</body></html>')
                printWindow.document.close()
                printWindow.focus()
                setTimeout(() => printWindow.print(), 250)
            }
        } finally {
            // limpiar el contenedor temporal si se creó
            try {
                if (tempWrapper && tempWrapper.parentNode) document.body.removeChild(tempWrapper)
            } catch (e) {
                // ignore
            }
        }
    }

    return (
        <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" className={className || 'btn-download'} onClick={handleDownloadPDF}>{buttonText}</button>
        </div>
    )
}
