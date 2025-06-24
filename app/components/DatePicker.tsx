'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import Input from './Input';

export function DatePicker({
    date,
    setDate,
    className,
    ...props
}: {
    date: Date | undefined;
    setDate: (date: Date | undefined) => void;
    className?: string;
}) {
    const [showPicker, setShowPicker] = React.useState(false);
    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setShowPicker(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [ref]);

    return (
        <div className="relative" ref={ref}>
            <Input
                type="text"
                placeholder="YYYY-MM-DD"
                value={date ? format(date, 'yyyy-MM-dd') : ''}
                readOnly
                onClick={() => setShowPicker(!showPicker)}
                className={className}
                {...props}
            />
            {showPicker && (
                <div className="absolute z-10 top-full mt-2 bg-white border border-gray-300 rounded-xl shadow-lg p-4">
                    <DayPicker
                        captionLayout="dropdown"
                        fromYear={new Date().getFullYear() - 100}
                        toYear={new Date().getFullYear()}
                        mode="single"
                        selected={date}
                        onSelect={(selectedDate) => {
                            setDate(selectedDate);
                            setShowPicker(false);
                        }}
                        initialFocus
                    />
                </div>
            )}
        </div>
    );
} 