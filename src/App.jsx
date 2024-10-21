import { useState } from 'react'
import './App.css'
import logo from './images/logo.png';
import biceps from './images/biceps.png'
import pierna from './images/cuadricep.png'
import espalda from './images/espalda.png'
import pecho from './images/pecho.png'
import progress from './images/progress.png'
import muscle from './images/grow.png'
import imgapp from './images/app.jpeg'
import gmail from './images/imggmail.png'


function App() {
  const [count, setCount] = useState(0)
  const routines = [
    { image: biceps, name: "Rutina de Bíceps" },
    { image: pierna, name: "Rutina de Piernas" },
    { image: espalda, name: "Rutina de Espalda" },
    { image: pecho, name: "Rutina de Pecho" }
  ]
  
  function handleDownload() {
    window.location.href = 'https://www.dropbox.com/scl/fi/qk9h2n3mmzyfh24abuy0e/fitglife.apk?rlkey=8qrxb76lg5bi975qvr0k5rwfq&st=suvzqlms&dl=1';
  }

  return (
    <div className="fitlife-homepage">
      <div className="container-nav">
        <div className="logo-app">
          <img className='logo-img' src={logo} alt="FitLife Logo" />
        </div>
        <div className='nav-one'>
          <ul>
            <li ><a href='#nosotros'>Nosotros</a></li>
            <li><a href='#descargar'>Descargar</a></li>
            <li><a href='#contacto'>Contacto</a></li>
            <li><a href='login'>Iniciar sesión</a></li>
          </ul>
        </div>
      </div>
      <div className='content-app'>
        <div className="hero" >
          <h1>FitGlife, Tu mejor compañero de entrenamiento</h1>
          <a href='#descargar' ><p>¡Empieza Hoy!</p></a>
        </div>

        <div className="routines">
          <h2 className='title-section'>Nuestras Rutinas</h2>
          <p className='p-section'>Escoge entre nuestra variedad de rutinas según tus objetivos.</p>
          <div className="routine-grid">
            {routines.map((routine, index) => (
              <div key={index} className="routine-item2">
                <img className='image-routine' src={routine.image} alt={`Rutina de ${routine.name}`} />
                <h3 className='nameroutine'>{routine.name}</h3>
              </div>
            ))}
          </div>
        </div>

        <div className="organize">
          <h2 className='title-section'>Organiza tus Rutinas</h2>
          <p className='p-section'>Lleva el control de tus rutinas y ve tus progresos a lo largo del tiempo.</p>
          <div className="organize-grid">
            <div className="organize-item">
              <img className='image-organize' src={progress} alt='Progreso' />
            </div>
            <div className="organize-item">
              <img className='image-organize' src={muscle} alt='Músculo' />
            </div>
          </div>
        </div>

        <div id='descargar' className="app-promo">
          <div className="app-image">
            <img className='img-app' src={imgapp} alt='imagen app' />
          </div>
          <div className="app-info">
            <h2 className='title-section'>Explora Nuestra App</h2>
            <p className='p-section'>Lleva tus rutinas a donde quieras. Descarga nuestra App, entrena y nunca te pierdas de un día de ejercicio.</p>
            <p className="download-cta">¡Descárgala ahora!</p>
            <div className="app-stores">
              <button
                className="store-button"
                onClick={handleDownload}
              >
                Descargar APK
              </button>
            </div>
          </div>
        </div>
        <div id='nosotros' className="nosotros">
          <div className='cont-image-nosotros'>
            <img className='logo-app2' src={logo} />
          </div>
          <div className='cont-nosotros'>
            <h2 className='title-section'>Nosotros</h2>
            <p className='p-section'>
              Somos un equipo apasionado por la salud y la tecnología, comprometidos en ofrecer soluciones que faciliten la mejora del bienestar físico de las personas. Creemos que cada usuario es único y, por eso, nuestra misión es crear herramientas personalizadas que se adapten a sus necesidades y objetivos individuales.
              Con un enfoque en la innovación y el seguimiento detallado, nuestro objetivo es ayudarte a alcanzar tus metas de forma eficiente y accesible.
              ¡Únete a nuestra comunidad y comienza a transformar tu rutina de entrenamiento hoy mismo!
            </p>
          </div>
        </div>
        <div className="container-footer">
          <div className="logo-fitcont">
            <img className='logo-fit' src={logo} alt="FitLife Logo" />
          </div>
          <div className="footer-links">
            <a href="#">Términos y condiciones</a>
            <a href="#">Política de privacidad</a>
          </div>
          <div id='contacto' className="social-icons">
            <span className="icon">
              <a href="mailto:soportefitglife@gmail.com">
                <img className='contacto-img' src={gmail} alt="Gmail Icon" />
                <p>soportefitglife@gmail.com</p>
              </a>
            </span>
          </div>

        </div>
      </div>

    </div>
  )
}

export default App;