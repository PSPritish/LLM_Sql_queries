'use client';

import { motion } from 'framer-motion';
import { FiFileText, FiSettings, FiUser, FiLogOut } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';

const Header = () => {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="navbar bg-base-100 border-b border-base-200 px-4 lg:px-6"
    >
      <div className="navbar-start">
        <motion.div
          className="flex items-center gap-3"
          whileHover={{ scale: 1.02 }}
        >
          <div className="avatar placeholder">
            <div className="bg-primary text-primary-content rounded-full w-10">
              <HiSparkles className="text-xl" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              CV Grinder
            </h1>
            <p className="text-xs text-base-content/60">AI-Powered CV Analysis</p>
          </div>
        </motion.div>
      </div>

      <div className="navbar-center hidden lg:flex">
        <div role="tablist" className="tabs tabs-border tabs-l">
          <a className="tab tab-active gap-2">
            <FiFileText />
            CV Analysis
          </a>
        </div>
      </div>

      <div className="navbar-end">
        <button className="btn btn-square btn-ghost">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block h-5 w-5 stroke-current"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path> </svg>
        </button>
        {/* <div className="flex items-center gap-2">
          <motion.button
            className="btn btn-ghost btn-circle"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FiSettings className="text-lg" />
          </motion.button>

          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
              <div className="w-8 rounded-full bg-base-200 flex items-center justify-center">
                <FiUser className="text-sm" />
              </div>
            </div>
            <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52 border border-base-200">
              <li><a className="gap-3"><FiUser /> Profile</a></li>
              <li><a className="gap-3"><FiSettings /> Settings</a></li>
              <li><a className="gap-3"><FiLogOut /> Logout</a></li>
            </ul>
          </div>
        </div> */}
      </div>
    </motion.header>
  );
};

export default Header;
