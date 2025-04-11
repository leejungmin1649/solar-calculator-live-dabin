
import { useState } from 'react';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

export default function Home() {
  const [capacity, setCapacity] = useState(760);
  const [irradiance, setIrradiance] = useState(1200);
  const [smp, setSmp] = useState(110);
  const [rec, setRec] = useState(100);
  const [recWeight, setRecWeight] = useState(0.9);
  const [opex, setOpex] = useState(15000000);
  const [capex, setCapex] = useState(130000000);

  const generation = capacity * irradiance;
  const smpRevenue = generation * smp;
  const recRevenue = generation * rec * recWeight;
  const totalRevenue = smpRevenue + recRevenue;
  const netProfit = totalRevenue - opex;
  const payback = parseFloat((capex / netProfit).toFixed(1));

  const exportPDF = () => {
    const doc = new jsPDF();
    const logo = new Image();
    logo.src = '/logo.png';
    logo.onload = () => {
      doc.addImage(logo, 'PNG', 140, 10, 50, 20);
      doc.setFontSize(14);
      doc.text('태양광 수익성 분석 결과', 20, 20);
      doc.setFontSize(10);
      doc.text(`설치용량: ${capacity} kW`, 20, 40);
      doc.text(`일사량: ${irradiance} kWh/kW/년`, 20, 47);
      doc.text(`발전량: ${generation.toLocaleString()} kWh`, 20, 54);
      doc.text(`SMP 수익: ${smpRevenue.toLocaleString()} 원`, 20, 61);
      doc.text(`REC 수익: ${recRevenue.toLocaleString()} 원`, 20, 68);
      doc.text(`총 수익: ${totalRevenue.toLocaleString()} 원`, 20, 75);
      doc.text(`운영비: ${opex.toLocaleString()} 원`, 20, 82);
      doc.text(`순수익: ${netProfit.toLocaleString()} 원`, 20, 89);
      doc.text(`총 사업비: ${capex.toLocaleString()} 원`, 20, 96);
      doc.text(`회수기간: ${payback} 년`, 20, 103);
      doc.save('solar_profit_report.pdf');
    };
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet([
      {
        설치용량: capacity,
        일사량: irradiance,
        발전량: generation,
        SMP수익: smpRevenue,
        REC수익: recRevenue,
        총수익: totalRevenue,
        운영비: opex,
        순수익: netProfit,
        총사업비: capex,
        회수기간: payback
      }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '수익성분석');
    XLSX.writeFile(wb, 'solar_profit_summary.xlsx');
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4 text-sm">
      <img src="/logo.png" alt="logo" className="w-32 mb-4" />
      <h1 className="text-xl font-bold">태양광 수익성 계산기</h1>
      <div className="grid grid-cols-2 gap-4">
        <label>설치용량 (kW)<input type="number" value={capacity} onChange={(e) => setCapacity(+e.target.value)} className="input" /></label>
        <label>일사량 (kWh/kW/년)<input type="number" value={irradiance} onChange={(e) => setIrradiance(+e.target.value)} className="input" /></label>
        <label>SMP 단가<input type="number" value={smp} onChange={(e) => setSmp(+e.target.value)} className="input" /></label>
        <label>REC 단가<input type="number" value={rec} onChange={(e) => setRec(+e.target.value)} className="input" /></label>
        <label>REC 가중치<input type="number" value={recWeight} onChange={(e) => setRecWeight(+e.target.value)} className="input" /></label>
        <label>운영비<input type="number" value={opex} onChange={(e) => setOpex(+e.target.value)} className="input" /></label>
        <label>총 투자비<input type="number" value={capex} onChange={(e) => setCapex(+e.target.value)} className="input" /></label>
      </div>
      <div className="bg-gray-100 p-4 rounded">
        <p>발전량: <strong>{generation.toLocaleString()}</strong> kWh</p>
        <p>SMP 수익: <strong>{smpRevenue.toLocaleString()}</strong> 원</p>
        <p>REC 수익: <strong>{recRevenue.toLocaleString()}</strong> 원</p>
        <p>총 수익: <strong>{totalRevenue.toLocaleString()}</strong> 원</p>
        <p>순수익: <strong>{netProfit.toLocaleString()}</strong> 원</p>
        <p>회수기간: <strong>{payback}</strong> 년</p>
      </div>
      <div className="flex gap-4">
        <button onClick={exportPDF} className="bg-blue-500 text-white px-4 py-2 rounded">📄 PDF 다운로드</button>
        <button onClick={exportExcel} className="bg-green-500 text-white px-4 py-2 rounded">📥 엑셀 다운로드</button>
      </div>
    </div>
  );
}
