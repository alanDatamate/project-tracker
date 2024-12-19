import React from 'react';
import { FaChevronLeft, FaChevronRight, FaCalendarDay } from 'react-icons/fa';
import moment from 'moment';

const CustomToolbar = ({ date, onNavigate }) => {
    const handleBack = () => {
        onNavigate('PREV');
    };
    const handleNext = () => {
        onNavigate('NEXT');
    };
    const handleToday = () => {
        onNavigate('TODAY');
    };
    return (
        <div className="flex justify-between items-center p-2 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-md">
            <button
                onClick={handleBack}
                className="flex items-center bg-white text-blue-600 rounded-full px-3 py-2 shadow-md hover:bg-blue-100 transition-all duration-300"
            >
                <FaChevronLeft className="mr-2" />
            </button>
            <span className="text-xl font-bold tracking-wide">
                {moment(date).format('MMMM YYYY')}
            </span>
            <div className="flex items-center space-x-4">
                <button
                    onClick={handleToday}
                    className="flex items-center text-sm  bg-white text-blue-600 rounded-lg px-2 py-1 shadow-md hover:bg-blue-100 transition-all duration-300"
                >
                    <FaCalendarDay className="mr-2" />
                    Today
                </button>
                <button
                    onClick={handleNext}
                    className="flex items-center bg-white text-blue-600 rounded-full px-3 py-2 shadow-md hover:bg-blue-100 transition-all duration-300"
                >
                    <FaChevronRight className="ml-2" />
                </button>
            </div>
        </div>
    );
};

export default CustomToolbar;
