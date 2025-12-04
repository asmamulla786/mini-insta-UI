type EmptyStateProps = {
  title: string;
  description: string;
  action?: React.ReactNode;
};

export const EmptyState = ({ title, description, action }: EmptyStateProps) => (
  <div className="glass-panel flex flex-col items-center gap-3 p-8 text-center">
    <p className="text-lg font-semibold text-white">{title}</p>
    <p className="text-sm text-slate-400">{description}</p>
    {action}
  </div>
);

