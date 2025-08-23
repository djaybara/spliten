// src/components/Navbar.tsx
'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, User, Briefcase, Search, MessageSquare, Bell } from 'lucide-react'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false) // Pour demo, à connecter avec auth plus tard

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo et navigation principale */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Briefcase className="h-8 w-8 text-blue-600 mr-2" />
              <span className="font-bold text-xl text-gray-900">ProConnect</span>
            </Link>

            {/* Navigation desktop */}
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <Link href="/recherche" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                Trouver un projet
              </Link>
              <Link href="/talents" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                Trouver des talents
              </Link>
              <Link href="/comment-ca-marche" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                Comment ça marche
              </Link>
            </div>
          </div>

          {/* Actions à droite */}
          <div className="flex items-center space-x-4">
            {/* Barre de recherche desktop */}
            <div className="hidden md:flex items-center">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {!isLoggedIn ? (
              <div className="hidden md:flex items-center space-x-3">
                <Link href="/connexion" className="text-gray-700 hover:text-blue-600 px-4 py-2 text-sm font-medium">
                  Se connecter
                </Link>
                <Link href="/inscription" className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  S'inscrire
                </Link>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <button className="text-gray-500 hover:text-gray-700 relative">
                  <MessageSquare className="h-6 w-6" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                </button>
                <button className="text-gray-500 hover:text-gray-700 relative">
                  <Bell className="h-6 w-6" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                </button>
                <Link href="/profil" className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                </Link>
              </div>
            )}

            {/* Menu mobile */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-700 hover:text-blue-600"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Menu mobile déroulant */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-3">
              <Link href="/recherche" className="text-gray-700 hover:text-blue-600 px-3 py-2">
                Trouver un projet
              </Link>
              <Link href="/talents" className="text-gray-700 hover:text-blue-600 px-3 py-2">
                Trouver des talents
              </Link>
              <Link href="/comment-ca-marche" className="text-gray-700 hover:text-blue-600 px-3 py-2">
                Comment ça marche
              </Link>
              <div className="border-t pt-3">
                {!isLoggedIn ? (
                  <>
                    <Link href="/connexion" className="block text-gray-700 hover:text-blue-600 px-3 py-2">
                      Se connecter
                    </Link>
                    <Link href="/inscription" className="block bg-blue-600 text-white text-center mx-3 py-2 rounded-lg mt-2">
                      S'inscrire
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/messages" className="block text-gray-700 hover:text-blue-600 px-3 py-2">
                      Messages
                    </Link>
                    <Link href="/notifications" className="block text-gray-700 hover:text-blue-600 px-3 py-2">
                      Notifications
                    </Link>
                    <Link href="/profil" className="block text-gray-700 hover:text-blue-600 px-3 py-2">
                      Mon profil
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}