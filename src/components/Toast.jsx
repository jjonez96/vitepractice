import { useEffect } from 'react';

const Toast = ({ message, type = 'error', isVisible, onClose, duration = 2000 }) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose, duration]);

    if (!isVisible) return null;

    const typeStyles = {
        error: 'bg-black border border-red-600 text-red-400',
        success: 'bg-black border border-green-600 text-green-400',
        warning: 'bg-black border border-yellow-600 text-yellow-400'
    };



    return (
        <div className="fixed top-4 left-0 right-0 flex justify-center z-50 animate-slide-in">
            <div className={`${typeStyles[type]} px-4 py-3 rounded-xl shadow-lg max-w-sm backdrop-blur-sm`}>
                <div className="flex items-center">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-white">{message}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="ml-4 text-stone-400 hover:text-white duration-300 font-bold text-lg"
                    >
                        ×
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Toast;
