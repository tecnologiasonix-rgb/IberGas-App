import React, { useState } from 'react';
import { Upload, CheckCircle2, Clock, AlertCircle, FileText, ShieldCheck } from 'lucide-react';
import { VerificationDocument } from '../../types';

interface DocUploadFormProps {
  documents: VerificationDocument[];
  onUploadDoc: (doc: Omit<VerificationDocument, 'id' | 'status' | 'uploadedAt'>) => void;
  verificationStatus: string;
}

export const DocUploadForm: React.FC<DocUploadFormProps> = ({
  documents,
  onUploadDoc,
  verificationStatus
}) => {
  const [docType, setDocType] = useState<'dni' | 'installer_license' | 'liability_insurance' | 'autonomo_receipt'>('installer_license');
  const [docNumber, setDocNumber] = useState('');
  const [fileName, setFileName] = useState('');
  const [expiryDate, setExpiryDate] = useState('2028-12-31');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docNumber.trim()) {
      alert('Por favor indica el número o código del documento/carnet.');
      return;
    }

    onUploadDoc({
      type: docType,
      name: fileName || `${docType.toUpperCase()}_Certificado_BCN.pdf`,
      fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&q=80',
      documentNumber: docNumber,
      expiryDate
    });

    setDocNumber('');
    setFileName('');
  };

  const getDocTypeName = (type: string) => {
    switch (type) {
      case 'dni':
        return 'DNI / NIE (Anverso y Reverso)';
      case 'installer_license':
        return 'Carnet de Instalador Certificado (Gas/Elec/Font)';
      case 'liability_insurance':
        return 'Seguro de Responsabilidad Civil (Poliza RC)';
      case 'autonomo_receipt':
        return 'Recibo RETA / Alta de Autónomo';
      default:
        return type;
    }
  };

  return (
    <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-500 uppercase tracking-widest mb-1">
            <ShieldCheck className="w-4 h-4" /> Verificación de Documentación Obligatoria
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">Documentos de Identidad y Licencia</h3>
          <p className="text-xs text-white/50 mt-0.5">
            Para recibir ofertas de trabajo en la red privada de Urgent BCN debes verificar tu carnet técnico y seguro RC.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {verificationStatus === 'verified' && (
            <span className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-xs font-bold border border-green-500/30 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> TÉCNICO HOMOLOGADO Y VERIFICADO
            </span>
          )}
          {verificationStatus === 'pending_review' && (
            <span className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30 flex items-center gap-1.5">
              <Clock className="w-4 h-4 animate-spin" /> REVISIÓN PENDIENTE POR CENTRAL
            </span>
          )}
          {verificationStatus === 'unverified' && (
            <span className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" /> DOCUMENTACIÓN INCOMPLETA
            </span>
          )}
        </div>
      </div>

      {/* Uploaded Docs Table */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
          Estado de Documentos Registrados
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {['dni', 'installer_license', 'liability_insurance'].map((reqType) => {
            const existing = documents.find((d) => d.type === reqType);

            return (
              <div
                key={reqType}
                className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
                  existing?.status === 'verified'
                    ? 'bg-green-950/20 border-green-500/30'
                    : existing?.status === 'pending'
                    ? 'bg-amber-950/20 border-amber-500/30'
                    : 'bg-[#050505] border-white/10'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-red-500" />
                    <span className="text-xs font-bold text-white">
                      {getDocTypeName(reqType)}
                    </span>
                  </div>
                </div>

                {existing ? (
                  <div className="space-y-1 text-[11px] text-white/70">
                    <div className="font-semibold text-white">{existing.name}</div>
                    <div className="text-white/40">Nº: {existing.documentNumber}</div>
                    <div className="flex items-center justify-between pt-1 border-t border-white/10">
                      <span className="text-[10px] text-white/40">Expira: {existing.expiryDate}</span>
                      <span
                        className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                          existing.status === 'verified'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {existing.status === 'verified' ? 'Verificado' : 'En Revisión'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-red-400 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Pendiente de subir
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upload Form */}
      <form onSubmit={handleSubmit} className="p-4 rounded-xl bg-[#050505] border border-white/10 space-y-4">
        <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
          <Upload className="w-4 h-4 text-red-500" /> Subir o Actualizar Nuevo Documento
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-white/60 mb-1">
              Tipo de Documento
            </label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value as any)}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
            >
              <option value="installer_license">Carnet de Instalador Certificado</option>
              <option value="liability_insurance">Seguro Responsabilidad Civil (RC)</option>
              <option value="dni">DNI / NIE (Anverso y Reverso)</option>
              <option value="autonomo_receipt">Recibo RETA / Alta Autónomo</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-white/60 mb-1">
              Número de Carnet o Póliza *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: CAT-GAS-99401"
              value={docNumber}
              onChange={(e) => setDocNumber(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-white/60 mb-1">
              Nombre de Archivo / Adjunto
            </label>
            <input
              type="text"
              placeholder="Ej: Carnet_Oficial_2026.pdf"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg"
        >
          Enviar Documento a Verificación
        </button>
      </form>
    </div>
  );
};
