import {useNavigate} from 'react-router-dom';
import  { useState, useContext } from 'react';
import '../css/HomeUser.css';
import logo from '../images/logo.png';
import ProgressBody from '../components/ProgressBody';
import ProgressRoutines from '../components/ProgressRoutines';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { AuthContext } from '../AuthContext'; 

const HomeUser = () => {
  const { signOutC } = useContext(AuthContext);
  const [activeCategory, setActiveCategory] = useState('Entrenamiento');
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);  
      signOutC();  
      localStorage.removeItem('user');         
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <>
      <div className="navigation">
        <img src={logo} alt="Logo" className="logo" />
        <p className='link' onClick={handleSignOut} >Cerrar sesión</p>
      </div>
      <div className="content">
        <h1 className='title'>Progreso</h1>
        <div>
          <div className='category'>
            <h2 
              className={`category-title ${activeCategory === 'Entrenamiento' ? 'active' : ''}`} 
              onClick={() => setActiveCategory('Entrenamiento')}
            >
              Entrenamiento
            </h2>
            <h2 
              className={`category-title ${activeCategory === 'Cuerpo' ? 'active' : ''}`} 
              onClick={() => setActiveCategory('Cuerpo')}
            >
              Cuerpo
            </h2>
          </div>
          <div>
            {activeCategory === 'Entrenamiento' ? <ProgressRoutines /> : <ProgressBody />}
          </div>
        </div>
      </div>
    </>
  );
  
}

export default HomeUser;
