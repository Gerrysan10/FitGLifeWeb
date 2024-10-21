import React, { useState, useEffect, useContext } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { collection, getDocs, orderBy, query, limit, getDoc, doc } from "firebase/firestore";
import { AuthContext } from '../AuthContext';
import { db } from '../firebase';
import { RingLoader } from 'react-spinners';
import '../css/Progress.css';
import imgvacio from '../images/vacio.png';


ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ProgressRoutines = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [exerciseData, setExerciseData] = useState({});
    const [selectedExercise, setSelectedExercise] = useState('');
    const [selectedPoint, setSelectedPoint] = useState(null);
    const [exerciseList, setExerciseList] = useState([]);
    const { user } = useContext(AuthContext);
    const userId = user.id;
    const [searchTerm, setSearchTerm] = useState('');

    const getExerciseName = async (exerciseRef) => {
        try {
            const exerciseDoc = await getDoc(doc(db, exerciseRef.path));
            if (exerciseDoc.exists()) {
                const exerciseData = exerciseDoc.data();
                return exerciseData.name;
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error fetching exercise name:", error);
            return null;
        }
    };

    const fetchTrainingData = async () => {
        setIsLoading(true);
        try {
            const q = query(collection(db, `users/${userId}/training`), orderBy("endTime", "desc"), limit(30));
            const trainingSnapshot = await getDocs(q);
            const data = {};
            const exerciseSet = new Set();

            for (const doc of trainingSnapshot.docs) {
                const training = doc.data();
                if (training.endTime != null) {
                    const date = training.endTime.toDate();

                    for (const exercise of training.exercises) {
                        if (!exercise.series.some(serie => serie.add)) continue;

                        const exerciseName = await getExerciseName(exercise.exercise);
                        if (!exerciseName) continue;

                        exerciseSet.add(exerciseName);
                        if (!data[exerciseName]) {
                            data[exerciseName] = [];
                        }

                        const maxWeight = Math.max(...exercise.series.filter(s => s.add).map(s => s.weight));
                        data[exerciseName].push({
                            date,
                            weight: maxWeight,
                            reps: exercise.reps,
                            series: exercise.series.filter(s => s.add)
                        });
                    }
                }
            }

            setExerciseData(data);
            const sortedExercises = Array.from(exerciseSet).sort();
            setExerciseList(sortedExercises);
            setSelectedExercise(sortedExercises[0] || '');
            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching training data:", error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTrainingData();
    }, []);

    useEffect(() => {
        setSelectedPoint(null);
    }, [selectedExercise]);

    const formatDate = (date) => {
        return date.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
    };

    const handleDataPointClick = (_, elements) => {
        if (elements.length > 0) {
            const index = elements[0].index;
            const measurement = selectedExerciseData[selectedExerciseData.length - 1 - index];
            setSelectedPoint({
                date: measurement.date,
                weight: measurement.weight,
                reps: measurement.reps,
            });
        }
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

    const selectedExerciseData = exerciseData[selectedExercise] || [];
    const data = {
        labels: selectedExerciseData.map(item => formatDate(item.date)).reverse(),
        datasets: [
            {
                label: 'Peso máximo (kg)',
                data: selectedExerciseData.map(item => item.weight).reverse(),
                borderColor: 'rgba(106, 189, 166, 1)',
                backgroundColor: 'rgba(106, 189, 166, 0.2)',
            }
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Progreso de peso en el ejercicio',
            },
        },
        onClick: handleDataPointClick,
    };

    const filteredExerciseList = exerciseList.filter(exercise =>
        exercise.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className='cont-progress'>
            {exerciseList.length > 0 ? (
                <>
                    <div className="selectorE">
                        <label htmlFor="search-input">Filtrar:</label>
                        <input
                            id="search-input"
                            type="text"
                            placeholder="Buscar ejercicios"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="selectorE">
                        <label htmlFor="exercise-select">Seleccione ejercicio:</label>
                        <select
                            id="exercise-select"
                            value={selectedExercise}
                            onChange={(e) => setSelectedExercise(e.target.value)}
                        >
                            {filteredExerciseList.map((exercise, index) => (
                                <option key={index} value={exercise}>{exercise}</option>
                            ))}
                        </select>
                    </div>

                    <h2>{selectedExercise}</h2>
                    <div className="container">
                        <div className="chart">
                            <h3>Gráfica</h3>
                            <Line data={data} options={options} />
                            {selectedPoint && (
                                <div className="cont-selected-point">
                                    <div className="selected-point">
                                        <h4>Punto seleccionado:</h4>
                                        <p>Fecha: {formatDate(selectedPoint.date)}</p>
                                        <p>Peso: {selectedPoint.weight} kg</p>
                                        <p>Repeticiones: {selectedPoint.reps}</p>
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
                                        <th>Peso Máx (kg)</th>
                                        <th>Reps</th>
                                        <th>Series</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedExerciseData.map((item, index) => (
                                        <tr key={index}>
                                            <td>{formatDate(item.date)}</td>
                                            <td>{item.weight}</td>
                                            <td>{item.reps}</td>
                                            <td>{item.series.length}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <div className="empty-container">
                    <img className="img-vacio" src={imgvacio} alt="Sin datos" />
                    <p className="text-vacio">Sin datos de entrenamiento</p>
                </div>
            )}
        </div>
    );

};

export default ProgressRoutines;