import React from 'react'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import html2canvas from 'html2canvas'

export default function ExcelExporter({ formValues, yearsData, graphRef, className, buttonText = 'Descargar resumen en Excel' }) {
    async function handleDownloadExcel() {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Resultados');

        // Estilos para la cabecera
        const headerStyle = {
            font: { bold: true, color: { argb: 'FFFFFFFF' } },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } },
            alignment: { horizontal: 'center' }
        };

        // 1. Resumen de Inputs
        sheet.addRow(['Resumen de Datos Iniciales']);
        sheet.getRow(1).font = { bold: true, size: 14 };
        sheet.addRow([]);

        const freqMap = { anualmente: 'Anualmente', mensualmente: 'Mensualmente', quincenalmente: 'Quincenalmente', semanalmente: 'Semanalmente', diariamente: 'Diariamente' };
        const freqLabel = formValues ? (freqMap[formValues.frequency] || formValues.frequency || 'Anualmente') : '';
        const timingLabel = formValues?.timing === 'inicio' ? 'Al inicio del periodo' : 'Al final del periodo';

        const summaryData = [
            ['Depósito inicial', formValues?.deposit || 0],
            ['Tasa anual (%)', (formValues?.rate || 0)],
            ['Años', formValues?.years || 0],
            ['Frecuencia', freqLabel],
            ['Momento del pago', timingLabel],
            ['Aportación periódica', formValues?.contrib || 0],
            ['Incremento % aportación', (formValues?.contribInflation || 0)]
        ];

        summaryData.forEach(row => {
            const addedRow = sheet.addRow(row);
            // Si el valor es número de moneda, le podemos dar formato
            if (typeof row[1] === 'number' && ['Depósito inicial', 'Aportación periódica'].includes(row[0])) {
                addedRow.getCell(2).numFmt = '"$"#,##0.00';
            }
            // Alinear texto a la derecha para Frecuencia y Momento del pago
            if (['Frecuencia', 'Momento del pago'].includes(row[0])) {
                addedRow.getCell(2).alignment = { horizontal: 'right' };
            }
        });

        sheet.getColumn(1).width = 25;
        sheet.getColumn(2).width = 20;

        sheet.addRow([]);
        sheet.addRow([]);

        // 2. Tabla Desglose Anual
        sheet.addRow(['Desglose Anual']);
        sheet.getRow(sheet.lastRow.number).font = { bold: true, size: 14 };
        sheet.addRow([]);

        const tableHeaders = ['Año', 'Depósito inicial', 'Aportación', 'Rendimiento', 'Total'];
        const headerRow = sheet.addRow(tableHeaders);
        
        headerRow.eachCell((cell) => {
            cell.font = headerStyle.font;
            cell.fill = headerStyle.fill;
            cell.alignment = headerStyle.alignment;
        });

        if (yearsData && yearsData.length > 0) {
            yearsData.forEach(row => {
                const dataRow = sheet.addRow([
                    row.year,
                    row.startBalance,
                    row.contrib,
                    row.interest,
                    row.endBalance
                ]);
                
                // Formato de moneda para columnas B, C, D, E (2, 3, 4, 5)
                [2, 3, 4, 5].forEach(colIndex => {
                    dataRow.getCell(colIndex).numFmt = '"$"#,##0.00';
                });
            });
        }

        // Ajustar anchos opcionales si hiciera falta antes de la tabla 3...

        sheet.addRow([]);
        sheet.addRow([]);

        // 3. Tabla Desglose Acumulado
        sheet.addRow(['Desglose Acumulado']);
        sheet.getRow(sheet.lastRow.number).font = { bold: true, size: 14 };
        sheet.addRow([]);

        const cumulativeHeaders = ['Año', 'Depósito inicial', 'Aportación acumulada', 'Rendimiento acumulado', 'Total'];
        const cumulativeHeaderRow = sheet.addRow(cumulativeHeaders);
        
        cumulativeHeaderRow.eachCell((cell) => {
            cell.font = headerStyle.font;
            cell.fill = headerStyle.fill;
            cell.alignment = headerStyle.alignment;
        });

        if (yearsData && yearsData.length > 0) {
            let cumulativeContrib = 0;
            let cumulativeInterest = 0;
            const initialDeposit = Number(formValues?.deposit || 0);

            yearsData.forEach(row => {
                // Sumamos el valor anual al acumulado
                cumulativeContrib += row.contrib;
                cumulativeInterest += row.interest;
                
                // Total en este punto sigue la fórmula solicitada: INICIO + APORTACIONES ACUMULADAS + RENDIMIENTO ACUMULADO
                const total = initialDeposit + cumulativeContrib + cumulativeInterest;

                const dataRow = sheet.addRow([
                    row.year,
                    initialDeposit,
                    cumulativeContrib,
                    cumulativeInterest,
                    total
                ]);
                
                // Formato de moneda
                [2, 3, 4, 5].forEach(colIndex => {
                    dataRow.getCell(colIndex).numFmt = '"$"#,##0.00';
                });
            });
        }

        // Ajustar anchos de columnas de ambas tablas
        sheet.getColumn(3).width = 25;
        sheet.getColumn(4).width = 25;
        sheet.getColumn(5).width = 22;

        // 4. Capturar e incrustar el gráfico si existe la referencia
        if (graphRef && graphRef.current) {
            try {
                // Capturar el gráfico como imagen en base64
                const canvas = await html2canvas(graphRef.current, { scale: 2 });
                const base64Image = canvas.toDataURL('image/png');

                // Mantener la proporción de la imagen
                const imgWidth = 600;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                // Agregar la imagen al libro de trabajo
                const imageId = workbook.addImage({
                    base64: base64Image,
                    extension: 'png',
                });

                sheet.addRow([]);
                sheet.addRow([]);
                sheet.addRow(['Gráfico de Rendimiento']);
                sheet.getRow(sheet.lastRow.number).font = { bold: true, size: 14 };
                sheet.addRow([]);

                // Insertar la imagen en la hoja (justo debajo del título del gráfico)
                sheet.addImage(imageId, {
                    tl: { col: 1, row: sheet.lastRow.number }, // Columna B, fila actual
                    ext: { width: imgWidth, height: imgHeight }
                });
            } catch (error) {
                console.error("Error al capturar el gráfico para el Excel:", error);
            }
        }

        // Generar archivo y descargar
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, 'Resultados_Interes_Compuesto.xlsx');
    }

    return (
        <button type="button" className={className || 'btn-download'} onClick={handleDownloadExcel}>
            {buttonText}
        </button>
    )
}
