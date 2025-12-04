type ToggleProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export const Toggle = ({ label, checked, onChange }: ToggleProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-left text-sm text-slate-200"
  >
    <span
      className={`inline-flex h-5 w-10 items-center rounded-full px-0.5 transition ${
        checked ? 'bg-brand' : 'bg-slate-600'
      }`}
    >
      <span
        className={`h-4 w-4 rounded-full bg-white transition ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </span>
    <span>{label}</span>
  </button>
);

