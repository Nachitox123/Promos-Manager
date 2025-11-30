import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <h1> Login</h1>
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => console.log(e.target.value)}
        />
        <br />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => console.log(e.target.value)}
        />
        <br />
        <button onClick={() => setCount(count + 1)}>Login</button>
      </div>
    </>
  )
}

export default App
