
import { useState } from 'react'
import Inputs from './Inputs'
import Graph from './Graph'

function App() {
  const [values, setValues] = useState({
    deposit: 1000,
    rate: 9,
    years: 5,
    contrib: 100,
    frequency: 'anualmente'
  })

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
            <Inputs onValuesChange={handleValuesChange} initialValues={values} />
          </div>
          <div className="content-right">
            <Graph values={values} />
          </div>
        </div>

      </div>
    </>
  )
}

export default App
