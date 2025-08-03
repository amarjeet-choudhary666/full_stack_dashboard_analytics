import { ThemeProvider } from "../src/components/theme-provider"
import { ReactQueryProvider } from "../src/components/providers/react-query-provider"
import Dashboard from "../src/components/dashboard/dashboard"
import './App.css'

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="admybrand-theme">
      <ReactQueryProvider>
        <Dashboard />
      </ReactQueryProvider>
    </ThemeProvider>
  )
}

export default App
