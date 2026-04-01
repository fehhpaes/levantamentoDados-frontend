import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  exportData,
  getExportJobs,
  downloadExport,
  getExportFormats,
} from '../services/api';
import {
  Download,
  FileText,
  FileSpreadsheet,
  FileJson,
  File,
  Clock,
  CheckCircle,
  XCircle,
  Loader,
  Calendar,
  Filter,
  RefreshCw,
} from 'lucide-react';
import type { ExportConfig, ExportJob } from '../types';

const DATA_TYPES = [
  { value: 'matches', label: 'Partidas', icon: Calendar, description: 'Dados de todas as partidas' },
  { value: 'predictions', label: 'Previsoes', icon: FileText, description: 'Historico de previsoes' },
  { value: 'bets', label: 'Apostas', icon: FileSpreadsheet, description: 'Registro de apostas' },
  { value: 'bankroll', label: 'Banca', icon: FileSpreadsheet, description: 'Transacoes da banca' },
  { value: 'backtest', label: 'Backtests', icon: FileJson, description: 'Resultados de backtests' },
];

const FORMAT_ICONS: Record<string, React.ElementType> = {
  csv: FileSpreadsheet,
  json: FileJson,
  excel: FileSpreadsheet,
  pdf: File,
};

function ExportCard({
  job,
  onDownload,
}: {
  job: ExportJob;
  onDownload: () => void;
}) {
  const statusConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
    pending: { icon: Clock, color: 'text-yellow-600', label: 'Aguardando' },
    processing: { icon: Loader, color: 'text-blue-600', label: 'Processando' },
    completed: { icon: CheckCircle, color: 'text-green-600', label: 'Concluido' },
    failed: { icon: XCircle, color: 'text-red-600', label: 'Falhou' },
  };
  
  const config = statusConfig[job.status];
  const Icon = config.icon;
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-gray-100 ${config.color}`}>
            <Icon className={`w-5 h-5 ${job.status === 'processing' ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <p className="font-medium">Export #{job.id.slice(0, 8)}</p>
            <p className="text-sm text-gray-500">
              {new Date(job.created_at).toLocaleString('pt-BR')}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <span className={`text-sm font-medium ${config.color}`}>
            {config.label}
          </span>
          {job.status === 'processing' && (
            <div className="mt-1 w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-500"
                style={{ width: `${job.progress}%` }}
              />
            </div>
          )}
        </div>
      </div>
      
      {job.status === 'completed' && (
        <button
          onClick={onDownload}
          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Download className="w-4 h-4" />
          Download
        </button>
      )}
      
      {job.status === 'failed' && job.error && (
        <p className="mt-2 text-sm text-red-600">{job.error}</p>
      )}
    </div>
  );
}

export default function Export() {
  const [selectedDataType, setSelectedDataType] = useState<string>('matches');
  const [selectedFormat, setSelectedFormat] = useState<string>('csv');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  
  const { data: formats } = useQuery({
    queryKey: ['export-formats'],
    queryFn: async () => {
      const response = await getExportFormats();
      return response.data;
    },
  });
  
  const { data: jobs, refetch: refetchJobs } = useQuery<ExportJob[]>({
    queryKey: ['export-jobs'],
    queryFn: async () => {
      const response = await getExportJobs();
      return response.data;
    },
    refetchInterval: 5000, // Poll for job updates
  });
  
  const exportMutation = useMutation({
    mutationFn: async (config: ExportConfig) => {
      const response = await exportData(config);
      return response.data;
    },
    onSuccess: () => {
      refetchJobs();
    },
  });
  
  const handleExport = () => {
    exportMutation.mutate({
      format: selectedFormat as 'csv' | 'json' | 'excel' | 'pdf',
      data_type: selectedDataType as 'matches' | 'predictions' | 'bets' | 'bankroll' | 'backtest',
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    });
  };
  
  const handleDownload = async (jobId: string) => {
    try {
      const response = await downloadExport(jobId);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export_${jobId}.${selectedFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };
  
  const availableFormats = formats || ['csv', 'json', 'excel', 'pdf'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Exportar Dados</h2>
        <button
          onClick={() => refetchJobs()}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
        >
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </button>
      </div>
      
      {/* Export Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-4">Nova Exportacao</h3>
        
        {/* Data Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Dados
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {DATA_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => setSelectedDataType(type.value)}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    selectedDataType === type.value
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`w-6 h-6 mx-auto mb-2 ${
                    selectedDataType === type.value ? 'text-primary-600' : 'text-gray-400'
                  }`} />
                  <p className="text-sm font-medium text-center">{type.label}</p>
                </button>
              );
            })}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {DATA_TYPES.find(t => t.value === selectedDataType)?.description}
          </p>
        </div>
        
        {/* Format Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Formato
          </label>
          <div className="flex gap-3">
            {availableFormats.map((format: string) => {
              const Icon = FORMAT_ICONS[format] || File;
              return (
                <button
                  key={format}
                  onClick={() => setSelectedFormat(format)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                    selectedFormat === format
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${
                    selectedFormat === format ? 'text-primary-600' : 'text-gray-400'
                  }`} />
                  <span className="text-sm font-medium uppercase">{format}</span>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Filters Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 mb-4"
        >
          <Filter className="w-4 h-4" />
          {showFilters ? 'Esconder Filtros' : 'Mostrar Filtros'}
        </button>
        
        {/* Date Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Inicial
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Final
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>
        )}
        
        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={exportMutation.isPending}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          {exportMutation.isPending ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Exportar {DATA_TYPES.find(t => t.value === selectedDataType)?.label}
            </>
          )}
        </button>
      </div>
      
      {/* Export History */}
      <div>
        <h3 className="font-semibold mb-4">Exportacoes Recentes</h3>
        
        {jobs && jobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job) => (
              <ExportCard
                key={job.id}
                job={job}
                onDownload={() => handleDownload(job.id)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Nenhuma exportacao realizada ainda.</p>
            <p className="text-sm text-gray-400">
              Selecione o tipo de dados e formato acima para comecar.
            </p>
          </div>
        )}
      </div>
      
      {/* Quick Export Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">Dicas de Exportacao</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Use CSV para importar em planilhas (Excel, Google Sheets)</li>
          <li>• JSON e ideal para integracao com outras ferramentas</li>
          <li>• Excel mantem formatacao e permite multiplas abas</li>
          <li>• PDF e otimo para relatorios e impressao</li>
        </ul>
      </div>
    </div>
  );
}
