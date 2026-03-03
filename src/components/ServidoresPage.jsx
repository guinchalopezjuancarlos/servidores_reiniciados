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

    const ahora = new Date();
    const dia = String(ahora.getDate()).padStart(2, '0');
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const anio = ahora.getFullYear();
    const horas = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    
    const fechaFormateada = `${dia}-${mes}-${anio}_${horas}-${minutos}`;
    const nombreArchivo = `reportes_servidores_reiniciados_${fechaFormateada}.xlsx`;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte de Servidores');

    worksheet.mergeCells('A1:H2');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'REPORTE DETALLADO DE SERVIDORES REINICIADOS';
    titleCell.font = { name: 'Arial Black', size: 14, color: { argb: 'FFFFFFFF' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } };

    const columnsConfig = [
      { key: 'nombre', width: 35 },
      { key: 'uptimeTexto', width: 20 },
      { key: 'uptimeHoras', width: 15 },
      { key: 'fecha', width: 25 },
      { key: 'agrupador', width: 20 },
      { key: 'tipo', width: 15 },
      { key: 'proyecto', width: 30 },
      { key: 'empresa', width: 20 }
    ];
    worksheet.columns = columnsConfig;

    const headers = ['SERVIDOR', 'UPTIME (D:H:M)', 'UPTIME (H)', 'LAST BOOT', 'AGRUPADOR', 'TIPO', 'PROYECTO', 'EMPRESA'];
    const headerRow = worksheet.getRow(3);
    
    headers.forEach((h, i) => {
      const cell = headerRow.getCell(i + 1);
      cell.value = h;
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    datosAExportar.forEach((srv) => {
      const row = worksheet.addRow({
        nombre: srv.nombre,
        uptimeTexto: srv.uptimeTexto,
        uptimeHoras: srv.uptimeHoras,
        fecha: srv.fecha,
        agrupador: srv.agrupador,
        tipo: srv.tipo,
        proyecto: srv.proyecto,
        empresa: srv.empresa
      });

      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.font = { name: 'Arial', size: 9 };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), nombreArchivo);
    
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Excel descargado',
      showConfirmButton: false,
      timer: 1500
    });
  };

  return (
    
    <div className="max-w-[1150px] mx-auto p-4 bg-white min-h-screen">
      
       <h1 className="text-center text-lg font-bold mb-6 text-slate-800 uppercase tracking-tight">
        Lista de Servidores Reiniciados
      </h1>

      <FiltroUptime onObtener={handleObtener} />
      
  
      <div className="flex mb-4 shadow-sm">
        <input 
          className="flex-grow border-2 border-slate-200 p-2 text-xs rounded-l outline-none focus:border-orange-500 transition-all"
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
          Limpiar
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

      <div className="mt-4 flex justify-between items-start">
        <div className="bg-slate-50 p-2 rounded border border-slate-200 text-slate-500 font-bold text-[10px]">
          Mostrando {Math.min(datosFinalesParaVista.length, 10)} de {datosFinalesParaVista.length} servidores
        </div>
        
        <div className="flex flex-col items-end gap-3">
          <Paginacion 
            totalItems={datosFinalesParaVista.length} 
            itemsPorPagina={10} 
            paginaActual={pagina} 
            setPaginaActual={setPagina} 
          />
          <button 
            onClick={exportarExcel}
            className="bg-green-700 hover:bg-green-800 text-white px-10 py-2.5 rounded font-black text-xs shadow-lg transition-all active:scale-95 uppercase flex items-center gap-2"
          >
             Exportar excel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServidoresPage;