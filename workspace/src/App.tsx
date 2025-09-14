import React from 'react';
import { Button } from './components/Button';

function App() {
  return (
    <div className="app">
      <h1>Welcome to JellyAI</h1>
      <Button onClick={() => console.log('Hello!')}>
        Click me
      </Button>
    </div>
  );
}

export default App;