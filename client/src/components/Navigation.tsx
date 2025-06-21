import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuthApi } from "@/hooks/useAuthApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  HandHeart, 
  Plus, 
  User, 
  Menu, 
  Search,
  MessageCircle,
  Bell,
  Heart,
  Settings
} from "lucide-react";
import AuthModal from "./AuthModal";
import PostItemModal from "./PostItemModal";

export default function Navigation() {
  const { user, isAuthenticated, isLoading, logout } = useAuthApi();
  const [location] = useLocation();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <nav className="bg-white dark:bg-gray-900 shadow-lg sticky top-0 z-50 border-b border-red-100 dark:border-red-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <HandHeart className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">ShareHeart</span>
            </div>
            <div className="animate-pulse h-8 w-24 bg-red-100 dark:bg-red-900 rounded-lg"></div>
          </div>
        </div>
      </nav>
    );
  }

  const navLinks = [
    { href: "/browse", label: "Browse Items", icon: Search },
    { href: "/requests", label: "View Requests", icon: MessageCircle },
  ];

  const userNavLinks = [
    { href: "/dashboard", label: "Dashboard", icon: User },
    { href: "/messages", label: "Messages", icon: MessageCircle },
    { href: "/favorites", label: "Favorites", icon: Heart },
    { href: "/profile", label: "Profile", icon: Settings },
  ];

  return (
    <>
      <nav className="bg-white dark:bg-gray-900 shadow-lg sticky top-0 z-50 border-b border-red-100 dark:border-red-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href={isAuthenticated ? "/home" : "/"}>
              <div className="flex items-center space-x-3 cursor-pointer hover:scale-105 transition-transform">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <HandHeart className="text-white" size={20} />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">ShareHeart</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <span
                    className={`text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer font-medium ${
                      location === link.href ? "text-red-600 dark:text-red-400 font-semibold" : ""
                    }`}
                  >
                    {link.label}
                  </span>
                </Link>
              ))}
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  {/* Points Badge */}
                  <Badge variant="secondary" className="hidden sm:flex bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                    {(user as any)?.points || 0} points
                  </Badge>

                  {/* Notifications */}
                  <Button variant="ghost" size="sm" className="relative hover:bg-red-100 dark:hover:bg-red-900">
                    <Bell size={20} />
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-red-500">
                      3
                    </Badge>
                  </Button>

                  {/* Post Item Button */}
                  <Button
                    onClick={() => setShowPostModal(true)}
                    size="sm"
                    className="hidden sm:inline-flex bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-lg"
                  >
                    <Plus size={16} className="mr-2" />
                    Post Item
                  </Button>

                  {/* User Menu */}
                  <div className="flex items-center space-x-2">
                    {user?.profileImageUrl ? (
                      <img
                        src={user.profileImageUrl}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <User className="text-white" size={16} />
                      </div>
                    )}
                    <span className="hidden sm:block text-sm font-medium">
                      {user?.firstName || "User"}
                    </span>
                  </div>

                  {/* Logout */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = "/api/logout"}
                    className="hidden sm:inline-flex"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => setShowPostModal(true)}
                    size="sm"
                    className="hidden sm:inline-flex bg-secondary hover:bg-secondary/90"
                  >
                    <Plus size={16} className="mr-2" />
                    Post Item
                  </Button>
                  <Button
                    onClick={() => setShowAuthModal(true)}
                    size="sm"
                    className="bg-primary hover:bg-primary/90"
                  >
                    <User size={16} className="mr-2" />
                    Login
                  </Button>
                </>
              )}

              {/* Mobile Menu */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="md:hidden">
                    <Menu size={20} />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="flex flex-col space-y-4 mt-8">
                    {isAuthenticated ? (
                      <>
                        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                          {user?.profileImageUrl ? (
                            <img
                              src={user.profileImageUrl}
                              alt="Profile"
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                              <User className="text-white" size={20} />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{user?.firstName || "User"}</p>
                            <Badge variant="secondary" className="mt-1">
                              {user?.points || 0} points
                            </Badge>
                          </div>
                        </div>

                        {userNavLinks.map((link) => {
                          const Icon = link.icon;
                          return (
                            <Link key={link.href} href={link.href}>
                              <div
                                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer"
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                <Icon size={20} />
                                <span>{link.label}</span>
                              </div>
                            </Link>
                          );
                        })}

                        <Button
                          onClick={() => setShowPostModal(true)}
                          className="bg-secondary hover:bg-secondary/90 mt-4"
                        >
                          <Plus size={16} className="mr-2" />
                          Post Item
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() => window.location.href = "/api/logout"}
                          className="mt-2"
                        >
                          Logout
                        </Button>
                      </>
                    ) : (
                      <>
                        {navLinks.map((link) => (
                          <Link key={link.href} href={link.href}>
                            <div
                              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <link.icon size={20} />
                              <span>{link.label}</span>
                            </div>
                          </Link>
                        ))}
                        <Button
                          onClick={() => {
                            setShowAuthModal(true);
                            setIsMobileMenuOpen(false);
                          }}
                          className="bg-primary hover:bg-primary/90 mt-4"
                        >
                          <User size={16} className="mr-2" />
                          Login / Sign Up
                        </Button>
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
      <PostItemModal open={showPostModal} onOpenChange={setShowPostModal} />
    </>
  );
}
