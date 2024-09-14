import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import React from 'react';

class ErrorBoundary extends React.Component{
  state: {error: any}
  declare props: any
  constructor(props:any){
    super(props);
    this.state = {error: null}
  }

  static getDerivedStateFromError(error:any){
    return {error}
  }

  componentDidCatch(error:any, info:any){
    console.error(`aborting execution because of error ${error}`) 
  }

  render(){
    if (this.state.error)
      return <p>an error occured {this.state.error}</p>
    return this.props.children
  }

}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
