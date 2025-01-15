'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { FileText } from "lucide-react";
import Link from 'next/link';

export default function RegisterPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add registration logic here
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="absolute top-4 left-4">
        <Link href="/">
          <div className="flex items-center gap-2 text-gray-800 hover:text-gray-600">
            <FileText className="h-6 w-6" />
            <span className="font-semibold">LaTeX Resume Builder</span>
          </div>
        </Link>
      </div>
      <Card className="w-[400px]">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Get started with LaTeX Resume Builder
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Name</div>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  type="text"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Email</div>
                <Input
                  id="email"
                  placeholder="Enter your email"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Password</div>
                <Input
                  id="password"
                  placeholder="Create a password"
                  type="password"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Confirm Password</div>
                <Input
                  id="confirmPassword"
                  placeholder="Confirm your password"
                  type="password"
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit">
              Create Account
            </Button>
            <div className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}