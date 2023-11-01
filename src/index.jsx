import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

const link = document.createElement('link');
link.href = 'https://fonts.googleapis.com/css?family=Open+Sans|Poppins|Roboto';
link.rel = 'stylesheet';
document.head.appendChild(link);

ReactDOM.createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
)