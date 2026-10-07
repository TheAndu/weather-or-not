import type { HumourMode } from '../types';
import { HUMOUR_LABELS, HUMOUR_EMOJI } from '../services/humourService';

interface Props {
  value: HumourMode;
  onChange: (mode: HumourMode) => void;
}

const MODES: HumourMode[] = ['playful', 'witty', 'sarcastic', 'brutal'];

export default function HumourSelector({ value, onChange }: Props) {
  return (
    <div className="humour-selector">
      <span className="humour-label">Tone</span>
      <div className="humour-buttons">
        {MODES.map((mode) => (
          <button
            key={mode}
            className={`humour-btn ${value === mode ? 'active' : ''}`}
            onClick={() => onChange(mode)}
            aria-pressed={value === mode}
          >
            <span className="humour-emoji">{HUMOUR_EMOJI[mode]}</span>
            <span className="humour-text">{HUMOUR_LABELS[mode]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
