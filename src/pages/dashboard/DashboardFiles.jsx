import React from 'react';
import { Icon } from '@iconify/react';
import { useTheme } from '../../contexts/ThemeContext';

const DashboardFiles = () => {
  const { isDark } = useTheme();

  const fileTypeIcon = (format) => {
    const map = {
      pdf: { icon: 'fluent:document-pdf-24-regular', color: 'text-rose-400 bg-rose-500/10' },
      png: { icon: 'fluent:image-24-regular', color: 'text-blue-400 bg-blue-500/10' },
      jpg: { icon: 'fluent:image-24-regular', color: 'text-blue-400 bg-blue-500/10' },
      mp4: { icon: 'fluent:video-24-regular', color: 'text-violet-400 bg-violet-500/10' },
    };
    return map[format?.toLowerCase()] || { icon: 'fluent:document-24-regular', color: 'text-slate-400 bg-white/5' };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Files</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage and upload your files</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-primary-500/25">
          <Icon icon="fluent:cloud-arrow-up-24-regular" width="20" />
          Upload File
        </button>
      </div>

      {/* Upload Drop Zone */}
      <div className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${
        isDark ? 'border-white/10 hover:border-primary-500/50 bg-white/5' : 'border-slate-200 hover:border-primary-400 bg-slate-50'
      }`}>
        <Icon icon="fluent:cloud-arrow-up-24-regular" width="56" className="mx-auto mb-4 text-slate-400 opacity-60" />
        <p className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Drag &amp; drop files here
        </p>
        <p className="text-sm text-slate-500 mb-4">or click to browse</p>
        <button className="px-5 py-2 bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 rounded-xl text-sm font-semibold transition-colors">
          Browse Files
        </button>
      </div>

      {/* Empty State */}
      <div className={`rounded-2xl border text-center py-16 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
        <Icon icon="fluent:folder-open-24-regular" width="64" className="mx-auto mb-4 text-slate-400 opacity-30" />
        <p className={`text-lg font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>No files uploaded yet</p>
        <p className="text-sm text-slate-500">Files you upload will appear here.</p>
        <p className="text-xs text-slate-600 mt-4">
          File upload requires backend Cloudinary/Multer integration — connect your upload endpoint to activate this feature.
        </p>
      </div>
    </div>
  );
};

export default DashboardFiles;
