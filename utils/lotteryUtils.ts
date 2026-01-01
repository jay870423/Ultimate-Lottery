import { Participant, WinnersMap, RiggedMap, Prize } from '../types';

declare global {
  interface Window {
    confetti: any;
    XLSX: any;
  }
}

export const triggerConfetti = () => {
  if (window.confetti) {
    const duration = 3000;
    const end = Date.now() + duration;

    // A more explosive initial burst
    window.confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff00ff', '#00ffff', '#bd00ff', '#ffffff']
    });

    (function frame() {
      // Launch confetti from the left edge
      window.confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ff00ff', '#00ffff', '#ffffff']
      });
      // Launch confetti from the right edge
      window.confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ff00ff', '#00ffff', '#ffffff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }
};

export const pickWinner = (
  participants: Participant[],
  winners: WinnersMap,
  currentPrizeId: string,
  riggedMatches: RiggedMap
): Participant | null => {
  // 1. Get all winner IDs across all prizes to exclude them
  const allWinnerIds = new Set(Object.values(winners).flat().map(p => p.id));
  
  // 2. Filter eligible candidates
  const candidates = participants.filter(p => !allWinnerIds.has(p.id));

  if (candidates.length === 0) return null;

  // 3. Check for Rigged (Default) Winners for this prize
  const riggedIdsForPrize = riggedMatches[currentPrizeId] || [];
  
  // Find the first rigged ID that hasn't won yet and is in the candidates list
  const nextRiggedId = riggedIdsForPrize.find(id => !allWinnerIds.has(id));
  
  if (nextRiggedId) {
    const riggedWinner = candidates.find(p => p.id === nextRiggedId);
    if (riggedWinner) return riggedWinner;
  }

  // 4. Random pick
  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex];
};

// Excel Parsing Logic
export const parseExcel = async (file: File): Promise<Participant[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!window.XLSX) {
          reject(new Error("XLSX library not loaded"));
          return;
        }
        const workbook = window.XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = window.XLSX.utils.sheet_to_json(worksheet);
        
        // Map fields loosely
        const participants: Participant[] = jsonData.map((row: any, index: number) => ({
          id: row.id || row.ID || row.工号 || `imported-${index}`,
          name: row.name || row.Name || row.姓名 || `User ${index}`,
          department: row.department || row.Department || row.部门 || 'General',
        }));

        resolve(participants);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};

export const exportWinnersToExcel = (winners: WinnersMap, prizes: Prize[]) => {
  if (!window.XLSX) {
    alert("XLSX library not loaded");
    return;
  }

  const exportData: any[] = [];

  // Sort prizes by level/index if possible, or just iterate existing order
  prizes.forEach(prize => {
    const prizeWinners = winners[prize.id] || [];
    prizeWinners.forEach(winner => {
      exportData.push({
        '奖项': prize.name,
        '姓名': winner.name,
        '部门': winner.department || '',
        '工号': winner.id
      });
    });
  });

  if (exportData.length === 0) {
    alert("暂无中奖记录可导出");
    return;
  }

  const worksheet = window.XLSX.utils.json_to_sheet(exportData);
  const workbook = window.XLSX.utils.book_new();
  window.XLSX.utils.book_append_sheet(workbook, worksheet, "Winners");
  window.XLSX.writeFile(workbook, "中奖名单.xlsx");
};