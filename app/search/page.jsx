'use client';

import { useState, useEffect, useRef } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import Link from 'next/link';
import Image from 'next/image';
import { MagnifyingGlassIcon, XMarkIcon, ArrowUpRightIcon } from '@heroicons/react/24/outline';

const toSlug = (str) =>
  str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

const SUGGESTIONS = [
  "Sourdough Bread",
  "Chocolate Cake",
  "strawberry cream pastry",
  "blueberry cheesecake slice",
  "Red Velvet Cake",
  "Blueberry Muffin",
  "Almond Biscotti",
  "Multigrain Loaf",
  "Cheese Danish",
  "Walnut Brownie",
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [allItems, setAllItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    // Fetch all bakery items once
    const fetchItems = async () => {
      try {
        const snap = await getDocs(collection(db, 'bakeryItems'));
        const items = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAllItems(items);
      } catch (e) {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setFiltered([]);
      return;
    }
    const q = query.toLowerCase();
    setFiltered(
      allItems.filter(
        (item) =>
          item.name?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q)
      )
    );
  }, [query, allItems]);

  // For accessibility: keyboard navigation on suggestions
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <main className="min-h-screen bg-gradient-to-tr from-green-50 via-white to-green-100 py-12 px-0">
      <div className="flex flex-col md:flex-row max-w-7xl mx-auto">
        {/* Left Side Visual/Info */}
        <aside className="hidden md:flex flex-col items-center justify-center w-1/3 pr-6 py-12">
          <div className="mb-8 w-full">
            <Image
              src="https://cdn.pixabay.com/photo/2016/12/11/20/01/coffee-1900194_1280.jpg"
              alt="Bakery Visual"
              width={340}
              height={340}
              className="rounded-3xl shadow-2xl object-cover w-full"
            />
          </div>
          <div className="text-center text-green-800 font-semibold text-xl mb-2">
            Welcome to Toshan Bakery Search
          </div>
          <div className="text-gray-500 text-base mb-1">
            Find your favorite breads, cakes, pastries and more.
          </div>
          <div className="rounded-full inline-block bg-green-100 text-green-800 px-4 py-1 mt-3 font-medium text-sm shadow">
            100% Fresh, Everyday!
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 w-full md:w-2/3 px-4 md:px-0">
          <div className="flex flex-col items-center justify-center mb-8 pt-6">
            <h1 className="text-3xl md:text-4xl font-bold text-green-800 mb-3 tracking-tight text-center">
              Search Our Bakery Items
            </h1>
            <p className="text-gray-500 text-center max-w-lg">
              Discover fresh breads, cakes, pastries and more. Start typing to find your favorite treat!
            </p>
          </div>
          <form
            onSubmit={e => e.preventDefault()}
            className="mb-10 relative"
            autoComplete="off"
          >
            <div className="flex items-center bg-white/90 rounded-full shadow-xl px-6 py-3 border-2 border-green-200 focus-within:ring-2 focus-within:ring-green-400 transition-all duration-200 backdrop-blur-md">
              <MagnifyingGlassIcon className="w-6 h-6 text-green-600 mr-2" />
              <input
                ref={inputRef}
                className="flex-1 bg-transparent outline-none text-lg text-gray-800 placeholder-gray-400"
                type="text"
                name="search"
                placeholder="Search by name or description…"
                value={query}
                onChange={e => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
                autoFocus
                spellCheck="false"
                aria-label="Search bakery items"
                autoComplete="off"
              />
              {query && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => {
                    setQuery('');
                    inputRef.current?.focus();
                  }}
                  className="ml-2 text-gray-400 hover:text-green-600 transition"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              )}
            </div>
            {/* Suggestions Dropdown */}
            {showSuggestions && !loading && (
              <div className="absolute left-0 right-0 z-20 mt-2 bg-white rounded-xl shadow-xl border border-green-100 py-2 max-h-72 overflow-y-auto">
                {SUGGESTIONS.filter(s => s.toLowerCase().includes(query.toLowerCase())).length === 0 ? (
                  <div className="px-6 py-2 text-gray-400 text-sm">No suggestions found.</div>
                ) : (
                  SUGGESTIONS.filter(s => s.toLowerCase().includes(query.toLowerCase()))
                    .slice(0, 6)
                    .map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left px-6 py-2 hover:bg-green-50 focus:bg-green-100 text-green-800 font-medium flex items-center gap-2 transition"
                        tabIndex={0}
                      >
                        <MagnifyingGlassIcon className="w-4 h-4 text-green-400 mr-1" />
                        {suggestion}
                      </button>
                    ))
                )}
              </div>
            )}
          </form>

          {/* Search State Notifications */}
          {!query && !loading && (
            <div className="flex flex-col items-center mt-24 opacity-80 select-none">
              <MagnifyingGlassIcon className="w-12 h-12 text-green-200 mb-2" />
              <div className="text-green-900 font-semibold text-xl mb-2">
                Start typing to search bakery items
              </div>
              <div className="text-gray-400 mb-1 text-base flex flex-wrap gap-2 justify-center">
                <span>Try:</span>
                {SUGGESTIONS.slice(0, 5).map(s => (
                  <button
                    key={s}
                    onClick={() => handleSuggestionClick(s)}
                    className="bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium shadow-sm hover:bg-green-200 hover:text-green-900 transition"
                    tabIndex={0}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-20">
              <span className="text-green-700 font-medium animate-pulse">Loading...</span>
            </div>
          ) : (
            <>
              {filtered.length === 0 && query ? (
                <div className="text-center text-gray-500 mt-24">
                  <div className="inline-flex items-center gap-2 text-lg font-semibold">
                    <MagnifyingGlassIcon className="w-6 h-6 text-green-400" />
                    No items found matching <span className="text-green-800">{query}</span>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-2 justify-center">
                    <span className="text-gray-400">Suggestions:</span>
                    {SUGGESTIONS.slice(0, 4).map(s => (
                      <button
                        key={s}
                        onClick={() => handleSuggestionClick(s)}
                        className="bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium shadow-sm hover:bg-green-200 hover:text-green-900 transition"
                        tabIndex={0}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid gap-7 sm:grid-cols-2">
                  {filtered.map(item => {
                    const slug = item.slug && typeof item.slug === 'string'
                      ? item.slug
                      : toSlug(item.name || '');
                    return (
                      <Link
                        key={item.id}
                        href={`/product/${slug}`}
                        className="block group rounded-2xl bg-white border border-green-100 hover:shadow-2xl shadow-md transition-all duration-200 overflow-hidden hover:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400"
                      >
                        <div className="relative h-48 w-full overflow-hidden">
                          <Image
                            src={item.imageUrl || '/breads.jpg'}
                            alt={item.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                          <div className="absolute top-0 right-0 m-2 px-3 py-1 bg-green-600/90 text-white text-xs rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1">
                            View Item <ArrowUpRightIcon className="w-4 h-4" />
                          </div>
                        </div>
                        <div className="p-5">
                          <h3 className="text-lg font-semibold text-green-800 group-hover:text-green-600 transition-colors mb-1">
                            {item.name}
                          </h3>
                          <p className="text-gray-500 text-sm mb-2 line-clamp-2">{item.description}</p>
                          <div className="mt-3">
                            <span className="inline-block bg-green-100 text-green-800 font-semibold px-3 py-1 rounded-full text-[15px] shadow-sm">
                              ₹{item.price}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}