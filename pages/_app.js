// pages/_app.js
import '../static/global.css'; // CSS global
import '../static/style.css'; // CSS específico

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
