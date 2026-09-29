import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import store from '~/store'
import ThemeModeProvider from '~/styles/ThemeModeProvider'
import GlobalStyles from '~/styles/GlobalStyles'
import App from '~/App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeModeProvider>
        <GlobalStyles />
        <App />
      </ThemeModeProvider>
    </Provider>
  </StrictMode>,
)
