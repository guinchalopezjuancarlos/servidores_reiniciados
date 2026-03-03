import React, { useState } from 'react';
import Swal from 'sweetalert2'; 

export default function FiltroUptime({ onObtener }) {
  const [valor, setValor] = useState(1);
  const [unidad, setUnidad] = useState("dias");
  const limite = unidad === 'dias' ? 30 : 72;

  const validarYEnviar = () => {
    const num = Math.floor(valor); 
    if (num < 1 || num > limite) {
      Swal.fire({
        icon: 'error',
        title: num < 1 ? 'Valor inválido' : 'Límite excedido',
        text: `Por favor, ingrese un valor entre 1 y ${limite} ${unidad}.`,
        confirmButtonColor: '#ff7033',
      });
      if (num > limite) setValor(limite);
      if (num < 1) setValor(1);
      return;
    }

    onObtener(num, unidad);
  };

  return (
    <div className="flex flex-col items-center mb-6">
      <div className="flex items-center gap-3 relative">
        <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">
          Reinicios menor a
        </span>
        <input 
          type="number" 
          min="1" 
          max={limite}
          className="w-16 h-9 border-2 border-slate-300 rounded text-center text-lg font-bold outline-none focus:border-orange-500 transition-colors"
          value={valor} 
          onChange={(e) => setValor(e.target.value)} 
        />
        <select 
          className="h-9 px-3 border-2 border-slate-300 rounded text-sm bg-white outline-none cursor-pointer font-bold focus:border-orange-500"
          value={unidad}
          onChange={(e) => {
            setUnidad(e.target.value);
            const nuevoLimite = e.target.value === 'dias' ? 30 : 72;
            if (valor > nuevoLimite) setValor(nuevoLimite);
          }}
        >
          <option value="dias">días</option>
          <option value="horas">horas</option>
        </select>

        <div className="group relative">
          <div className="w-5 h-5 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center text-[10px] font-black cursor-help hover:bg-slate-300 transition-colors">
            ?
          </div>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 bg-slate-800 text-white text-[10px] p-2 rounded shadow-xl z-50 text-center leading-relaxed">
            Ingrese un rango máximo de <span className="text-orange-400 font-bold">30 días</span> o <span className="text-orange-400 font-bold">72 horas</span>.
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-800"></div>
          </div>
        </div>
      </div>
      <button 
        className="mt-4 bg-[#ff7033] hover:bg-orange-600 text-white px-16 py-2.5 rounded text-xs font-black shadow-md transition-all uppercase tracking-widest active:scale-95"
        onClick={validarYEnviar}
      >
        Obtener Datos
      </button>
    </div>
  );
}