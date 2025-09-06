import React from 'react';
import { DailyTask, I18nContent, TaskType } from '../types';
import { useModal } from '../contexts/ModalContext';
import { useToast } from '../contexts/ToastContext';
import { Icon } from './Icon';

interface DailyTasksProps {
    tasks: DailyTask[];
    onToggleTask: (taskType: TaskType) => void;
    t: I18nContent;
}

const taskConfig: Record<TaskType, {
    labelKey: keyof I18nContent;
    icon: React.ReactNode;
    isManual: boolean;
}> = {
    meditate: { labelKey: 'taskMeditate', icon: <Icon name="meditate" className="w-6 h-6 text-purple-600"/>, isManual: false },
    seva: { labelKey: 'taskSeva', icon: <Icon name="heart-hand" className="w-6 h-6 text-red-600"/>, isManual: false },
    shloka: { labelKey: 'taskShloka', icon: <Icon name="book-open" className="w-6 h-6 text-blue-600"/>, isManual: true },
    darshan: { labelKey: 'taskDarshan', icon: <Icon name="camera" className="w-6 h-6 text-teal-600"/>, isManual: false },
    chant: { labelKey: 'taskChant', icon: <Icon name="om" className="w-6 h-6 text-orange-600"/>, isManual: false },
};

export const DailyTasks = ({ tasks, onToggleTask, t }: DailyTasksProps) => {
    const { openModal } = useModal();
    const { addToast } = useToast();

    const handleTaskClick = (task: DailyTask) => {
        if (task.isCompleted) return;

        if (task.type === 'meditate') {
            openModal('meditation');
        } else if (task.type === 'chant') {
            addToast("Complete a Japa Mala in the Chanting Zone to finish this task.", 'info');
        } else if (taskConfig[task.type].isManual) {
            onToggleTask(task.type);
        }
    };
    
    return (
        <div className="space-y-3">
            {tasks.map(task => (
                <button 
                    key={task.type}
                    onClick={() => handleTaskClick(task)}
                    disabled={task.isCompleted || !taskConfig[task.type].isManual && task.type !== 'meditate'}
                    className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 text-left ${
                        task.isCompleted
                            ? 'bg-green-100 border-l-4 border-green-500'
                            : 'bg-stone-50 hover:bg-stone-100 border-l-4 border-stone-300'
                    } disabled:cursor-not-allowed`}
                >
                    <div className="flex-shrink-0 mr-3">
                        {task.isCompleted ? <Icon name="check-circle" className="w-7 h-7 text-green-500" /> : <Icon name="circle" className="w-7 h-7 text-stone-400" />}
                    </div>
                    <div className="flex-grow flex items-center gap-3">
                         {taskConfig[task.type].icon}
                         <span className={`font-medium ${task.isCompleted ? 'text-stone-500 line-through' : 'text-stone-800'}`}>
                            {t[taskConfig[task.type].labelKey]}
                        </span>
                    </div>
                </button>
            ))}
        </div>
    );
};