
import Inputs from './Inputs'
import Graph from './Graph'

function App() {
  return (
    <>
      <div className="container">
        <h1 className='title'>Interes Compuesto</h1>
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
