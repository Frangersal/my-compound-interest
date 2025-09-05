import '../assets/style/Graph.css'
import { useRef, useEffect } from 'react'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

// Helper: calcula series anuales para el gráfico.
// Nota: Esta función realiza una aproximación de capitalización por periodos
// en función de la `frequency` (anualmente, mensualmente, quincenalmente,
// semanalmente, diariamente). Se asume:
// - `rate` es la tasa anual en porcentaje (ej. 8 para 8%).
// - `contrib` son aportes regulares que se añaden al final de cada periodo.
// - Los aportes totales aproximados se calculan como deposit + contrib * (periodos_totales).
// Esta implementación prioriza claridad y rendimiento para la UI; si necesitas
// precisión financiera exacta (por ejemplo, tratamiento de aportes al principio
// de periodo o intereses prorrateados con mayor exactitud), lo podemos ajustar.
// IMPORTANTE: los colores de los datasets se mantienen tal como estaban (no los cambiamos).
function computeSeries({ deposit = 1000, rate = 8, years = 5, contrib = 0, frequency = 'anualmente' }) {
    const labels = []
    const depositSeries = []
    const contribSeries = []
    const intereses = []

    // Convierte la tasa anual a decimal
    const r = Number(rate) / 100
    // Aproximación de periodos por año según la frecuencia seleccionada
    const m = frequency === 'mensualmente' ? 12 : frequency === 'quincenalmente' ? 24 : frequency === 'semanalmente' ? 52 : frequency === 'diariamente' ? 365 : 1

    // Para cada año calculamos el balance al final del año mediante capitalización
    // discreta por los m periodos definidos (p. ej. 12 para mensual). Se aplica el
    // interés periodo a periodo y luego se añade la contribución del periodo.
    let balance = Number(deposit)
    labels.push('Año 0')
    depositSeries.push(Number(deposit))
    contribSeries.push(0)
    intereses.push(0)

    for (let y = 1; y <= Number(years); y++) {
        // Capitalizamos a través de m periodos dentro del año
        for (let p = 0; p < m; p++) {
            const periodRate = r / m
            // Acumulamos el interés sobre el saldo actual
            balance = balance * (1 + periodRate)
            // Añadimos la contribución al final de cada periodo
            balance = balance + Number(contrib)
        }
        // A modo de aproximación: separamos el depósito inicial (constante) de las
        // aportaciones adicionales acumuladas hasta ese año.
        const contribAcum = Number(contrib) * (m * y)
        labels.push(`Año ${y}`)
        depositSeries.push(Number(deposit))
        contribSeries.push(contribAcum)
        intereses.push(Math.max(0, Math.round(balance - (Number(deposit) + contribAcum))))
    }

    return { labels, depositSeries, contribSeries, intereses }
}

export default function Graph({ values = {} }) {
    const canvasRef = useRef(null)
    const chartRef = useRef(null)

    // Efecto que crea el chart y lo actualiza cuando cambian los valores.
    // - Si no existe la instancia se crea una nueva.
    // - Si ya existe, actualizamos `data` y llamamos a `update()` para mantener
    //   la instancia (evita recrear estilos/colores y preserve estado del legend).
    useEffect(() => {
        const ctx = canvasRef.current.getContext('2d')

        const { labels, depositSeries, contribSeries, intereses } = computeSeries(values)

        const data = {
            labels,
            datasets: [
                {
                    // Depósito inicial (parte fija que aporta el capital de inicio)
                    label: 'Capital inicial',
                    data: depositSeries,
                    backgroundColor: '#039e00'
                },
                {
                    // Aportaciones adicionales acumuladas hasta cada año
                    label: 'Aportaciones adicionales',
                    data: contribSeries,
                    backgroundColor: '#ffca28'
                },
                {
                    label: 'Interés acumulado',
                    data: intereses,
                    backgroundColor: '#fb8c00'
                }
            ]
        }

        const config = {
            type: 'bar',
            data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, position: 'top' },
                    tooltip: { enabled: true }
                },
                scales: {
                    x: {
                        stacked: true,
                        display: true,
                    },
                    y: {
                        stacked: true,
                        display: true,
                        beginAtZero: true
                    }
                }
            }
        }

        // Crear o actualizar instancia del chart según exista o no
        if (chartRef.current) {
            chartRef.current.data = data
            chartRef.current.update()
        } else {
            chartRef.current = new Chart(ctx, config)
        }

        // Cleanup: al desmontar componente destruimos la instancia para liberar memoria
        return () => {
            if (chartRef.current) {
                chartRef.current.destroy()
                chartRef.current = null
            }
        }
    }, [values])

    return (
        <div className="graph-card">
            <div className="graph-header">Proyección</div>
            <div className="graph-body">
                <canvas ref={canvasRef} />
            </div>
        </div>
    )
}
