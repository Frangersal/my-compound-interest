import '../assets/style/Results.css'
import React from 'react'
import initialIcon from '../assets/icons/inicial.svg'
import depositosIcon from '../assets/icons/depositos.svg'
import interesIcon from '../assets/icons/interes.svg'
import totalIcon from '../assets/icons/total.svg'

// Componente simple que muestra un resumen de resultados basado en los valores
// recibidos desde el formulario. Calcula el balance final aproximado usando
// la misma lógica de capitalización por periodos que el gráfico (simplificada).
export default function Results({ values = {} }) {
    const { deposit = 0, rate = 0, years = 0, contrib = 0, frequency = 'anualmente' } = values

    // Convertir tasa anual a decimal y periodos por año
    const r = Number(rate) / 100
    const m = frequency === 'mensualmente' ? 12 : frequency === 'quincenalmente' ? 24 : frequency === 'semanalmente' ? 52 : frequency === 'diariamente' ? 365 : 1

    let balance = Number(deposit)
    for (let y = 1; y <= Number(years); y++) {
        for (let p = 0; p < m; p++) {
            balance = balance * (1 + r / m)
            balance = balance + Number(contrib)
        }
    }

    const depositInicial = Number(deposit)
    const depositosAdicionales = Number(contrib) * (m * Number(years))
    const totalAportado = depositInicial + depositosAdicionales
    // Mantener los valores con centavos para mostrar .00
    const interesesRaw = balance - totalAportado
    const intereses = Math.max(0, interesesRaw)
    const finalBalance = balance

    const moneyFormatter = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

    return (
        <div className="content-bottom">
            <div className="results-card">
                <h3>Resultados</h3>
                <div className="results-grid">
                    <div className="result-item result-inicial">
                        <div className="label">Depósito inicial</div>
                        <div className="result-icon"><img src={initialIcon} alt="Depósito inicial"/></div>
                        <div className="value">${moneyFormatter.format(depositInicial)}</div>
                    </div>
                    <div className="result-item result-depositos">
                        <div className="label">Depósitos adicionales</div>
                        <div className="result-icon"><img src={depositosIcon} alt="Depósitos adicionales"/></div>
                        <div className="value">${moneyFormatter.format(depositosAdicionales)}</div>
                    </div>
                    <div className="result-item result-interes">
                        <div className="label">Interés acumulado</div>
                        <div className="result-icon"><img src={interesIcon} alt="Interés acumulado"/></div>
                        <div className="value">${moneyFormatter.format(intereses)}</div>
                    </div>
                    <div className="result-item result-total">
                        <div className="label">Total</div>
                        <div className="result-icon"><img src={totalIcon} alt="Total"/></div>
                        <div className="value">${moneyFormatter.format(finalBalance)}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
