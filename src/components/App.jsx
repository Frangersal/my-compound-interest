
import Inputs from './Inputs'
import Graph from './Graph'

function App() {
  return (
    <>
      <div className="container">
        <h1 className='title'>Calculadora de Interes Compuesto 💸</h1>
        <p className="lead">El interés compuesto es el interés calculado sobre el capital inicial más los intereses previamente generados; es decir, los intereses también generan intereses con el tiempo, lo que acelera el crecimiento del ahorro o la inversión.</p>
        <div className="content">
          <div className="content-left">
            <Inputs />
          </div>
          <div className="content-right">
            <Graph />
          </div>
        </div>

      </div>
    </>
  )
}

export default App
