import { Link } from 'react-router-dom';
import  { useState } from 'react';
import '../css/HomeAdmin.css';
import logo from '../images/logo.png';
import UsersActives from '../components/usersActive';
import UsersRegister from '../components/UsersRegister';

const HomeAdmin= () =>{
    const [data, setData] = useState([]);
    const [activeCategory, setActiveCategory] = useState('usersRegister');
    
    return(
        <>
      <div className="navigationA">
        <img src={logo} alt="LogoA" className="logo" />
        <div className="nav-linksA">
          <Link className='linkA' to= "">Ejercicios</Link>
          <Link className='linkA' to= "">Rutinas</Link>
          <Link className='linkA' to= "">Administradores</Link>
          <Link className='linkA' to="/">Cerrar sesión</Link>
        </div>
        
      </div>
      <div className="contentA">
        <h1 className='titleA'>Gráficas de la aplicación</h1>
        <div>
          <div className='categoryA'>
            <h2 
              className={`category-titleA ${activeCategory === 'usersRegister' ? 'active' : ''}`} 
              onClick={() => setActiveCategory('usersRegister')}
            >
              Usuarios registrados
            </h2>
            <h2 
              className={`category-titleA ${activeCategory === 'usersActives' ? 'active' : ''}`} 
              onClick={() => setActiveCategory('usersActives')}
            >
              Usuarios por día 
            </h2>
          </div>
          <div>
            {activeCategory === 'usersRegister' ? <UsersRegister /> : <UsersActives />}
          </div>
        </div>
      </div>
    </>
    )
}

export default HomeAdmin;
