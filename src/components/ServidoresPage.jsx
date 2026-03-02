import React, { useState } from 'react';
import ExcelJS from 'exceljs';
import pkg from 'file-saver';
const { saveAs } = pkg;
import Swal from 'sweetalert2'; 

import servidoresData from '../data/scrip'; 
import FiltroUptime from './FiltroUptime';
import TablasServidores from './TablasServidores';
import Paginacion from './Paginacion';

const ServidoresPage = () => {
  const [datosActuales, setDatosActuales] = useState([]);
  const [queryInfo, setQueryInfo] = useState({ valor: 0, unidad: 'dias' });
  const [busquedaGlobal, setBusquedaGlobal] = useState("");
  const [pagina, setPagina] = useState(1);
  const [haBuscado, setHaBuscado] = useState(false);
  const [datosFiltradosEnTabla, setDatosFiltradosEnTabla] = useState([]);

  const handleObtener = (valor, unidad) => {
    setQueryInfo({ valor, unidad });
    setHaBuscado(true);

    const ahora = new Date();
    const factorHoras = unidad === 'dias' ? valor * 24 : valor;
    const milisegundosLimite = factorHoras * 60 * 60 * 1000;

    const filtrados = servidoresData.filter(srv => {
      const fechaServidor = new Date(srv.fecha);
      const diferencia = ahora - fechaServidor;
      return diferencia >= 0 && diferencia <= milisegundosLimite;
    });

    if (filtrados.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Sin resultados',
        text: `No se hallaron servidores con uptime menor a ${valor} ${unidad}`,
        confirmButtonColor: '#ff7033'
      });
    }
    setDatosActuales(filtrados);
    setPagina(1); 
  };
  const datosTrasBusquedaTexto = datosActuales.filter(s => 
    s.nombre.toLowerCase().includes(busquedaGlobal.toLowerCase())
  );
  const datosFinalesParaVista = datosFiltradosEnTabla.length > 0 || busquedaGlobal !== "" 
    ? datosFiltradosEnTabla 
    : datosTrasBusquedaTexto;
  const exportarExcel = async () => {
    const datosAExportar = datosFiltradosEnTabla.length > 0 ? datosFiltradosEnTabla : datosTrasBusquedaTexto;

    if (datosAExportar.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Atención',
        text: 'No hay datos visibles en la tabla para exportar.',
        confirmButtonColor: '#ff7033'
      });
      return;
    }
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte');
    worksheet.mergeCells('A1:H1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'REPORTE DETALLADO DE SERVIDORES';
    titleCell.font = { name: 'Arial Black', size: 14, color: { argb: 'FFFFFFFF' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } };

    const columns = [
      { header: 'SERVIDOR', key: 'nombre', width: 25 },
      { header: 'UPTIME (D:H:M)', key: 'uptimeTexto', width: 20 },
      { header: 'UPTIME (H)', key: 'uptimeHoras', width: 15 },
      { header: 'LAST BOOT', key: 'fecha', width: 25 },
      { header: 'AGRUPADOR', key: 'agrupador', width: 20 },
      { header: 'TIPO', key: 'tipo', width: 15 },
      { header: 'PROYECTO', key: 'proyecto', width: 25 },
      { header: 'EMPRESA', key: 'empresa', width: 20 }
    ];
    worksheet.columns = columns;
    const headerRow = worksheet.getRow(2);
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { horizontal: 'center' };
      cell.border = { top:{style:'thin'}, left:{style:'thin'}, bottom:{style:'thin'}, right:{style:'thin'}};
    });
    datosAExportar.forEach(srv => {
      const row = worksheet.addRow(srv);
      row.eachCell(cell => {
        cell.border = { top:{style:'thin'}, left:{style:'thin'}, bottom:{style:'thin'}, right:{style:'thin'}};
        cell.alignment = { horizontal: 'center' };
      });
    });
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Reporte_Filtrado_${new Date().getTime()}.xlsx`);
    
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Excel generado con éxito',
      showConfirmButton: false,
      timer: 3000
    });
  };
  return (
    <div className="max-w-[1150px] mx-auto p-4 bg-white min-h-screen">
      <h1 className="text-center text-lg font-bold mb-6 text-slate-800 uppercase">
        Lista de Servidores Reiniciados
      </h1>
      <FiltroUptime onObtener={handleObtener} />
      <div className="flex mb-4">
        <input 
          className="flex-grow border-2 border-slate-200 p-2 text-xs rounded-l outline-none focus:border-orange-500"
          placeholder="Buscar servidor por nombre..."
          value={busquedaGlobal}
          onChange={(e) => {
            setBusquedaGlobal(e.target.value);
            setPagina(1); 
          }}
        />
        <button 
          className="bg-[#ff7033] text-white px-6 text-xs font-bold uppercase rounded-r hover:bg-orange-600 transition-colors"
          onClick={() => {
            setBusquedaGlobal(""); 
            setDatosActuales([]); 
            setHaBuscado(false);
            setDatosFiltradosEnTabla([]);
            setPagina(1);
          }}
        >
          Limpiar búsqueda
        </button>
      </div>
      <TablasServidores 
        datos={datosTrasBusquedaTexto} 
        queryInfo={queryInfo}
        haBuscado={haBuscado}
        paginaActual={pagina} 
        onBorrar={(id) => setDatosActuales(prev => prev.filter(i => i.id !== id))}
        onFilteredDataChange={setDatosFiltradosEnTabla} 
      />
      <div className="mt-4 flex justify-between items-center text-[10px]">
        <div className="bg-slate-50 p-2 rounded border border-slate-200 text-slate-500 font-bold">
          Mostrando {Math.min(datosFinalesParaVista.length, 10)} de {datosFinalesParaVista.length} servidores
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <Paginacion 
            totalItems={datosFinalesParaVista.length} 
            itemsPorPagina={10} 
            paginaActual={pagina} 
            setPaginaActual={setPagina} 
          />
          <button 
            onClick={exportarExcel}
            className="bg-green-700 text-white px-12 py-2 rounded font-bold text-xs shadow-md hover:bg-green-800 transition-colors"
          >
            Exportar Excel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServidoresPage;