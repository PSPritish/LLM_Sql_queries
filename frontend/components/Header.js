'use client';

import { motion } from 'framer-motion';
import { FiFileText, FiSettings, FiUser, FiMenu, FiX, FiShield } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import useStore from '../store/useStore';

const Header = () => {
  const {
    sessionId,
    cvData,
    recentAnalyses,
    mobileSidebarOpen,
    setMobileSidebarOpen,
    clearAllData
  } = useStore();

  const handleClearAll = () => {
    if (confirm('Clear all CV data and chat history? This cannot be undone.')) {
      clearAllData();
      window.location.reload();
    }
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="navbar bg-base-100 border-b border-base-200 px-4 lg:px-6 h-16 flex-shrink-0"
    >
      <div className="navbar-start">
        <div className="flex items-center gap-3">
          {/* Mobile Sidebar Toggle */}
          <motion.button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="btn btn-ghost btn-sm btn-circle lg:hidden"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {mobileSidebarOpen ? <FiX /> : <FiMenu />}
          </motion.button>

          <div className="breadcrumbs text-sm">
            <ul>
              <li><a className="text-base-content/60">Dashboard</a></li>
              <li className="font-medium">CV Analysis</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="navbar-center hidden lg:flex">
        <div className="flex items-center gap-4">
          <div role="tablist" className="tabs tabs-bordered">
            <a className="tab tab-active gap-2">
              <FiFileText />
              CV Analysis
            </a>
          </div>

          {/* Current Analysis Status */}
          {cvData.fileName && (
            <div className="flex items-center gap-2 px-3 py-1 bg-base-200 rounded-full">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-xs font-medium truncate max-w-32">
                {cvData.fileName}
              </span>
              {cvData.atsScore > 0 && (
                <div className={`badge badge-xs ${cvData.atsScore >= 80 ? 'badge-success' : cvData.atsScore >= 60 ? 'badge-warning' : 'badge-error'}`}>
                  {cvData.atsScore}%
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="navbar-end">
        <div className="flex items-center gap-2">
          {/* Privacy Indicator */}
          <div className="tooltip tooltip-bottom" data-tip="All data processed locally">
            <div className="flex items-center gap-1 px-2 py-1 bg-success/10 text-success rounded-full">
              <FiShield className="text-xs" />
              <span className="text-xs font-medium hidden sm:inline">Private</span>
            </div>
          </div>

          {/* Session Info */}
          {sessionId && (
            <div className="tooltip tooltip-bottom" data-tip={`Session: ${sessionId.slice(-8)}`}>
              <div className="flex items-center gap-1 px-2 py-1 bg-base-200 rounded-full">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-xs text-base-content/60 hidden md:inline">
                  {recentAnalyses.length} analyses
                </span>
              </div>
            </div>
          )}

          {/* Settings Dropdown */}
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-sm btn-circle">
              <FiSettings className="text-lg" />
            </div>
            <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow border border-base-200">
              <li><a className="gap-2"><FiUser /> Profile Settings</a></li>
              <li><a className="gap-2"><FiShield /> Privacy Settings</a></li>
              <li><a className="gap-2"><FiFileText /> Export Data</a></li>
              <div className="divider my-1"></div>
              <li>
                <a className="gap-2 text-error" onClick={handleClearAll}>
                  <FiX /> Clear All Data
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
