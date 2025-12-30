import React, { useState, useRef } from 'react';
import { Participant, Prize, RiggedMap, WinnersMap } from '../types';
import { parseExcel, exportWinnersToExcel } from '../utils/lotteryUtils';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
  setParticipants: (p: Participant[]) => void;
  prizes: Prize[];
  setPrizes: (p: Prize[]) => void;
  riggedMatches: RiggedMap;
  setRiggedMatches: (r: RiggedMap) => void;
  winners: WinnersMap;
  resetWinners: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen, onClose, participants, setParticipants, prizes, setPrizes, riggedMatches, setRiggedMatches, winners, resetWinners
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'prizes' | 'rigging'>('users');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const newParticipants = await parseExcel(e.target.files[0]);
        setParticipants(newParticipants);
        alert(`Successfully imported ${newParticipants.length} participants!`);
      } catch (error) {
        alert('Failed to parse Excel file. Ensure columns are: Name, Department, ID');
        console.error(error);
      }
    }
  };

  const updatePrize = (index: number, field: keyof Prize, value: any) => {
    const newPrizes = [...prizes];
    newPrizes[index] = { ...newPrizes[index], [field]: value };
    setPrizes(newPrizes);
  };

  const addPrize = () => {
    setPrizes([...prizes, { id: Date.now().toString(), name: 'New Prize', count: 1, level: prizes.length + 1, image: '🎁' }]);
  };

  const removePrize = (index: number) => {
    const newPrizes = prizes.filter((_, i) => i !== index);
    setPrizes(newPrizes);
  };

  // Rigging Logic
  const handleRiggingChange = (prizeId: string, userId: string, isAdding: boolean) => {
    const currentList = riggedMatches[prizeId] || [];
    let newList;
    if (isAdding) {
      if (!currentList.includes(userId)) newList = [...currentList, userId];
      else newList = currentList;
    } else {
      newList = currentList.filter(id => id !== userId);
    }
    setRiggedMatches({ ...riggedMatches, [prizeId]: newList });
  };

  const handleExportWinners = () => {
    exportWinnersToExcel(winners, prizes);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm md:p-4">
      <div className="bg-slate-900 border border-slate-700 w-full md:max-w-4xl h-full md:h-[80vh] md:rounded-2xl rounded-none flex flex-col shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-slate-700 flex justify-between items-center bg-slate-950">
          <h2 className="text-xl md:text-2xl font-display text-neon-blue">后台管理 (Admin)</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white hover:bg-white/10 p-2 rounded-full transition">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 18 18"/></svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700 bg-slate-900 overflow-x-auto">
          {(['users', 'prizes', 'rigging'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 md:py-4 px-4 text-xs md:text-sm font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
                activeTab === tab 
                  ? 'bg-slate-800 text-neon-pink border-b-2 border-neon-pink' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab === 'users' ? '人员名单' : tab === 'prizes' ? '奖项配置' : '内定配置'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 md:p-6 bg-slate-900">
          
          {/* USERS TAB */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 border border-dashed border-slate-600 rounded-lg bg-slate-800/50">
                 <input 
                    type="file" 
                    accept=".xlsx, .xls, .csv" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload}
                    className="hidden" 
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full md:w-auto px-6 py-3 bg-neon-blue text-slate-900 font-bold rounded hover:bg-white transition flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                    导入 Excel
                  </button>
                  <div className="text-slate-400 text-sm">
                    当前人数: <span className="text-white font-bold">{participants.length}</span>
                    <p className="text-xs opacity-50 mt-1">支持列名: 姓名, 部门, 工号 (Name, Department, ID)</p>
                  </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {participants.slice(0, 50).map(p => (
                  <div key={p.id} className="p-3 bg-slate-800 rounded border border-slate-700 flex justify-between items-center">
                    <span className="font-bold truncate max-w-[150px]">{p.name}</span>
                    <span className="text-xs px-2 py-1 bg-slate-700 rounded text-slate-300 truncate max-w-[100px]">{p.department}</span>
                  </div>
                ))}
                {participants.length > 50 && (
                  <div className="flex items-center justify-center text-slate-500 italic">
                    ... 和其他 {participants.length - 50} 人
                  </div>
                )}
              </div>
              
              <div className="pt-8 border-t border-slate-700 flex flex-wrap gap-4 items-center justify-between">
                 <button 
                    onClick={handleExportWinners} 
                    className="flex items-center gap-2 px-4 py-2 bg-green-600/20 text-green-400 border border-green-600/50 rounded hover:bg-green-600 hover:text-white transition"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                    导出中奖名单
                 </button>

                 <button onClick={resetWinners} className="text-red-500 underline text-sm hover:text-red-400">重置所有中奖记录</button>
              </div>
            </div>
          )}

          {/* PRIZES TAB */}
          {activeTab === 'prizes' && (
            <div className="space-y-4">
              {prizes.map((prize, idx) => (
                <div key={prize.id} className="flex flex-col md:flex-row gap-4 p-4 bg-slate-800 rounded-lg border border-slate-700 items-start md:items-center">
                  <div className="text-2xl w-12 text-center">{prize.image}</div>
                  <div className="flex-1 space-y-2 w-full">
                     <input 
                      value={prize.name} 
                      onChange={(e) => updatePrize(idx, 'name', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white focus:border-neon-pink outline-none"
                      placeholder="奖项名称"
                     />
                     <div className="flex gap-2">
                        <label className="flex items-center gap-2 text-sm text-slate-400 bg-slate-900 px-2 rounded">
                          数量:
                          <input 
                            type="number" 
                            value={prize.count} 
                            onChange={(e) => updatePrize(idx, 'count', parseInt(e.target.value))}
                            className="bg-transparent w-16 text-white font-mono outline-none"
                          />
                        </label>
                        <label className="flex items-center gap-2 text-sm text-slate-400 bg-slate-900 px-2 rounded">
                          Icon:
                          <input 
                            value={prize.image || ''} 
                            onChange={(e) => updatePrize(idx, 'image', e.target.value)}
                            className="bg-transparent w-10 text-white text-center outline-none"
                            placeholder="🎁"
                          />
                        </label>
                     </div>
                  </div>
                  <button onClick={() => removePrize(idx)} className="text-red-500 p-2 hover:bg-white/5 rounded self-end md:self-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                </div>
              ))}
              <button onClick={addPrize} className="w-full py-4 border-2 border-dashed border-slate-600 text-slate-400 hover:text-white hover:border-white rounded-lg transition">
                + 添加奖项
              </button>
            </div>
          )}

          {/* RIGGING TAB */}
          {activeTab === 'rigging' && (
            <div className="space-y-6">
              <div className="bg-yellow-900/20 border border-yellow-700/50 p-4 rounded text-yellow-500 text-sm">
                ⚠️ 警告: "内定配置" (Default Winners) 允许你指定某人必定获得某个奖项。系统会在抽该奖项时优先选择列表中的人。
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {prizes.map(prize => (
                   <div key={prize.id} className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                      <h3 className="font-bold text-lg text-neon-blue mb-3">{prize.name}</h3>
                      <div className="mb-3">
                         <h4 className="text-xs uppercase text-slate-500 font-bold mb-2">已内定人员:</h4>
                         <div className="flex flex-wrap gap-2">
                           {(riggedMatches[prize.id] || []).map(rId => {
                             const user = participants.find(p => p.id === rId);
                             return user ? (
                               <span key={rId} className="flex items-center gap-2 bg-purple-900/50 text-purple-200 px-2 py-1 rounded border border-purple-500/30 text-xs md:text-sm">
                                 {user.name} 
                                 <button onClick={() => handleRiggingChange(prize.id, user.id, false)} className="hover:text-white">&times;</button>
                               </span>
                             ) : null;
                           })}
                           {(!riggedMatches[prize.id] || riggedMatches[prize.id].length === 0) && (
                             <span className="text-slate-500 text-sm italic">无</span>
                           )}
                         </div>
                      </div>
                      
                      <div className="relative">
                        <select 
                          className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white appearance-none"
                          onChange={(e) => {
                             if (e.target.value) {
                               handleRiggingChange(prize.id, e.target.value, true);
                               e.target.value = ''; // Reset
                             }
                          }}
                        >
                          <option value="">+ 选择人员添加到内定列表</option>
                          {participants.map(p => (
                            <option key={p.id} value={p.id}>{p.name} - {p.department}</option>
                          ))}
                        </select>
                      </div>
                   </div>
                 ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
