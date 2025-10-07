import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  Eye, 
  Bug, 
  LogIn, 
  Palette, 
  ExternalLink,
  Code,
  Rocket,
  Settings
} from 'lucide-react';

const DevNav = () => {
  const devTools = [
    {
      title: "Page Showcase",
      description: "View all pages without authentication. Browse every component and page in the app.",
      route: "/showcase",
      icon: Eye,
      color: "bg-blue-500",
      features: ["No auth required", "Search & filter", "Category browsing", "Live preview"]
    },
    {
      title: "Test Login",
      description: "Quick login with mock credentials for different user roles.",
      route: "/test-login",
      icon: LogIn,
      color: "bg-green-500",
      features: ["Mock users", "All roles", "Instant login", "No backend needed"]
    },
    {
      title: "Debug Info",
      description: "Authentication status, local storage, and system information.",
      route: "/debug",
      icon: Bug,
      color: "bg-red-500",
      features: ["Auth status", "Local storage", "Route info", "Context data"]
    }
  ];

  const quickLinks = [
    { name: "Landing Page", route: "/", description: "Public homepage" },
    { name: "Login", route: "/login", description: "User authentication" },
    { name: "Register", route: "/register", description: "User registration" },
    { name: "Admin Login", route: "/admin-login", description: "Admin authentication" },
  ];

  const roleRoutes = [
    {
      role: "Citizen",
      color: "bg-purple-100 text-purple-800",
      routes: [
        { name: "Dashboard", route: "/dashboard" },
        { name: "My Complaints", route: "/complaints" },
        { name: "File Complaint", route: "/complaints/create" }
      ]
    },
    {
      role: "Admin", 
      color: "bg-red-100 text-red-800",
      routes: [
        { name: "Admin Dashboard", route: "/admin" },
        { name: "User Management", route: "/admin/users" },
        { name: "Complaints", route: "/admin/complaints" },
        { name: "Analytics", route: "/admin/analytics" }
      ]
    },
    {
      role: "Staff",
      color: "bg-yellow-100 text-yellow-800", 
      routes: [
        { name: "Staff Dashboard", route: "/staff" },
        { name: "Department Complaints", route: "/staff/complaints" },
        { name: "Assign Worker", route: "/staff/complaints/123/assign" }
      ]
    },
    {
      role: "Worker",
      color: "bg-orange-100 text-orange-800",
      routes: [
        { name: "Worker Dashboard", route: "/worker" },
        { name: "Assigned Tasks", route: "/worker/tasks" },
        { name: "Reports", route: "/worker/reports" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-full">
              <Code className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CivicMitra Dev Tools
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Development navigation and testing utilities
          </p>
          <Badge className="mt-3 bg-green-100 text-green-800 px-4 py-2">
            <Rocket className="w-4 h-4 mr-2" />
            Development Mode
          </Badge>
        </div>

        {/* Main Dev Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {devTools.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <Card key={index} className="glass-card hover:scale-105 transition-all duration-300 border-0 shadow-xl">
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 ${tool.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">{tool.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    {tool.description}
                  </p>
                  
                  <div className="space-y-2">
                    {tool.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></div>
                        {feature}
                      </div>
                    ))}
                  </div>

                  <Button 
                    onClick={() => window.location.href = tool.route}
                    className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Tool
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Links */}
          <Card className="glass-card shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                Quick Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickLinks.map((link, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div>
                    <div className="font-medium text-sm">{link.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{link.description}</div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => window.location.href = link.route}
                    className="ml-3"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Role-based Routes */}
          <Card className="glass-card shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-purple-600" />
                Role-based Routes
                <Badge className="ml-2 text-xs bg-yellow-100 text-yellow-800">
                  Requires Login
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {roleRoutes.map((roleGroup, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs px-3 py-1 ${roleGroup.color}`}>
                      {roleGroup.role}
                    </Badge>
                  </div>
                  <div className="space-y-1 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                    {roleGroup.routes.map((route, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm py-1">
                        <span className="text-gray-700 dark:text-gray-300">{route.name}</span>
                        <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-600 dark:text-gray-400">
                          {route.route}
                        </code>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  💡 <strong>Tip:</strong> Use the Test Login tool to quickly switch between roles and test these protected routes.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-gray-500 dark:text-gray-400">
          <p>🚀 CivicMitra Development Environment</p>
          <p>Built with React, Vite, TailwindCSS, and shadcn/ui</p>
        </div>
      </div>
    </div>
  );
};

export default DevNav;