"use client";

import { useState } from "react";
import CreateNewUser from "@/components/CreateNewUser";
import ViewCreatedUsers from "@/components/ViewCreatedUsers";
import ThemeToggle from "@/components/ThemeToggle";
import { FiUser, FiUsers } from "react-icons/fi";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"create" | "view">("create");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Admin <span className="text-blue-600 dark:text-blue-400">Dashboard</span>
            </h1>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-sm font-medium">AD</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("create")}
              className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${activeTab === "create" 
                ? "border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-300" 
                : "border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300"}`}
            >
              <FiUser className="h-5 w-5 mr-2" />
              Create User
            </button>
            <button
              onClick={() => setActiveTab("view")}
              className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${activeTab === "view" 
                ? "border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-300" 
                : "border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300"}`}
            >
              <FiUsers className="h-5 w-5 mr-2" />
              View Users
            </button>
          </div>
        </div>
      </nav>

      {/* Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {activeTab === "create" ? (
            <CreateNewUser />
          ) : (
            <ViewCreatedUsers />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Admin Dashboard. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}