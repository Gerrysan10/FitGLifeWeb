import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { collection, query, where, orderBy, getDocs, Timestamp } from "firebase/firestore";
import { db } from '../firebase';
import { RingLoader } from 'react-spinners';
import imgvacio from '../images/vacio.png'; // Asegúrate de que la ruta sea correcta

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const UsersRegister = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [weeklyData, setWeeklyData] = useState([]);
  const [hasAnyData, setHasAnyData] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [selectedMonth, selectedYear]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const startOfMonth = new Date(selectedYear, selectedMonth, 1);
      const endOfMonth = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59);

      const q = query(
        collection(db, 'users'),
        where('role', '==', 'user'),
        where('createdAt', '>=', Timestamp.fromDate(startOfMonth)),
        where('createdAt', '<=', Timestamp.fromDate(endOfMonth)),
        orderBy('createdAt', 'desc')
      );

      const usersSnapshot = await getDocs(q);
      const userData = usersSnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      }));
      
      setUsers(userData);
      processWeeklyData(userData);
      
      if (userData.length > 0) {
        setHasAnyData(true);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setIsLoading(false);
    }
  };

  const processWeeklyData = (userData) => {
    const weeklyCount = [0, 0, 0, 0, 0];
    userData.forEach(user => {
      const weekNumber = getWeekNumber(user.createdAt);
      if (weekNumber >= 0 && weekNumber < 5) {
        weeklyCount[weekNumber]++;
      }
    });
    setWeeklyData(weeklyCount);
  };

  const getWeekNumber = (date) => {
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    return Math.floor((date - firstDayOfMonth) / (7 * 24 * 60 * 60 * 1000));
  };

  const data = {
    labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4', 'Semana 5'],
    datasets: [
      {
        label: 'Usuarios Registrados',
        data: weeklyData,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Usuarios Registrados por Semana',
      },
    },
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(parseInt(event.target.value));
  };

  const handleYearChange = (event) => {
    setSelectedYear(parseInt(event.target.value));
  };

  if (isLoading) {
    return (
      <div className="container">
        <div className="spinner-container">
          <RingLoader color={'#123abc'} loading={isLoading} />
          <p>Cargando</p>
        </div>
      </div>
    );
  }

  if (!hasAnyData) {
    return (
      <div className="empty-container">
        <img className="img-vacio" src={imgvacio} alt="No hay datos" />
        <p className="text-vacio">No hay datos para mostrar</p>
      </div>
    );
  }

  return (
    <div className='cont-users-register'>
      <div className='selector'>
        <label className='lbl-select' htmlFor="month-select">Mes: </label>
        <select
          id="month-select"
          value={selectedMonth}
          onChange={handleMonthChange}
        >
          {[...Array(12)].map((_, i) => (
            <option key={i} value={i}>
              {new Date(0, i).toLocaleString('default', { month: 'long' })}
            </option>
          ))}
        </select>
        <label className='lbl-select' htmlFor="year-select">Año: </label>
        <select
          id="year-select"
          value={selectedYear}
          onChange={handleYearChange}
        >
          {[...Array(5)].map((_, i) => {
            const year = new Date().getFullYear() - i;
            return <option key={year} value={year}>{year}</option>;
          })}
        </select>
      </div>

      {users.length > 0 ? (
        <div className="container">
          <div className="chart">
            <h3>Gráfica de Usuarios Registrados</h3>
            <div style={{ height: '400px', marginTop: '20px' }}>
              <Line data={data} options={options} />
            </div>
          </div>
          <div className="table">
            <h3>Usuarios Registrados en {new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
            <table>
              <thead>
                <tr>
                  <th>UID</th>
                  <th>Email</th>
                  <th>Fecha de Registro</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.uid}>
                    <td>{user.uid}</td>
                    <td>{user.email}</td>
                    <td>{formatDate(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="empty-container">
          <img className="img-vacio" src={imgvacio} alt="No hay datos" />
          <p className="text-vacio">No hay datos para mostrar en el mes seleccionado</p>
        </div>
      )}
    </div>
  );
};

export default UsersRegister;