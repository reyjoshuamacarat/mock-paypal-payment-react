import PayPalPaymentPage from './pages/PaypalPaymentPage'

function App() {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center">
        <PayPalPaymentPage />
      </main>
      <footer className="bg-white border-t border-gray-200 py-4 px-6 text-center">
        <p className="text-gray-600 text-sm">
          Made with ❤️ by <span className="font-semibold text-gray-800">Rey Joshua Macarat</span>
        </p>
      </footer>
    </div>
  )
}

export default App
