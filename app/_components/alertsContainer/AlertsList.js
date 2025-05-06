"use client";

import React from 'react'
import { useSelector } from 'react-redux';
import Alert from './Alert';
import './alertsContainer.css'

const AlertsList = () => {
    const alerts = useSelector((state) => state.Alerts.alerts);


    return (
        <>
            {alerts.map((alert) => (
                <Alert key={alert.id}
                    id={alert.id}
                    type={alert.type}
                    duration={alert.duration}
                    title={alert.title}
                    message={alert.message}
                />
            ))}
        </>
    );
};

export default AlertsList;


