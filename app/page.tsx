'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Users, Sparkles } from "lucide-react";
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Navigation */}
      <nav className="border-b bg-white/50 backdrop-blur-sm fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold">LaTeX Resume Builder</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-24 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Create Professional LaTeX Resumes
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Build and customize your resume with our drag-and-drop builder. 
              Get a beautiful LaTeX resume without writing any code.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/builder">
                <Button size="lg">Start Building</Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">LaTeX Quality</h3>
              <p className="mt-2 text-gray-600">
                Professional typesetting using LaTeX templates that make your resume stand out
              </p>
            </Card>

            <Card className="p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Easy to Use</h3>
              <p className="mt-2 text-gray-600">
                Simple drag-and-drop interface makes building your resume quick and intuitive
              </p>
            </Card>

            <Card className="p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">ATS-Friendly</h3>
              <p className="mt-2 text-gray-600">
                Ensure your resume gets past applicant tracking systems
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <FileText className="h-6 w-6 text-primary" />
              <span className="ml-2 text-lg font-semibold">LaTeX Resume Builder</span>
            </div>
            <p className="text-gray-500">© 2024 LaTeX Resume Builder. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}