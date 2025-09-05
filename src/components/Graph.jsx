import './Graph.css'
import { useRef, useEffect } from 'react'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

export default function Graph() {
    const canvasRef = useRef(null)
    const chartRef = useRef(null)

    useEffect(() => {
        const ctx = canvasRef.current.getContext('2d')

        // Datos de ejemplo para Stacked Bar Chart
        const labels = ['Año 0', 'Año 1', 'Año 2', 'Año 3', 'Año 4', 'Año 5']

        // Dos datasets: aporte principal y crecimiento por intereses, para mostrar apilamiento
        const data = {
            labels,
            datasets: [
                {
                    label: 'Capital (aporte)',
                    data: [1000, 1100, 1200, 1300, 1400, 1500],
                    backgroundColor: 'rgba(6, 182, 0, 0.85)'
                },
                {
                    label: 'Interés acumulado',
                    data: [0, 100, 300, 600, 1000, 1500],
                    backgroundColor: 'rgba(5, 221, 70, 0.74)'
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

        // Crear instancia del chart
        chartRef.current = new Chart(ctx, config)

        return () => {
            // cleanup
            if (chartRef.current) {
                chartRef.current.destroy()
                chartRef.current = null
            }
        }
    }, [])

    return (
        <div className="graph-card">
            <div className="graph-header">Proyección</div>
            <div className="graph-body">
                <canvas ref={canvasRef} />
            </div>
        </div>
    )
}
