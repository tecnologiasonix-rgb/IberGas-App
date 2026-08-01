import React, { useState } from 'react';
import { Star, X, Check, Award } from 'lucide-react';
import { EmergencyRequest } from '../../types';

interface ClientRatingModalProps {
  request: EmergencyRequest;
  onClose: () => void;
  onSubmit: (stars: number, comment: string, badges: string[]) => void;
}

export const ClientRatingModal: React.FC<ClientRatingModalProps> = ({
  request,
  onClose,
  onSubmit
}) => {
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedBadges, setSelectedBadges] = useState<string[]>([
    'Llegada Puntual',
    'Trabajo Limpio'
  ]);

  const availableBadges = [
    'Llegada Puntual',
    'Diagnóstico Certero',
    'Trabajo Limpio',
    'Explicación Clara',
    'Trato Muy Profesional',
    'Solución Rápida'
  ];

  const toggleBadge = (badge: string) => {
    if (selectedBadges.includes(badge)) {
      setSelectedBadges(selectedBadges.filter((b) => b !== badge));
    } else {
      setSelectedBadges([...selectedBadges, badge]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(stars, comment, selectedBadges);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-white">Valoración del Servicio</h3>
          <p className="text-xs text-white/50">
            Evalúa el trabajo del técnico para garantizar la calidad en Urgent BCN.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Star selector */}
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setStars(star)}
                className="p-2 transition-transform hover:scale-110"
              >
                <Star
                  className={`w-7 h-7 ${
                    star <= stars
                      ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]'
                      : 'text-white/20'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Badges picker */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">
              Aspectos Destacados
            </label>
            <div className="flex flex-wrap gap-2">
              {availableBadges.map((badge) => {
                const isSelected = selectedBadges.includes(badge);
                return (
                  <button
                    key={badge}
                    type="button"
                    onClick={() => toggleBadge(badge)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                        : 'bg-[#050505] border-white/10 text-white/50 hover:border-white/20'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{badge}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comment text */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">
              Tu Comentario
            </label>
            <textarea
              rows={3}
              placeholder="Explica tu experiencia con el técnico..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-[#050505] border border-white/10 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-lg"
          >
            Enviar Valoración
          </button>
        </form>
      </div>
    </div>
  );
};
