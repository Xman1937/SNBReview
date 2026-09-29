import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  link?: string;
  linkText?: string;
  icon?: ReactNode;
}

export function SectionHeader({ title, link, linkText = 'View All', icon }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
        <span className="w-1 h-6 bg-red-500 rounded-full" />
        {icon}
        {title}
      </h2>
      {link && (
        <Link
          to={link}
          className="text-sm text-gray-400 hover:text-red-400 flex items-center gap-1 transition-colors"
        >
          {linkText} <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}

interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-10 h-10 border-2 border-gray-700 border-t-red-500 rounded-full animate-spin mb-4" />
      <p className="text-gray-500 text-sm">{message}</p>
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  message?: string;
  icon?: ReactNode;
}

export function EmptyState({ title, message, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {icon && <div className="text-gray-700 mb-4">{icon}</div>}
      <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
      {message && <p className="text-gray-500 text-sm max-w-md">{message}</p>}
    </div>
  );
}

interface ErrorStateProps {
  message?: string;
}

export function ErrorState({ message = 'Something went wrong. Please try again later.' }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
        <span className="text-red-400 text-xl">!</span>
      </div>
      <p className="text-gray-400 text-sm max-w-md">{message}</p>
    </div>
  );
}
