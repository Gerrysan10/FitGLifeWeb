import React, { useState, useEffect, useContext } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { collection, getDocs, orderBy, query, where, Timestamp, limit } from "firebase/firestore";
import { db } from '../firebase';
import { AuthContext } from '../AuthContext';
import imgvacio from '../images/vacio.png';
import '../css/Progress.css';
import { RingLoader } from 'react-spinners';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ProgressBody = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [bodyMeasurements, setBodyMeasurements] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Peso');
  const { user } = useContext(AuthContext);
  const userId = user.id;

  const fetchBodyMeasurements = async () => {
    setIsLoading(true);
    try {
      const q = query(
        collection(db, `users/${userId}/measurements`),
        where("category", "==", selectedCategory),
        orderBy("date", "desc"),
        limit(30)
      );
      const measurementsSnapshot = await getDocs(q);
      const data = measurementsSnapshot.docs.map(doc => {
        const docData = doc.data();
        let date;
        if (docData.date instanceof Timestamp) {
          date = docData.date.toDate();
        } else if (typeof docData.date === 'string') {
          date = new Date(docData.date);
        } else {
          date = new Date();
        }
        return {
          date: date,
          info: docData.info,
          category: docData.category
        };
      });

      setBodyMeasurements(data);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      alert('Ocurrió un error al obtener las medidas');
    }
  };

  useEffect(() => {
    fetchBodyMeasurements();
    setSelectedPoint(null);
  }, [selectedCategory, userId]);

  const formatDate = (date) => {
    if (!(date instanceof Date) || isNaN(date)) {
      return 'Fecha inválida';
    }
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const data = {
    labels: bodyMeasurements.map(measurement => formatDate(measurement.date)).reverse(),
    datasets: [
      {
        label: selectedCategory,
        data: bodyMeasurements.map(measurement => parseFloat(measurement.info)).reverse(),
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
        text: 'Progreso en la medida',
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const measurement = bodyMeasurements[bodyMeasurements.length - 1 - index];
        setSelectedPoint({
          date: formatDate(measurement.date),
          value: measurement.info,
          label: selectedCategory,
        });
      }
    },
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

  return (
    <div className='cont-progress'>

      <div className='selector'>
        <label className='lbl-select' htmlFor="category-select">Seleccione categoría: </label>
        <select
          id="category-select"
          value={selectedCategory}
          onChange={handleCategoryChange}
        >
          <option value="Peso">Peso (kg)</option>
          <option value="Altura">Altura (cm)</option>
          <option value="Pecho">Pecho (cm)</option>
          <option value="Cintura">Cintura (cm)</option>
          <option value="Cadera">Caderas (cm)</option>
          <option value="Muslo">Muslo (cm)</option>
          <option value="Bíceps">Bíceps (cm)</option>
          <option value="Pantorrilla">Pantorrilla (cm)</option>
        </select>
      </div>
      {bodyMeasurements.length > 0 ? (
        <>
          <div className="container">
            <div className="chart">
              <h3>Gráfica</h3>
              <div style={{ height: '400px', marginTop: '20px' }}>
                <Line data={data} options={options} />
              </div>
              {selectedPoint && (
                <div className="cont-selected-point">
                  <div className="selected-point">
                    <h4>Punto seleccionado:</h4>
                    <p>Fecha: {selectedPoint.date}</p>
                    <p>{selectedPoint.label}: {selectedPoint.value} {selectedPoint.label === 'Peso' ? 'kg' : 'cm'}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="table">
              <h3>Historial</h3>
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>{selectedCategory}</th>
                  </tr>
                </thead>
                <tbody>
                  {bodyMeasurements.map((measurement, index) => (
                    <tr key={index}>
                      <td>{formatDate(measurement.date)}</td>
                      <td>{measurement.info} {selectedCategory === 'Peso' ? 'kg' : 'cm'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="empty-container">
          <img className="img-vacio" src={imgvacio} alt="No hay datos" />
          <p className="text-vacio">No hay datos para mostrar</p>
        </div>
      )}
    </div>
  );
};

export default ProgressBody;