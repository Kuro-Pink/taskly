import { useState } from 'react';
import { Link } from 'react-router-dom';

const Dropdown = ({ title, items }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                className="rounded px-4 py-2 text-sm font-medium hover:bg-gray-200"
                onClick={() => setIsOpen(!isOpen)}
            >
                {title} ▾
            </button>

            {isOpen && (
                <div className="absolute left-0 mt-2 w-64 rounded border bg-white shadow-lg">
                    {items.map((item, index) => (
                        <div key={index}>
                            {item.path ? (
                                <Link
                                    to={item.path}
                                    className="flex items-center px-4 py-2 hover:bg-gray-100"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {item.icon && <img src={item.icon} alt="" className="mr-2 h-6 w-6" />}
                                    <span className="text-sm">{item.label}</span>
                                </Link>
                            ) : (
                                <button
                                    className="flex w-full items-center px-4 py-2 text-left hover:bg-gray-100"
                                    onClick={() => {
                                        item.onClick && item.onClick();
                                        setIsOpen(false);
                                    }}
                                >
                                    {item.icon && <img src={item.icon} alt="" className="mr-2 h-6 w-6" />}
                                    <span className="text-sm">{item.label}</span>
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dropdown;
