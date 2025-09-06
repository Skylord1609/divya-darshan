
import React, { useState } from 'react';
import { FamilyMember, I18nContent } from '../types';
import { Icon } from './Icon';
import { useToast } from '../contexts/ToastContext';

interface AddFamilyMembersProps {
    members: FamilyMember[];
    setMembers: (members: FamilyMember[]) => void;
    t: I18nContent;
    maxMembers: number;
}

export const AddFamilyMembers = ({ members, setMembers, t, maxMembers }: AddFamilyMembersProps) => {
    const [name, setName] = useState('');
    const [idProof, setIdProof] = useState('');
    const { addToast } = useToast();

    const handleAddMember = (e: React.FormEvent) => {
        e.preventDefault();
        if (members.length >= maxMembers) {
            addToast(`You can add a maximum of ${maxMembers} members.`, 'info');
            return;
        }
        if (name.trim() && idProof.trim()) {
            setMembers([...members, { id: Date.now(), name: name.trim(), idProof: idProof.trim() }]);
            setName('');
            setIdProof('');
        }
    };
    
    const handleRemoveMember = (id: number) => {
        setMembers(members.filter(member => member.id !== id));
    };
    
    const handleScanId = () => {
        addToast("Opening camera to scan ID... (Simulation)", 'info');
        // Simulate OCR by filling fields after a short delay
        setTimeout(() => {
            setName('Dev D. Vottee');
            setIdProof('Aadhaar: 1234 5678 9012');
        }, 1500);
    };

    return (
        <div>
            <h4 className="text-lg font-bold text-orange-800 mb-2">Add Family / Group Members</h4>
            
            {members.length > 0 && (
                <div className="space-y-2 mb-4 max-h-40 overflow-y-auto pr-2">
                    {members.map(member => (
                        <div key={member.id} className="bg-white/70 p-2 rounded-lg flex items-center justify-between">
                            <div>
                                <p className="font-semibold text-stone-800">{member.name}</p>
                                <p className="text-xs text-stone-500">{member.idProof}</p>
                            </div>
                            <button onClick={() => handleRemoveMember(member.id)} className="p-1 text-red-500 hover:text-red-700">
                                <Icon name="trash" className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
            
            {members.length < maxMembers && (
                <form onSubmit={handleAddMember} className="p-3 bg-white/50 rounded-lg border-2 border-dashed border-orange-300 space-y-3">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Full Name"
                        className="w-full p-2 rounded-md border border-orange-300"
                        required
                    />
                    <input
                        type="text"
                        value={idProof}
                        onChange={(e) => setIdProof(e.target.value)}
                        placeholder="ID Proof (e.g., Aadhaar, PAN)"
                        className="w-full p-2 rounded-md border border-orange-300"
                        required
                    />
                    <div className="flex items-center gap-2">
                        <button type="submit" className="flex-grow bg-primary text-white font-bold py-2 px-4 rounded-full text-sm hover:bg-secondary transition-colors">
                            Add Member
                        </button>
                        <button type="button" onClick={handleScanId} className="p-2 bg-stone-200 text-stone-700 rounded-full hover:bg-stone-300" title="Scan ID Card (Simulation)">
                            <Icon name="camera" className="w-5 h-5" />
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};
