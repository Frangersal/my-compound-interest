import '../assets/style/Results.css'
import React from 'react'
import initialIcon from '../assets/icons/inicial.svg'
import depositosIcon from '../assets/icons/depositos.svg'
import interesIcon from '../assets/icons/interes.svg'
import totalIcon from '../assets/icons/total.svg'
import PdfExporter from './PdfExporter'

// Componente simple que muestra un resumen de resultados basado en los valores
// recibidos desde el formulario. Calcula el balance final aproximado usando
// la misma lógica de capitalización por periodos que el gráfico (simplificada).
export default function Results({ values = {}, graphRef = null, inputsRef = null }) {
    const { deposit = 0, rate = 0, years = 0, contrib = 0, contribInflation = 0, frequency = 'anualmente' } = values

    // Convertir tasa anual a decimal y periodos por año
    const r = Number(rate) / 100
    const m = frequency === 'mensualmente' ? 12 : frequency === 'quincenalmente' ? 24 : frequency === 'semanalmente' ? 52 : frequency === 'diariamente' ? 365 : 1

    // Calcular balance y generar un desglose por año.
    // Las aportaciones periódicas aumentan `contribInflation` % cada año.
    const inc = Number(contribInflation) / 100
    let balance = Number(deposit)
    let contribYear = Number(contrib)

    // yearsData almacenará por cada año: año, saldo inicial, aportación anual,
    // rendimiento (interés) del año y saldo final.
    const yearsData = []
    let totalContrib = 0
    let totalInterest = 0

    for (let y = 1; y <= Number(years); y++) {
        const startBalance = balance
        let yearContrib = 0
        let yearInterest = 0

        // Por cada periodo dentro del año: aplicar interés y luego sumar aportación
        for (let p = 0; p < m; p++) {
            const before = balance
            balance = balance * (1 + r / m)
            const interest = balance - before
            yearInterest += interest
            balance = balance + contribYear
            yearContrib += contribYear
            totalContrib += contribYear
        }

        const endBalance = balance
        yearsData.push({ year: y, startBalance, contrib: yearContrib, interest: yearInterest, endBalance })
        totalInterest += yearInterest

        // Incrementar la aportación periódica para el siguiente año
        contribYear = contribYear * (1 + inc)
    }

    const depositInicial = Number(deposit)
    const depositosAdicionales = totalContrib
    const totalAportado = depositInicial + depositosAdicionales
    const intereses = Math.max(0, totalInterest)
    const finalBalance = balance

    const moneyFormatter = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

    // Helper: formatea valores muy grandes en notación científica y
    // añade una clase para reducir su tamaño visual.
    function formatLarge(n) {
        const abs = Math.abs(n)
        // Umbral: usar notación científica sólo para números muy grandes.
        // Cambiado a 1e15 (cuatrillones en escala corta) para que no se active
        // en cifras 'grandes' habituales como millones o miles de millones.
        const isSci = abs >= 1e15
        // Detectar si el entero tiene más de 12 dígitos (>= 1e12)
        const isLargeDigits = abs >= 1e12
        if (isSci) {
            return { text: n.toExponential(2), isSci: true, isLargeDigits }
        }
        return { text: moneyFormatter.format(n), isSci: false, isLargeDigits }
    }

 
    // Precomputar las versiones formateadas de cada métrica.
    // formatLarge devuelve { text, isSci } para decidir presentación y clase.
    const fDepositInicial = formatLarge(depositInicial)
    const fDepositosAdicionales = formatLarge(depositosAdicionales)
    const fIntereses = formatLarge(intereses)
    const fFinalBalance = formatLarge(finalBalance)

    // Precomputar className para cada valor (si está en notación científica
    // añadimos la clase 'value--sci' para reducir el tamaño visual).
    const clsDepositInicial = 'value' + (fDepositInicial.isSci ? ' value--sci' : '') + (fDepositInicial.isLargeDigits ? ' value--small' : '')
    const clsDepositosAdicionales = 'value' + (fDepositosAdicionales.isSci ? ' value--sci' : '') + (fDepositosAdicionales.isLargeDigits ? ' value--small' : '')
    const clsIntereses = 'value' + (fIntereses.isSci ? ' value--sci' : '') + (fIntereses.isLargeDigits ? ' value--small' : '')
    const clsFinalBalance = 'value' + (fFinalBalance.isSci ? ' value--sci' : '') + (fFinalBalance.isLargeDigits ? ' value--small' : '')

    // Ref para acceder a la tarjeta de resultados y pasarla al exportador
    const cardRef = React.useRef(null)

    return (
        <div className="content-bottom">
            <div className="results-card" ref={cardRef}>
                <h3>Resultados</h3>
                <div className="results-grid">
                    <div className="result-item result-inicial">
                        <div className="label">Depósito inicial</div>
                        <div className="result-icon"><img src={initialIcon} alt="Depósito inicial"/></div>
                        <div className={clsDepositInicial}>${fDepositInicial.text}</div>
                    </div>
                    <div className="result-item result-depositos">
                        <div className="label">Aportacion acumulada</div>
                        <div className="result-icon"><img src={depositosIcon} alt="Depósitos adicionales"/></div>
                        <div className={clsDepositosAdicionales}>${fDepositosAdicionales.text}</div>
                    </div>
                    <div className="result-item result-interes">
                        <div className="label">Rendimiento acumulado</div>
                        <div className="result-icon"><img src={interesIcon} alt="Interés acumulado"/></div>
                        <div className={clsIntereses}>${fIntereses.text}</div>
                    </div>
                    <div className="result-item result-total">
                        <div className="label">Total</div>
                        <div className="result-icon"><img src={totalIcon} alt="Total"/></div>
                        <div className={clsFinalBalance}>${fFinalBalance.text}</div>
                    </div>
                </div>

                {/* Tabla de desglose anual debajo de los result-items */}
                <div className="results-table-wrapper">
                    <h4>Desglose anual</h4>
                    <div className="table-responsive">
                        <table className="table table-sm table-striped table-hover results-table">
                            <thead>
                                <tr>
                                    <th>Año</th>
                                    <th>Depósito inicial</th>
                                    <th>Aportación</th>
                                    <th>Rendimiento</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {yearsData.map((row) => (
                                    <tr key={row.year}>
                                        <td>{row.year}</td>
                                        <td>${moneyFormatter.format(row.startBalance)}</td>
                                        <td>${moneyFormatter.format(row.contrib)}</td>
                                        <td>${moneyFormatter.format(row.interest)}</td>
                                        <td>${moneyFormatter.format(row.endBalance)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <PdfExporter targetRef={cardRef} graphRef={graphRef} inputsRef={inputsRef} formValues={values} className="btn-download" />
                </div>
            </div>
        </div>
    )
}
