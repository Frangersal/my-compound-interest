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
    const { deposit = 0, rate = 0, years = 0, contrib = 0, contribInflation = 0, frequency = 'anualmente' } = values

    // Convertir tasa anual a decimal y periodos por año
    const r = Number(rate) / 100
    const m = frequency === 'mensualmente' ? 12 : frequency === 'quincenalmente' ? 24 : frequency === 'semanalmente' ? 52 : frequency === 'diariamente' ? 365 : 1

    // Calcular balance final y aportaciones acumuladas considerando
    // que las aportaciones aumentan un % anual definido por contribInflation.
    const inc = Number(contribInflation) / 100
    let balance = Number(deposit)
    let contribYear = Number(contrib)
    let totalContrib = 0

    for (let y = 1; y <= Number(years); y++) {
        // Por cada periodo dentro del año: aplicar el interés del periodo
        // sobre el saldo actual y luego sumar la aportación periódica al final
        // del periodo. Además acumulamos esa aportación en totalContrib.
        for (let p = 0; p < m; p++) {
            balance = balance * (1 + r / m)
            balance = balance + contribYear
            totalContrib += contribYear
        }

        // Al finalizar el año, incrementamos la aportación periódica para
        // el siguiente año usando el porcentaje `contribInflation`.
        contribYear = contribYear * (1 + inc)
    }

    const depositInicial = Number(deposit)
    const depositosAdicionales = totalContrib
    const totalAportado = depositInicial + depositosAdicionales
    // Intereses acumulados (mantener >= 0)
    const interesesRaw = balance - totalAportado
    const intereses = Math.max(0, interesesRaw)
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

    return (
        <div className="content-bottom">
            <div className="results-card">
                <h3>Resultados</h3>
                <div className="results-grid">
                    <div className="result-item result-inicial">
                        <div className="label">Depósito inicial</div>
                        <div className="result-icon"><img src={initialIcon} alt="Depósito inicial"/></div>
                        <div className={clsDepositInicial}>${fDepositInicial.text}</div>
                    </div>
                    <div className="result-item result-depositos">
                        <div className="label">Depósitos adicionales</div>
                        <div className="result-icon"><img src={depositosIcon} alt="Depósitos adicionales"/></div>
                        <div className={clsDepositosAdicionales}>${fDepositosAdicionales.text}</div>
                    </div>
                    <div className="result-item result-interes">
                        <div className="label">Interés acumulado</div>
                        <div className="result-icon"><img src={interesIcon} alt="Interés acumulado"/></div>
                        <div className={clsIntereses}>${fIntereses.text}</div>
                    </div>
                    <div className="result-item result-total">
                        <div className="label">Total</div>
                        <div className="result-icon"><img src={totalIcon} alt="Total"/></div>
                        <div className={clsFinalBalance}>${fFinalBalance.text}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
