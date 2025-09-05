import './Graph.css'
import { useRef, useEffect } from 'react'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

export default function Graph() {
    const canvasRef = useRef(null)
    const chartRef = useRef(null)

    useEffect(() => {
        const ctx = canvasRef.current.getContext('2d')

        // Datos de ejemplo
        const labels = ['0', '1', '2', '3', '4', '5']
        const data = {
            labels,
            datasets: [
                {
                    label: 'Balance proyectado',
                    data: [1000, 1200, 1500, 1900, 2400, 3000],
                    fill: true,
                    backgroundColor: 'rgba(140,166,219,0.2)',
                    borderColor: 'rgba(140,166,219,1)',
                    tension: 0.3,
                },
            ],
        }

        const config = {
            type: 'line',
            data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { display: true, title: { display: false } },
                    y: { display: true, title: { display: false } },
                },
                plugins: {
                    legend: { display: true, position: 'top' },
                    tooltip: { enabled: true },
                },
            },
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
