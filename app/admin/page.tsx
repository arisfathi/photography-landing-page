"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, signOut } from "@/lib/auth";
import { Settings, Calendar, Package, Image, LogOut, Layers } from "lucide-react";

interface User {
  email: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkSession() {
      try {
        const session = await getSession();

        if (!session) {
          router.push("/admin/login");
          return;
        }

        setUser({
          email: session.user?.email || "",
        });
      } catch (err) {
        setError("Failed to load session");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    checkSession();
  }, [router]);

  async function handleSignOut() {
    const result = await signOut();
    if (result.success) {
      router.push("/admin/login");
    } else {
      setError(result.error || "Sign out failed");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const navItems = [
    {
      name: "Settings",
      href: "/admin/settings",
      icon: Settings,
      description: "Manage site settings",
    },
    {
      name: "Photography Types",
      href: "/admin/types",
      icon: Layers,
      description: "Manage photography types",
    },
    {
      name: "Availability",
      href: "/admin/availability",
      icon: Calendar,
      description: "Manage availability calendar",
    },
    {
      name: "Packages",
      href: "/admin/packages",
      icon: Package,
      description: "Manage service packages",
    },
    {
      name: "Portfolio",
      href: "/admin/portfolio",
      icon: Image,
      description: "Manage portfolio items",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Management Tools
          </h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg mb-4">
                    <IconComponent className="text-indigo-600" size={24} />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {item.name}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    {item.description}
                  </p>
                </a>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
