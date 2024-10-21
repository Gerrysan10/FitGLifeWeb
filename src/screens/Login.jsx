import '../css/Login.css';
import image from '../images/img.jpg';
import logo from '../images/logo.png';
import gmail from '../images/gmail.png';
import password from '../images/password.png';
import arrow from '../images/flecha.png';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useState, useContext } from 'react';
import ModalLogin from '../components/ModalLogin';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, getDocs, query, where } from "firebase/firestore";
import { AuthContext } from '../AuthContext';

const Login = () => {
    const [showModal, setShowModal] = useState(false);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit } = useForm();
    const navigate = useNavigate();
    const { signIn } = useContext(AuthContext);

    const onSubmit = async (data) => {
        const { email, password } = data;
        
        if (!email || !password) {
            setMessage('Por favor, complete todos los campos.');
            setShowModal(true);
            return;
        }

        setIsLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const q = query(collection(db, 'users'), where('uid', '==', user.uid));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0];
                const userData = userDoc.data();
                const id = userDoc.id;
                const { username, phone, image, role } = userData;

                // Guardar datos del usuario en localStorage
                const userToStore = { id, uid: user.uid, email, username, phone, image, role };
                localStorage.setItem('user', JSON.stringify(userToStore));  // Guarda los datos como string

                if (role === 'user') {
                    signIn(userToStore);
                    navigate('/home');
                } else if (role === 'admin') {
                    signIn(userToStore);
                    navigate('/homeAdmin');
                } else {
                    await signOut(auth);
                    setMessage('No puedes iniciar sesión con esta cuenta.');
                    setShowModal(true);
                }
            } else {
                setMessage('No se encontró información del usuario.');
                setShowModal(true);
            }
        } catch (error) {
            let errorMessage;
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'No existe una cuenta asociada a este correo electrónico.';
                    break;
                case 'auth/invalid-credential':
                    errorMessage = 'Correo electrónico o contraseña incorrecta.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Se han realizado demasiados intentos. Por favor, intenta más tarde.';
                    break;
                default:
                    errorMessage = 'Ocurrió un error al iniciar sesión. Por favor, intenta de nuevo más tarde.';
            }
            setMessage(errorMessage);
            setShowModal(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className='ContRegister'>
                <div className='contentr'>
                    <div>
                        <Link to="/">
                            <img src={arrow} alt="Return" className='return' />
                        </Link>
                    </div>
                    <div className='formulary'>
                        <img src={logo} alt="" className='logor' />
                        <h1 className='titleformulary'>Hola, <br />Inicia sesión ahora</h1>
                        <form onSubmit={handleSubmit(onSubmit)} className="inputs">
                            <div className="input-container">
                                <img src={gmail} alt="" className='logos' />
                                <input type="email" {...register("email", { required: true })} className="input" placeholder="Correo" />
                            </div>
                            <div className="input-container">
                                <img src={password} alt="" className='logos' />
                                <input type="password" {...register("password", { required: true })} className="input" placeholder="Contraseña" />
                            </div>
                            <div className='contentbutton'>
                                <button type="submit" className='button textbutton'>
                                    {isLoading ? 'Cargando...' : <p className='textbutton'>Iniciar sesión</p>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                <div className='image'>
                    <img className='imgregister' src={image} alt="" />
                </div>
            </div>
            <ModalLogin showModal={showModal} setShowModal={setShowModal} message={message} />
        </>
    );
}

export default Login;
