import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Plus, Calendar as CalendarIcon, Clock } from 'lucide-react';
import CreateSessionModal from '../components/CreateSessionModal';
import { format } from 'date-fns';

export default function StudyPlans() {
    const [events, setEvents] = useState([
        { id: '1', title: 'Calculus Exam', start: new Date().toISOString().split('T')[0] + 'T09:00:00', end: new Date().toISOString().split('T')[0] + 'T12:00:00', color: '#ef4444' },
        { id: '2', title: 'History Essay Draft', start: new Date(Date.now() + 86400000).toISOString().split('T')[0] + 'T14:00:00', end: new Date(Date.now() + 86400000).toISOString().split('T')[0] + 'T16:00:00', color: '#3b82f6' },
    ]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const handleDateClick = (arg) => {
        setSelectedDate(new Date(arg.date));
        setIsModalOpen(true);
    };

    const handleAddSession = (session) => {
        // Calculate end time
        const start = new Date(session.date);
        const end = new Date(start.getTime() + session.duration * 60000);

        setEvents([...events, {
            id: Date.now().toString(),
            title: session.title,
            start: start.toISOString(),
            end: end.toISOString(),
            color: session.color
        }]);
    };

    return (
        <div className="h-full p-6 flex flex-col md:flex-row gap-6 overflow-hidden">
            {/* Main Calendar Area */}
            <div className="flex-1 flex flex-col h-full min-h-0">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-1">Study Plan</h1>
                        <p className="text-slate-500">Organize your academic life.</p>
                    </div>
                    <button
                        onClick={() => { setSelectedDate(new Date()); setIsModalOpen(true); }}
                        className="flex items-center gap-2 btn-orange px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-orange-500/25 transition-all"
                    >
                        <Plus size={20} /> Schedule Session
                    </button>
                </div>

                <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm overflow-hidden relative">
                    <style>{`
                 .fc { --fc-border-color: #e2e8f0; --fc-page-bg-color: transparent; }
                 .fc-theme-standard td, .fc-theme-standard th { border: 1px solid var(--fc-border-color); }
                 .fc-col-header-cell-cushion { color: #64748b; font-weight: 600; padding: 12px 0; }
                 .fc-daygrid-day-number { color: #334155; font-weight: 500; }
                 .fc-timegrid-slot-label-cushion { color: #64748b; font-size: 0.75rem; }
                 .fc-button { background: white !important; border: 1px solid #e2e8f0 !important; border-radius: 0.75rem !important; color: #64748b !important; text-transform: capitalize; font-weight: 600; padding: 0.5rem 1rem !important; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
                 .fc-button-active { background: #f97316 !important; border-color: #f97316 !important; color: white !important; }
                 .fc-button:hover { background: #f8fafc !important; }
                 .fc-toolbar-title { font-size: 1.5rem !important; font-weight: 700; color: #1e293b; }
                 .fc-event { border-radius: 6px; padding: 2px 4px; border: none; font-size: 0.85rem; font-weight: 500; box-shadow: 0 1px 2px 0 rgba(0,0,0,0.1); }
               `}</style>
                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="timeGridWeek"
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,timeGridWeek'
                        }}
                        events={events}
                        dateClick={handleDateClick}
                        height="100%"
                    />
                </div>
            </div>

            {/* Side Timeline (Upcoming) */}
            <div className="w-full md:w-80 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <CalendarIcon size={20} className="text-orange-500" /> Upcoming
                </h3>

                <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1">
                    {events
                        .sort((a, b) => new Date(a.start) - new Date(b.start))
                        .filter(e => new Date(e.start) >= new Date().setHours(0, 0, 0, 0))
                        .map(event => (
                            <div key={event.id} className="bg-slate-50 rounded-xl p-4 border-l-4 border-transparent hover:bg-white hover:shadow-md transition-all border border-slate-100" style={{ borderLeftColor: event.color }}>
                                <div className="font-semibold text-slate-800 mb-1">{event.title}</div>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <CalendarIcon size={14} />
                                    <span>{format(new Date(event.start), 'MMM d, yyyy')}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                    <Clock size={14} />
                                    <span>{format(new Date(event.start), 'h:mm a')} - {format(new Date(event.end), 'h:mm a')}</span>
                                </div>
                            </div>
                        ))}

                    {events.length === 0 && (
                        <div className="text-center text-slate-500 py-10">
                            <Clock size={40} className="mx-auto mb-2 opacity-50" />
                            <p>No upcoming sessions.</p>
                        </div>
                    )}
                </div>
            </div>

            <CreateSessionModal
                isOpen={isModalOpen}
                closeModal={() => setIsModalOpen(false)}
                onSave={handleAddSession}
                initialDate={selectedDate}
            />
        </div>
    );
}
