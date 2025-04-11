
import { useState } from 'react';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Home() {
  const [capacity, setCapacity] = useState(100);
  const [sunHours, setSunHours] = useState(3.5);
  const [smp, setSmp] = useState(140);
  const [rec, setRec] = useState(100);
  const [recWeight, setRecWeight] = useState(0.85);
  const [opex, setOpex] = useState(13000000.0);
  const [capex, setCapex] = useState(130000000.0);

  const [loan, setLoan] = useState(60000000.0);
  const [interest, setInterest] = useState(0.045); // 4.5%
  const [repayment, setRepayment] = useState(10); // 10년 상환

  const generation = capacity * sunHours * 365;
  const smpRevenue = generation * smp;
  const recRevenue = generation * rec * recWeight;
  const totalRevenue = smpRevenue + recRevenue;

  const annualInterest = loan * interest;
  const annualPrincipal = loan / repayment;
  const annualRepayment = annualInterest + annualPrincipal;
  const netProfit = totalRevenue - opex - annualRepayment;
  const selfCapital = capex - loan;
  const payback = selfCapital / netProfit;

  const format = (v) => v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const chartData = Array.from({ length: 20 }, (_, i) => {
    const year = i + 1;
    const repaymentThisYear = year <= repayment ? annualRepayment : 0;
    const profit = totalRevenue - opex - repaymentThisYear;
    return {
      name: `${year}년`,
      순수익: profit,
      누적수익: profit * year,
    };
  });

  const exportPDF = () => {
    const doc = new jsPDF();
    const logo = new Image();
    logo.src = '/logo.png';
    logo.onload = () => {
      doc.addImage(logo, 'PNG', 140, 10, 50, 20);
      doc.setFontSize(14);
      doc.text('태양광 수익성 분석 결과', 20, 20);
      doc.setFontSize(10);
      doc.text(`설치용량: ${format(capacity)} kW`, 20, 35);
      doc.text(`발전시간: ${format(sunHours)} h/day`, 20, 42);
      doc.text(`예상 발전량: ${format(generation)} kWh`, 20, 49);
      doc.text(`총 수익: ${format(totalRevenue)} 원`, 20, 56);
      doc.text(`운영비: ${format(opex)} 원`, 20, 63);
      doc.text(`대출금: ${format(loan)} 원`, 20, 70);
      doc.text(`이자율: ${(interest * 100).toFixed(2)}%`, 20, 77);
      doc.text(`상환기간: ${repayment} 년`, 20, 84);
      doc.text(`연간 원리금: ${format(annualRepayment)} 원`, 20, 91);
      doc.text(`순수익: ${format(netProfit)} 원`, 20, 98);
      doc.text(`자기자본: ${format(selfCapital)} 원`, 20, 105);
      doc.text(`회수기간: ${format(payback)} 년`, 20, 112);
      doc.save('solar_profit_report.pdf');
    };
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet([
      {
        설치용량: capacity,
        발전시간: sunHours,
        발전량: generation,
        SMP수익: smpRevenue,
        REC수익: recRevenue,
        총수익: totalRevenue,
        운영비: opex,
        대출금: loan,
        이자율: interest,
        상환기간: repayment,
        연원리금: annualRepayment,
        순수익: netProfit,
        자기자본: selfCapital,
        회수기간: payback
      }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '수익성분석');
    XLSX.writeFile(wb, 'solar_profit_summary.xlsx');
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4 text-sm">
      <img src="/logo.png" alt="logo" className="w-32 mb-4" />
      <h1 className="text-xl font-bold">태양광 수익성 계산기 + 대출/그래프</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <label>설치용량 (kW)<input type="number" value={capacity} onChange={(e) => setCapacity(+e.target.value)} /></label>
        <label>발전시간 (h/day)<input type="number" value={sunHours} onChange={(e) => setSunHours(+e.target.value)} /></label>
        <label>SMP 단가<input type="number" value={smp} onChange={(e) => setSmp(+e.target.value)} /></label>
        <label>REC 단가<input type="number" value={rec} onChange={(e) => setRec(+e.target.value)} /></label>
        <label>REC 가중치<input type="number" value={recWeight} onChange={(e) => setRecWeight(+e.target.value)} /></label>
        <label>운영비<input type="number" value={opex} onChange={(e) => setOpex(+e.target.value)} /></label>
        <label>총 투자비<input type="number" value={capex} onChange={(e) => setCapex(+e.target.value)} /></label>
        <label>대출금<input type="number" value={loan} onChange={(e) => setLoan(+e.target.value)} /></label>
        <label>이자율 (%)<input type="number" step="0.01" value={interest * 100} onChange={(e) => setInterest(+e.target.value / 100)} /></label>
        <label>상환기간 (년)<input type="number" value={repayment} onChange={(e) => setRepayment(+e.target.value)} /></label>
      </div>

      <div className="bg-gray-100 p-4 rounded text-sm">
        <p>예상 발전량: <strong>{format(generation)}</strong> kWh</p>
        <p>총 수익: <strong>{format(totalRevenue)}</strong> 원</p>
        <p>운영비: <strong>{format(opex)}</strong> 원</p>
        <p>연간 원리금 상환: <strong>{format(annualRepayment)}</strong> 원</p>
        <p>순수익: <strong>{format(netProfit)}</strong> 원</p>
        <p>회수기간 (자기자본 기준): <strong>{format(payback)}</strong> 년</p>
      </div>

      <div className="flex gap-4">
        <button onClick={exportPDF} className="bg-blue-500 text-white px-4 py-2 rounded">📄 PDF 다운로드</button>
        <button onClick={exportExcel} className="bg-green-500 text-white px-4 py-2 rounded">📥 엑셀 다운로드</button>
      </div>

      <h3 className="text-md font-bold mt-6">📈 연간 순수익 및 누적 수익</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="누적수익" stroke="#4f46e5" strokeWidth={2} />
          <Line type="monotone" dataKey="순수익" stroke="#10b981" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
