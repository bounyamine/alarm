import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import alarmSoundFile from './alarm.mp3'; // Assurez-vous que l'audio est dans le bon chemin

const AlarmApp = () => {
  const [currentTime, setCurrentTime] = useState('00:00:00');
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [alarms, setAlarms] = useState([]);
  const alarmSound = useRef(new Audio(alarmSoundFile));

  useEffect(() => {
    const interval = setInterval(() => {
      const date = new Date();
      const timeString = date.toLocaleTimeString('en-US', { hour12: false });
      setCurrentTime(timeString);
      checkAlarms(timeString);
    }, 1000);

    return () => clearInterval(interval);
  }, [alarms]);

  const appendZero = (value) => (value < 10 ? '0' + value : value);

  const checkAlarms = (currentTime) => {
    alarms.forEach((alarm) => {
      if (alarm.isActive && alarm.time === currentTime.slice(0, 5)) {
        alarmSound.current.play();
      }
    });
  };

  const handleAddAlarm = () => {
    const newHour = parseInt(hour) || 0;
    const newMinute = parseInt(minute) || 0;

    if (newHour < 0 || newHour > 23 || newMinute < 0 || newMinute > 59) {
      alert('Invalid hour or minute. Please enter values within the valid range!');
      return;
    }

    const newAlarm = {
      id: `${newHour}_${newMinute}_${Date.now()}`,
      time: `${appendZero(newHour)}:${appendZero(newMinute)}`,
      isActive: false
    };

    if (!alarms.some((alarm) => alarm.time === newAlarm.time)) {
      setAlarms([...alarms, newAlarm]);
    }

    setHour('');
    setMinute('');
  };

  const handleClearAlarms = () => {
    setAlarms([]);
    alarmSound.current.pause();
  };

  const toggleAlarm = (id) => {
    setAlarms(
      alarms.map((alarm) =>
        alarm.id === id ? { ...alarm, isActive: !alarm.isActive } : alarm
      )
    );
  };

  const deleteAlarm = (id) => {
    setAlarms(alarms.filter((alarm) => alarm.id !== id));
  };

  return (
    <div className="wrapper">
      <div className="current-time">{currentTime}</div>
      <div className="container">
        <div className="inputs">
          <input
            type="number"
            placeholder="00"
            min="0"
            max="23"
            value={hour}
            onChange={(e) => setHour(e.target.value)}
          />
          <input
            type="number"
            placeholder="00"
            min="0"
            max="59"
            value={minute}
            onChange={(e) => setMinute(e.target.value)}
          />
        </div>
        <div className="buttons">
          <button onClick={handleAddAlarm}>Add Alarm</button>
          <button onClick={handleClearAlarms} className="clear">Clear All</button>
        </div>
        <div className="alarms-list">
          {alarms.map((alarm) => (
            <div key={alarm.id} className="alarm">
              <span>{alarm.time}</span>
              <input
                type="checkbox"
                checked={alarm.isActive}
                onChange={() => toggleAlarm(alarm.id)}
              />
              <button onClick={() => deleteAlarm(alarm.id)}>
                <i className="fa-solid fa-trash-can"></i>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AlarmApp;
