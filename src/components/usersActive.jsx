import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db } from '../firebase';
import { RingLoader } from 'react-spinners';
import imgvacio from '../images/vacio.png';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const UsersActives = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedWeek, setSelectedWeek] = useState(0);
    const [weeklyData, setWeeklyData] = useState([]);
    const [monthlyStats, setMonthlyStats] = useState({ noTraining: 0, oneTraining: 0, twoOrMore: 0 });
    const [hasAnyData, setHasAnyData] = useState(false);

    useEffect(() => {
        fetchUserActivityData();
    }, [selectedMonth, selectedYear]);

    useEffect(() => {
        // Set the selected week to the current week when the component mounts
        const today = new Date();
        if (today.getMonth() === selectedMonth && today.getFullYear() === selectedYear) {
            const currentWeek = getWeekNumber(today, new Date(selectedYear, selectedMonth, 1));
            setSelectedWeek(currentWeek);
        } else {
            setSelectedWeek(0);
        }
    }, [selectedMonth, selectedYear]);

    const fetchUserActivityData = async () => {
        setIsLoading(true);
        try {
            const startOfMonth = new Date(Date.UTC(selectedYear, selectedMonth, 1));
            const endOfMonth = new Date(Date.UTC(selectedYear, selectedMonth + 1, 0, 23, 59, 59));

            const usersQuery = query(collection(db, 'users'), where('role', '==', 'user'));
            const usersSnapshot = await getDocs(usersQuery);

            const userActivityPromises = usersSnapshot.docs.map(async (userDoc) => {
                const trainingQuery = query(
                    collection(db, `users/${userDoc.id}/training`),
                    where('startTime', '>=', Timestamp.fromMillis(startOfMonth.getTime())),
                    where('startTime', '<=', Timestamp.fromMillis(endOfMonth.getTime()))
                );
                const trainingSnapshot = await getDocs(trainingQuery);
                return {
                    userId: userDoc.id,
                    trainings: trainingSnapshot.docs.map(doc => ({
                        ...doc.data(),
                        startTime: doc.data().startTime.toDate()
                    }))
                };
            });

            const userActivityData = await Promise.all(userActivityPromises);
            processWeeklyData(userActivityData, startOfMonth);
            calculateMonthlyStats(userActivityData);

            setHasAnyData(userActivityData.some(user => user.trainings.length > 0));
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching user activity data:', error);
            setIsLoading(false);
        }
    };

    const processWeeklyData = (userActivityData, startOfMonth) => {
        const weeklyStats = Array(5).fill().map(() => ({ noTraining: 0, oneTraining: 0, twoOrMore: 0 }));
        const totalUsers = userActivityData.length;

        userActivityData.forEach(user => {
            const userWeeklyTrainings = Array(5).fill(0);

            user.trainings.forEach(training => {
                const weekNumber = getWeekNumber(training.startTime, startOfMonth);
                if (weekNumber >= 0 && weekNumber < 5) {
                    userWeeklyTrainings[weekNumber]++;
                }
            });

            userWeeklyTrainings.forEach((trainingsCount, weekIndex) => {
                if (trainingsCount >= 2) {
                    weeklyStats[weekIndex].twoOrMore++;
                } else if (trainingsCount === 1) {
                    weeklyStats[weekIndex].oneTraining++;
                } else {
                    weeklyStats[weekIndex].noTraining++;
                }
            });
        });

        setWeeklyData(weeklyStats);
    };

    const calculateMonthlyStats = (userActivityData) => {
        const stats = { noTraining: 0, oneTraining: 0, twoOrMore: 0 };

        userActivityData.forEach(user => {
            const totalTrainings = user.trainings.length;
            if (totalTrainings >= 2) stats.twoOrMore++;
            else if (totalTrainings === 1) stats.oneTraining++;
            else stats.noTraining++;
        });

        setMonthlyStats(stats);
    };

    const getWeekNumber = (date, startOfMonth) => {
        const diff = date.getTime() - startOfMonth.getTime();
        return Math.floor(diff / (7 * 24 * 60 * 60 * 1000));
    };

    const data = {
        labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4', 'Semana 5'],
        datasets: [
            {
                label: 'Sin entrenamientos',
                data: weeklyData.map(week => week.noTraining),
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
            {
                label: '1 entrenamiento',
                data: weeklyData.map(week => week.oneTraining),
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
            },
            {
                label: '2 o más entrenamientos',
                data: weeklyData.map(week => week.twoOrMore),
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                stacked: true,
            },
            y: {
                stacked: true,
            },
        },
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Actividad de Usuarios por Semana',
            },
        },
    };

    const handleMonthChange = (event) => {
        setSelectedMonth(parseInt(event.target.value));
    };

    const handleYearChange = (event) => {
        setSelectedYear(parseInt(event.target.value));
    };

    const handleWeekChange = (event) => {
        setSelectedWeek(parseInt(event.target.value));
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
                <p className="text-vacio">No hay datos de actividad para mostrar</p>
            </div>
        );
    }

    return (
        <div className='cont-users-actives'>
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

            <div className="container">
                <div className="chart">
                    <h3>Actividad de Usuarios en {new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                    <div style={{ height: '400px', marginTop: '20px' }}>
                        <Bar data={data} options={options} />
                    </div>
                </div>
                <div className="table">
                    <h3>Resumen de Actividad Semanal</h3>
                    <div className='selector'>
                        <label className='lbl-select' htmlFor="week-select">Semana: </label>
                        <select
                            id="week-select"
                            value={selectedWeek}
                            onChange={handleWeekChange}
                        >
                            {weeklyData.map((_, index) => (
                                <option key={index} value={index}>Semana {index + 1}</option>
                            ))}
                        </select>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Categoría</th>
                                <th>Cantidad de Usuarios</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Sin entrenamientos</td>
                                <td>{weeklyData[selectedWeek]?.noTraining || 0}</td>
                            </tr>
                            <tr>
                                <td>1 entrenamiento</td>
                                <td>{weeklyData[selectedWeek]?.oneTraining || 0}</td>
                            </tr>
                            <tr>
                                <td>2 o más entrenamientos</td>
                                <td>{weeklyData[selectedWeek]?.twoOrMore || 0}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UsersActives;