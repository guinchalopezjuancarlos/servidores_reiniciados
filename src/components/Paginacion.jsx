import React from 'react';

export default function Paginacion({ totalItems, itemsPorPagina, paginaActual, setPaginaActual }) {
  const totalPaginas = Math.ceil(totalItems / itemsPorPagina);
  if (totalPaginas <= 1) return null;
  const paginas = Array.from({ length: totalPaginas }, (_, i) => i + 1);
  const estiloBoton = "px-3 py-1 border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 transition-colors text-[11px] font-bold rounded-sm shadow-sm";
  const estiloActivo = "px-3 py-1 border border-[#ff7033] bg-[#ff7033] text-white text-[11px] font-bold rounded-sm shadow-sm";
  const estiloDeshabilitado = "opacity-40 cursor-not-allowed bg-slate-50";
  return (
    <div className="flex items-center gap-1 mt-2 select-none">
      <button 
        onClick={() => setPaginaActual(1)} 
        disabled={paginaActual === 1}
        className={`${estiloBoton} ${paginaActual === 1 ? estiloDeshabilitado : ''}`}
        title="Primera página"
      >
        {"<<"}
      </button>
      <button 
        onClick={() => setPaginaActual(prev => Math.max(prev - 1, 1))} 
        disabled={paginaActual === 1}
        className={`${estiloBoton} ${paginaActual === 1 ? estiloDeshabilitado : ''}`}
        title="Anterior"
      >
        {"<"}
      </button>
      <div className="flex gap-1 mx-1">
        {paginas.map(num => (
          <button
            key={num}
            onClick={() => setPaginaActual(num)}
            className={paginaActual === num ? estiloActivo : estiloBoton}
          >
            {num}
          </button>
        ))}
      </div>
      <button 
        onClick={() => setPaginaActual(prev => Math.min(prev + 1, totalPaginas))} 
        disabled={paginaActual === totalPaginas}
        className={`${estiloBoton} ${paginaActual === totalPaginas ? estiloDeshabilitado : ''}`}
        title="Siguiente"
      >
        {">"}
      </button>
      <button 
        onClick={() => setPaginaActual(totalPaginas)} 
        disabled={paginaActual === totalPaginas}
        className={`${estiloBoton} ${paginaActual === totalPaginas ? estiloDeshabilitado : ''}`}
        title="Última página"
      >
        {">>"}
      </button>
    </div>
  );
}