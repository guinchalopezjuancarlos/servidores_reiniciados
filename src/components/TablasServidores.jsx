import React, { useState, useMemo, useEffect } from 'react';


export default function TablasServidores({ 
  datos, 
  onBorrar, 
  queryInfo, 
  haBuscado, 
  onFilteredDataChange,
  paginaActual 
}) {
  const [menuAbierto, setMenuAbierto] = useState(null);
  const [filtros, setFiltros] = useState({});
  const [orden, setOrden] = useState({ col: 'uptimeHoras', dir: 'asc' });

  const todosLosDatosFiltrados = useMemo(() => {
    let result = [...datos];
    
   
    Object.keys(filtros).forEach(col => {
      if (filtros[col]?.length > 0) {
        result = result.filter(item => filtros[col].includes(String(item[col])));
      }
    });

    result.sort((a, b) => {
      let valA = a[orden.col];
      let valB = b[orden.col];
      if (orden.col === 'fecha') {
        valA = new Date(a.fecha).getTime();
        valB = new Date(b.fecha).getTime();
      }
  
      if (valA == null) return 1;
      if (valB == null) return -1;

      return orden.dir === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });

    return result;
  }, [datos, filtros, orden]);
  useEffect(() => {
    if (onFilteredDataChange) {
      onFilteredDataChange(todosLosDatosFiltrados);
    }
  }, [todosLosDatosFiltrados, onFilteredDataChange]);

  const datosVisibles = useMemo(() => {
    const inicio = (paginaActual - 1) * 10;
    return todosLosDatosFiltrados.slice(inicio, inicio + 10);
  }, [todosLosDatosFiltrados, paginaActual]);

  const toggleOrden = (col) => {
    setOrden(prev => ({
      col,
      dir: prev.col === col && prev.dir === 'asc' ? 'desc' : 'asc'
    }));
  };

  useEffect(() => {
    const cerrarCualquierMenu = () => setMenuAbierto(null);
    if (menuAbierto) {
      window.addEventListener('click', cerrarCualquierMenu);
    }
    return () => window.removeEventListener('click', cerrarCualquierMenu);
  }, [menuAbierto]);

  return (
    <div className="border border-slate-300 rounded bg-white overflow-visible w-full shadow-sm">
      <table className="w-full text-center border-collapse table-fixed min-w-[1000px]">
        <thead>
          <tr className="bg-[#ff7033] text-white text-[10px] uppercase font-bold">
            <th className="py-2 border-x border-orange-400 relative">
              Servidor <button className="ml-1" onClick={(e) => { e.stopPropagation(); setMenuAbierto(menuAbierto === 'nombre' ? null : 'nombre'); }}>▽</button>
              {menuAbierto === 'nombre' && <MenuFiltro col="nombre" datos={datos} filtros={filtros} setFiltros={setFiltros} />}
            </th>
            <th className="py-2 border-x border-orange-400 cursor-pointer" onClick={() => toggleOrden('uptimeHoras')}>
              Uptime (d:h:m) {orden.col === 'uptimeHoras' && (orden.dir === 'asc' ? '▲' : '▼')}
            </th>
            <th className="py-2 border-x border-orange-400 cursor-pointer" onClick={() => toggleOrden('uptimeHoras')}>
              Uptime (h) {orden.col === 'uptimeHoras' && (orden.dir === 'asc' ? '▲' : '▼')}
            </th>
            <th className="py-2 border-x border-orange-400 cursor-pointer" onClick={() => toggleOrden('fecha')}>
              Last Boot {orden.col === 'fecha' && (orden.dir === 'asc' ? '▲' : '▼')}
            </th>
            <th className="py-2 border-x border-orange-400 relative">
              Agrupador <button className="ml-1" onClick={(e) => { e.stopPropagation(); setMenuAbierto(menuAbierto === 'agrupador' ? null : 'agrupador'); }}>▽</button>
              {menuAbierto === 'agrupador' && <MenuFiltro col="agrupador" datos={datos} filtros={filtros} setFiltros={setFiltros} />}
            </th>
            <th className="py-2 border-x border-orange-400 relative">
              Tipo <button className="ml-1" onClick={(e) => { e.stopPropagation(); setMenuAbierto(menuAbierto === 'tipo' ? null : 'tipo'); }}>▽</button>
              {menuAbierto === 'tipo' && <MenuFiltro col="tipo" datos={datos} filtros={filtros} setFiltros={setFiltros} />}
            </th>
            <th className="py-2 border-x border-orange-400 relative">
              Proyecto <button className="ml-1" onClick={(e) => { e.stopPropagation(); setMenuAbierto(menuAbierto === 'proyecto' ? null : 'proyecto'); }}>▽</button>
              {menuAbierto === 'proyecto' && <MenuFiltro col="proyecto" datos={datos} filtros={filtros} setFiltros={setFiltros} />}
            </th>
            <th className="py-2 border-x border-orange-400 relative">
              Empresa <button className="ml-1" onClick={(e) => { e.stopPropagation(); setMenuAbierto(menuAbierto === 'empresa' ? null : 'empresa'); }}>▽</button>
              {menuAbierto === 'empresa' && <MenuFiltro col="empresa" datos={datos} filtros={filtros} setFiltros={setFiltros} />}
            </th>
            <th className="py-2 border-x border-orange-400 w-20">Opciones</th>
          </tr>
        </thead>
        <tbody className="text-[11px] text-slate-700">
          {datosVisibles.length > 0 ? (
            datosVisibles.map((srv) => (
              <tr key={srv.id} className="hover:bg-slate-50 border-b border-slate-200 transition-colors">
                <td className="p-1 border-x truncate">{srv.nombre}</td>
                <td className="p-1 border-x font-bold text-orange-700">{srv.uptimeTexto}</td>
                <td className="p-1 border-x">{srv.uptimeHoras}</td>
                <td className="p-1 border-x font-mono">{srv.fecha}</td>
                <td className="p-1 border-x">{srv.agrupador}</td>
                <td className="p-1 border-x">{srv.tipo}</td>
                <td className="p-1 border-x truncate">{srv.proyecto}</td>
                <td className="p-1 border-x font-bold">{srv.empresa}</td>
                <td className="p-1 border-x">

                  <button 
                    onClick={() => onBorrar(srv.id)} 
                    className="group p-1.5 rounded-full hover:bg-red-50 transition-all duration-200 active:scale-90"
                    title="Quitar de la lista"
                  >
                    <svg 
                      className="w-5 h-5 text-slate-400 group-hover:text-red-600 transition-colors" 
                      aria-hidden="true" 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M8.586 2.586A2 2 0 0 1 10 2h4a2 2 0 0 1 2 2v2h3a1 1 0 1 1 0 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a1 1 0 0 1 0-2h3V4a2 2 0 0 1 .586-1.414ZM10 6h4V4h-4v2Zm1 4a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Zm4 0a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Z" 
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" className="p-0">
                {haBuscado ? (
                  <div className="bg-[#ffc266] text-white font-bold py-10 text-sm text-center">
                    No se encontraron servidores con los filtros aplicados.
                  </div>
                ) : (
                  <div className="bg-slate-50 text-slate-400 py-10 text-sm text-center italic border-b">
                    Ingrese un parámetro de búsqueda para mostrar resultados.
                  </div>
                )}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

const MenuFiltro = ({ col, datos, filtros, setFiltros }) => {
  const [busquedaInterna, setBusquedaInterna] = useState("");
  
  const opcionesUnicas = useMemo(() => [...new Set(datos.map(d => String(d[col])))], [datos, col]);
  
  const opcionesFiltradas = opcionesUnicas.filter(op => 
    op.toLowerCase().includes(busquedaInterna.toLowerCase())
  );

  return (
    <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-slate-300 shadow-2xl rounded z-50 p-2 text-slate-800 font-normal normal-case" onClick={(e) => e.stopPropagation()}>
      <input 
        type="text"
        className="w-full mb-2 p-1 border border-slate-200 text-[10px] outline-none focus:border-orange-400"
        placeholder="Buscar..."
        value={busquedaInterna}
        onChange={(e) => setBusquedaInterna(e.target.value)}
      />
      
      <div className="max-h-40 overflow-y-auto border-t border-slate-100 pt-1 text-left">
        {opcionesFiltradas.length > 0 ? (
          opcionesFiltradas.map(opc => (
            <label key={opc} className="flex items-center gap-2 p-1 hover:bg-slate-50 text-[10px] cursor-pointer">
              <input 
                type="checkbox" 
                className="accent-orange-500"
                checked={filtros[col]?.includes(opc) || false} 
                onChange={() => {
                  const actual = filtros[col] || [];
                  const nuevo = actual.includes(opc) ? actual.filter(v => v !== opc) : [...actual, opc];
                  setFiltros(prev => ({ ...prev, [col]: nuevo }));
                }}
              />
              <span className="truncate">{opc}</span>
            </label>
          ))
        ) : (
          <div className="text-[9px] text-slate-400 text-center py-2">Sin coincidencias</div>
        )}
      </div>

      {filtros[col]?.length > 0 && (
        <button 
          className="w-full mt-2 text-[9px] text-orange-600 font-bold border-t pt-1 hover:text-orange-800"
          onClick={() => setFiltros(prev => ({ ...prev, [col]: [] }))}
        >
          Limpiar Filtro
        </button>
      )}
    </div>
  );
};