
import { useState, useRef } from 'react'
import Inputs from './Inputs'
import Graph from './Graph'
import Results from './Results'
import Footer from './Footer'

function App() {
  const [values, setValues] = useState({
    deposit: 100000,
    rate: 9,
    years: 20,
    contrib: 10000,
    contribInflation: 5,
    frequency: 'anualmente'
  })

  const graphRef = useRef(null)
  const inputsRef = useRef(null)

  function handleValuesChange(next) {
    setValues(prev => ({ ...prev, ...next }))
  }

  return (
    <>
      <div className="container">
        <h1 className='title'>Calculadora de Interes Compuesto 💸</h1>
        <p className="lead">El interés compuesto es el interés calculado sobre el capital inicial más los intereses previamente generados; es decir, los intereses también generan intereses con el tiempo, lo que acelera el crecimiento del ahorro o la inversión.</p>
        <div className="content">
          <div className="content-left">
            <Inputs ref={inputsRef} onValuesChange={handleValuesChange} initialValues={values} />
          </div>
          <div className="content-right">
            <Graph values={values} canvasRef={graphRef} />
          </div>
        </div>

        {/* Nueva sección inferior para mostrar resultados resumidos */}
        <div className="content-bottom-wrapper">
          <div className="content-bottom-inner">
            <Results values={values} graphRef={graphRef} inputsRef={inputsRef} />
          </div>
        </div>
        <p className="disclaimer">
          Esta aplicación tiene fines exclusivamente didácticos y no constituye una recomendación de inversión.
          Para obtener orientación financiera adecuada, consulte con un especialista certificado.
        </p>

      </div>
      <Footer />
    </>
  )
}

export default App
