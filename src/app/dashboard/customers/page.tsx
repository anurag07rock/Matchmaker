'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Search, 
  SlidersHorizontal, 
  ArrowUpDown, 
  ChevronRight, 
  FilterX, 
  UserPlus, 
  Eye, 
  MapPin,
  ChevronLeft,
  DollarSign,
  X,
  Sparkles,
  Info,
  Save
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { parseIncomeToNumber } from '@/services/matching/matcher';
import { Customer, CustomerStatus, GenderType, MaritalStatusType } from '@/types/customer';

type SortOption = 'name-asc' | 'name-desc' | 'age-asc' | 'age-desc' | 'recent';

export default function CustomersPage() {
  const { customers, addCustomer } = useAppContext();

  // Advanced Filter states
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [maritalFilter, setMaritalFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [religionFilter, setReligionFilter] = useState<string>('all');
  
  // Range filters
  const [minAge, setMinAge] = useState<number>(18);
  const [maxAge, setMaxAge] = useState<number>(99);
  const [minIncome, setMinIncome] = useState<number>(0);
  
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [showFilters, setShowFilters] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [prevFilters, setPrevFilters] = useState('');
  const itemsPerPage = 10;

  // Onboarding modal state
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [onboardStep, setOnboardStep] = useState(1);

  // Onboard form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'female' as GenderType,
    age: 28,
    city: 'New York',
    country: 'USA',
    maritalStatus: 'single' as MaritalStatusType,
    dob: '1998-01-01',
    height: "5'5\"",
    religion: 'Non-religious',
    caste: 'N/A',
    motherTongue: 'English',
    languages: 'English',
    bio: '',
    occupation: 'Software Engineer',
    designation: 'Senior Developer',
    company: 'Tech Corp',
    college: 'State University',
    degree: 'B.S. in Computer Science',
    income: '$120,000 / year',
    familyType: 'nuclear',
    siblings: '1 sibling',
    hobbies: 'Hiking, Reading',
    interests: 'Technology, Specialty Coffee',
    diet: 'non-veg',
    smoking: 'no',
    drinking: 'socially',
    openToRelocate: 'open',
    openToPets: 'yes',
    hasChildren: false,
    wantsChildren: 'open',
    wantKids: 'open',
    prefGenders: 'male',
    prefMinAge: 25,
    prefMaxAge: 35,
    prefLocations: 'New York',
    dealbreakers: 'smoker'
  });

  // Extract unique cities & religions dynamically to avoid hardcoded UI data
  const uniqueCities = useMemo(() => {
    const cities = customers.map(c => c.city);
    return Array.from(new Set(cities)).sort();
  }, [customers]);

  const uniqueReligions = useMemo(() => {
    const religions = customers.map(c => c.religion).filter(Boolean) as string[];
    return Array.from(new Set(religions)).sort();
  }, [customers]);

  // Filtered & Sorted list
  const filteredCustomers = useMemo(() => {
    let result = [...customers];

    // Global Search match
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.firstName.toLowerCase().includes(q) ||
          c.lastName.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.country.toLowerCase().includes(q) ||
          c.occupation?.toLowerCase().includes(q) ||
          c.religion?.toLowerCase().includes(q) ||
          c.maritalStatus.toLowerCase().includes(q) ||
          c.hobbies.some(h => h.toLowerCase().includes(q)) ||
          c.interests.some(i => i.toLowerCase().includes(q))
      );
    }

    // Gender filter
    if (genderFilter !== 'all') {
      result = result.filter((c) => c.gender === genderFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((c) => c.status === statusFilter);
    }

    // Marital status filter
    if (maritalFilter !== 'all') {
      result = result.filter((c) => c.maritalStatus === maritalFilter);
    }

    // City filter
    if (cityFilter !== 'all') {
      result = result.filter((c) => c.city === cityFilter);
    }

    // Religion filter
    if (religionFilter !== 'all') {
      result = result.filter((c) => c.religion === religionFilter);
    }

    // Age bounds filter
    result = result.filter((c) => c.age >= minAge && c.age <= maxAge);

    // Income bounds filter
    if (minIncome > 0) {
      result = result.filter((c) => parseIncomeToNumber(c.income) >= minIncome);
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        case 'name-desc':
          return `${b.firstName} ${b.lastName}`.localeCompare(`${a.firstName} ${a.lastName}`);
        case 'age-asc':
          return a.age - b.age;
        case 'age-desc':
          return b.age - a.age;
        case 'recent':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return result;
  }, [customers, search, genderFilter, statusFilter, maritalFilter, cityFilter, religionFilter, minAge, maxAge, minIncome, sortBy]);

  // Reset pagination when filter changes
  const currentFiltersKey = `${search}-${genderFilter}-${statusFilter}-${maritalFilter}-${cityFilter}-${religionFilter}-${minAge}-${maxAge}-${minIncome}-${sortBy}`;
  if (prevFilters !== currentFiltersKey) {
    setPrevFilters(currentFiltersKey);
    setCurrentPage(1);
  }

  // Pagination calculation
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage) || 1;
  const paginatedCustomers = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredCustomers.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredCustomers, currentPage]);

  const clearFilters = () => {
    setSearch('');
    setGenderFilter('all');
    setStatusFilter('all');
    setMaritalFilter('all');
    setCityFilter('all');
    setReligionFilter('all');
    setMinAge(18);
    setMaxAge(99);
    setMinIncome(0);
    setSortBy('recent');
    setCurrentPage(1);
  };

  const hasActiveFilters = 
    search || genderFilter !== 'all' || statusFilter !== 'all' || 
    maritalFilter !== 'all' || cityFilter !== 'all' || religionFilter !== 'all' || 
    minAge !== 18 || maxAge !== 99 || minIncome !== 0;

  // Onboard form submit handler
  const handleOnboardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Compute age from DOB if the age field wasn't properly filled
    let computedAge = Number(formData.age);
    if (!computedAge || computedAge < 18) {
      try {
        const dob = new Date(formData.dob);
        const today = new Date();
        computedAge = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
          computedAge--;
        }
        computedAge = Math.max(18, computedAge);
      } catch {
        computedAge = 28;
      }
    }
    
    // Construct customer payload
    const finalCustomerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'> = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      status: 'active' as CustomerStatus,
      gender: formData.gender,
      age: computedAge,
      city: formData.city,
      country: formData.country,
      maritalStatus: formData.maritalStatus,
      dob: formData.dob,
      height: formData.height,
      religion: formData.religion,
      caste: formData.caste,
      motherTongue: formData.motherTongue,
      languages: formData.languages.split(',').map(l => l.trim()),
      bio: formData.bio || `Hi, I'm ${formData.firstName}. I work in ${formData.city} and value connection, growth, and sharing adventures.`,
      occupation: formData.occupation,
      designation: formData.designation,
      company: formData.company,
      college: formData.college,
      degree: formData.degree,
      income: formData.income,
      familyType: formData.familyType,
      siblings: formData.siblings,
      hobbies: formData.hobbies.split(',').map(h => h.trim()),
      interests: formData.interests.split(',').map(i => i.trim()),
      diet: formData.diet,
      smoking: formData.smoking,
      drinking: formData.drinking,
      openToRelocate: formData.openToRelocate,
      openToPets: formData.openToPets,
      hasChildren: formData.hasChildren,
      wantsChildren: formData.wantsChildren as 'yes' | 'no' | 'open',
      wantKids: formData.wantKids as 'yes' | 'no' | 'open',
      avatarUrl: `https://images.unsplash.com/photo-${formData.gender === 'male' ? '1500648767791-00dcc994a43e' : '1494790108377-be9c29b29330'}?w=150`,
      matchPreferences: {
        genders: formData.prefGenders.split(',').map(g => g.trim() as any),
        ageRange: { min: Number(formData.prefMinAge), max: Number(formData.prefMaxAge) },
        locations: formData.prefLocations.split(',').map(l => l.trim()),
        dealbreakers: formData.dealbreakers ? formData.dealbreakers.split(',').map(d => d.trim()) : []
      },
      internalNotes: [JSON.stringify({
        id: `note_onboard_${Date.now()}`,
        text: 'Client onboarded today. Profile verified and active in matchmaking pool.',
        createdAt: new Date().toISOString(),
        author: 'Maggie Crew (Senior Matchmaker)'
      })]
    };

    addCustomer(finalCustomerData);
    
    // Reset and close
    setShowOnboardModal(false);
    setOnboardStep(1);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      gender: 'female',
      age: 28,
      city: 'New York',
      country: 'USA',
      maritalStatus: 'single',
      dob: '1998-01-01',
      height: "5'5\"",
      religion: 'Non-religious',
      caste: 'N/A',
      motherTongue: 'English',
      languages: 'English',
      bio: '',
      occupation: 'Software Engineer',
      designation: 'Senior Developer',
      company: 'Tech Corp',
      college: 'State University',
      degree: 'B.S. in Computer Science',
      income: '$120,000 / year',
      familyType: 'nuclear',
      siblings: '1 sibling',
      hobbies: 'Hiking, Reading',
      interests: 'Technology, Specialty Coffee',
      diet: 'non-veg',
      smoking: 'no',
      drinking: 'socially',
      openToRelocate: 'open',
      openToPets: 'yes',
      hasChildren: false,
      wantsChildren: 'open',
      wantKids: 'open',
      prefGenders: 'male',
      prefMinAge: 25,
      prefMaxAge: 35,
      prefLocations: 'New York',
      dealbreakers: 'smoker'
    });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
            Customer Directory
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Manage your profiles, analyze preferences, and coordinate match recommendations.
          </p>
        </div>
        <button
          onClick={() => setShowOnboardModal(true)}
          className="self-start sm:self-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold active:scale-[0.98] transition-all shadow-md shadow-rose-950/20 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          Onboard Client
        </button>
      </div>

      {/* Control Panel: Search & Filter Toggles */}
      <div className="glass-panel rounded-2xl p-5 border-zinc-800/80 space-y-4 shadow-md">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Global Search Bar */}
          <div className="relative w-full md:flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Global Search (name, city, religion, occupation, hobbies...)"
              className="w-full pl-10 pr-4 py-2 bg-zinc-900/40 border border-zinc-800/60 rounded-xl text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500/50 text-sm transition-all"
            />
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-4 py-2 border rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                showFilters || hasActiveFilters
                  ? 'border-rose-500/30 bg-rose-500/10 text-rose-400'
                  : 'border-zinc-800/80 bg-zinc-900/30 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Advanced Filters
              {hasActiveFilters && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              )}
            </button>

            <div className="relative flex-1 md:flex-none">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500 pointer-events-none">
                <ArrowUpDown className="w-3.5 h-3.5" />
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full md:w-44 pl-9 pr-8 py-2 bg-zinc-900/30 border border-zinc-800/80 rounded-xl text-zinc-400 focus:text-zinc-200 hover:bg-zinc-900/50 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500/50 text-xs transition-all appearance-none cursor-pointer"
              >
                <option value="recent">Recently Updated</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
                <option value="age-asc">Age: Youngest First</option>
                <option value="age-desc">Age: Oldest First</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-500">
                <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="p-2 border border-zinc-800/80 hover:border-zinc-700 rounded-xl text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                title="Clear all filters"
              >
                <FilterX className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Advanced Filters Section */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 pt-4 border-t border-zinc-900/60 animate-fadeIn">
            {/* City Selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                City Location
              </label>
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="w-full px-3 py-1.5 bg-zinc-900/40 border border-zinc-800/60 rounded-lg text-zinc-300 focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs cursor-pointer"
              >
                <option value="all">All Cities</option>
                {uniqueCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Religion Selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Religion</label>
              <select
                value={religionFilter}
                onChange={(e) => setReligionFilter(e.target.value)}
                className="w-full px-3 py-1.5 bg-zinc-900/40 border border-zinc-800/60 rounded-lg text-zinc-300 focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs cursor-pointer"
              >
                <option value="all">All Religions</option>
                {uniqueReligions.map(rel => (
                  <option key={rel} value={rel}>{rel}</option>
                ))}
              </select>
            </div>

            {/* Marital Status Selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Marital Status</label>
              <select
                value={maritalFilter}
                onChange={(e) => setMaritalFilter(e.target.value)}
                className="w-full px-3 py-1.5 bg-zinc-900/40 border border-zinc-800/60 rounded-lg text-zinc-300 focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs cursor-pointer"
              >
                <option value="all">All Marital Statuses</option>
                <option value="single">Single</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
                <option value="separated">Separated</option>
              </select>
            </div>

            {/* Gender Selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Gender</label>
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="w-full px-3 py-1.5 bg-zinc-900/40 border border-zinc-800/60 rounded-lg text-zinc-300 focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs cursor-pointer"
              >
                <option value="all">All Genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
              </select>
            </div>

            {/* Age Range Slider Controls */}
            <div className="space-y-2 col-span-1 sm:col-span-2">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                <span>Age Range Bracket</span>
                <span className="text-rose-400 font-semibold">{minAge} – {maxAge} years</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="18"
                  max="99"
                  value={minAge}
                  onChange={(e) => setMinAge(Math.min(maxAge - 1, Number(e.target.value)))}
                  className="w-full accent-rose-500 bg-zinc-900 border border-zinc-800 h-1 rounded-lg cursor-pointer"
                />
                <input
                  type="range"
                  min="18"
                  max="99"
                  value={maxAge}
                  onChange={(e) => setMaxAge(Math.max(minAge + 1, Number(e.target.value)))}
                  className="w-full accent-rose-500 bg-zinc-900 border border-zinc-800 h-1 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Income Range Selection */}
            <div className="space-y-1.5 col-span-1 sm:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" />
                Minimum Annual Income
              </label>
              <select
                value={minIncome}
                onChange={(e) => setMinIncome(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-zinc-900/40 border border-zinc-800/60 rounded-lg text-zinc-300 focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs cursor-pointer"
              >
                <option value="0">All Income Brackets</option>
                <option value="60000">$60,000+ / year</option>
                <option value="100000">$100,000+ / year</option>
                <option value="150000">$150,000+ / year</option>
                <option value="200000">$200,000+ / year</option>
                <option value="300000">$300,000+ / year</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Directory Count */}
      <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
        <span>
          Showing <strong className="text-zinc-300">{Math.min(filteredCustomers.length, (currentPage - 1) * itemsPerPage + 1)}</strong> to <strong className="text-zinc-300">{Math.min(filteredCustomers.length, currentPage * itemsPerPage)}</strong> of <strong className="text-zinc-300">{filteredCustomers.length}</strong> matching profiles
        </span>
      </div>

      {/* Empty States for Search results */}
      {paginatedCustomers.length > 0 ? (
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl border-zinc-800/60 overflow-hidden shadow-md">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-900 bg-zinc-950/45 text-zinc-400 font-medium">
                    <th className="py-4 px-6">Client Profile</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Demographics</th>
                    <th className="py-4 px-6">Location</th>
                    <th className="py-4 px-6">Religion</th>
                    <th className="py-4 px-6">Income Bracket</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 bg-transparent">
                  {paginatedCustomers.map((client) => (
                    <tr 
                      key={client.id}
                      className="hover:bg-zinc-900/30 transition-colors group cursor-pointer"
                      onClick={(e) => {
                        // Avoid triggering navigation on action button click
                        const target = e.target as HTMLElement;
                        if (!target.closest('a') && !target.closest('button')) {
                          window.location.href = `/dashboard/customers/${client.id}`;
                        }
                      }}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700/60 overflow-hidden relative">
                            <Image
                              src={client.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                              alt={`${client.firstName} ${client.lastName}`}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-zinc-200 group-hover:text-rose-400 transition-colors">
                              {client.firstName} {client.lastName}
                            </p>
                            <p className="text-xs text-zinc-500 mt-0.5 truncate max-w-[160px]">
                              {client.designation || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${
                          client.status === 'active' 
                            ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                            : client.status === 'paused'
                            ? 'bg-amber-100 border-amber-300 text-amber-700'
                            : client.status === 'matched'
                            ? 'bg-rose-100 border-rose-300 text-rose-700'
                            : 'bg-zinc-100 border-zinc-300 text-zinc-600'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            client.status === 'active' 
                              ? 'bg-emerald-500'
                              : client.status === 'paused'
                              ? 'bg-amber-500'
                              : client.status === 'matched'
                              ? 'bg-rose-500'
                              : 'bg-zinc-400'
                          }`} />
                          {client.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-zinc-300 capitalize">
                        {client.gender} • {client.age} yrs • {client.height}
                      </td>
                      <td className="py-4 px-6 text-zinc-300">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                          <span>{client.city}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-zinc-400 capitalize">
                        {client.religion || 'N/A'}
                      </td>
                      <td className="py-4 px-6 text-zinc-400 font-mono text-xs">
                        {client.income}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/dashboard/customers/${client.id}`}
                          className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-zinc-900 border border-zinc-800/80 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-zinc-100 rounded-lg text-xs font-medium transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Profile
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="block md:hidden divide-y divide-zinc-900 bg-transparent">
              {paginatedCustomers.map((client) => (
                <div 
                  key={client.id}
                  className="p-4 flex flex-col gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden relative shrink-0">
                      <Image
                        src={client.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                        alt={`${client.firstName} ${client.lastName}`}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-zinc-200">
                          {client.firstName} {client.lastName}
                        </p>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border capitalize ${
                          client.status === 'active' 
                            ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                            : client.status === 'paused'
                            ? 'bg-amber-100 border-amber-300 text-amber-700'
                            : client.status === 'matched'
                            ? 'bg-rose-100 border-rose-300 text-rose-700'
                            : 'bg-zinc-100 border-zinc-300 text-zinc-600'
                        }`}>
                          {client.status}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5 truncate">
                        {client.designation || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-zinc-900/20 border border-zinc-900/60 p-2.5 rounded-xl text-zinc-400">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider text-zinc-500">Gender / Age</span>
                      <span className="text-zinc-300 font-medium capitalize">{client.gender} • {client.age} yrs</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider text-zinc-500">Location</span>
                      <span className="text-zinc-300 font-medium truncate">{client.city}</span>
                    </div>
                    <div className="flex flex-col mt-1.5">
                      <span className="text-[10px] uppercase tracking-wider text-zinc-500">Religion / Income</span>
                      <span className="text-zinc-300 font-medium truncate">{client.religion || 'N/A'} • {client.income}</span>
                    </div>
                    <div className="flex flex-col mt-1.5 justify-end">
                      <Link
                        href={`/dashboard/customers/${client.id}`}
                        className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 rounded-lg text-xs font-semibold transition-all"
                      >
                        View Profile
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 pt-2">
              <span className="text-xs text-zinc-500">
                Page <strong className="text-zinc-300">{currentPage}</strong> of <strong className="text-zinc-300">{totalPages}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center justify-center p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                  let pageNum = idx + 1;
                  if (currentPage > 3 && totalPages > 5) {
                    if (currentPage + 2 > totalPages) {
                      pageNum = totalPages - 4 + idx;
                    } else {
                      pageNum = currentPage - 2 + idx;
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        currentPage === pageNum
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-250 hover:border-zinc-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center justify-center p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="glass-panel rounded-2xl p-12 text-center border-zinc-800/60 flex flex-col items-center justify-center space-y-4 shadow-inner animate-fadeIn">
          <div className="p-4 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500">
            <FilterX className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-300">No customers found</h3>
            <p className="text-sm text-zinc-500 max-w-sm mt-1">
              No registered profiles match the selected filters. Try broadening your keywords or adjusting sliders.
            </p>
          </div>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-zinc-200 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Onboard Client Modal Form */}
      {showOnboardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setShowOnboardModal(false)}
            className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md transition-opacity duration-300" 
          />

          <div className="glass-panel w-full max-w-3xl rounded-2xl border-zinc-800/80 shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[90vh] animate-scaleIn">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose-500/20 to-transparent" />
            
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-900 bg-zinc-950/45 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-rose-400" />
                <span className="font-bold text-zinc-100 text-sm tracking-tight">Onboard New Customer Profile</span>
              </div>
              <button
                onClick={() => setShowOnboardModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Steps Indicators */}
            <div className="px-6 py-3.5 bg-zinc-900/20 border-b border-zinc-900/60 flex items-center justify-center gap-8 text-[11px] font-semibold text-zinc-500 select-none">
              <div className={`flex items-center gap-1.5 transition-colors ${onboardStep === 1 ? 'text-rose-400 font-bold' : onboardStep > 1 ? 'text-zinc-300' : ''}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center border text-[9px] ${onboardStep === 1 ? 'border-rose-500/40 bg-rose-500/10' : onboardStep > 1 ? 'border-zinc-700 bg-zinc-800' : 'border-zinc-800'}`}>1</span>
                Personal Biodata
              </div>
              <div className="h-px w-8 bg-zinc-900" />
              <div className={`flex items-center gap-1.5 transition-colors ${onboardStep === 2 ? 'text-rose-400 font-bold' : onboardStep > 2 ? 'text-zinc-300' : ''}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center border text-[9px] ${onboardStep === 2 ? 'border-rose-500/40 bg-rose-500/10' : onboardStep > 2 ? 'border-zinc-700 bg-zinc-800' : 'border-zinc-800'}`}>2</span>
                Career & Family
              </div>
              <div className="h-px w-8 bg-zinc-900" />
              <div className={`flex items-center gap-1.5 transition-colors ${onboardStep === 3 ? 'text-rose-400 font-bold' : ''}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center border text-[9px] ${onboardStep === 3 ? 'border-rose-500/40 bg-rose-500/10' : 'border-zinc-805'}`}>3</span>
                Lifestyle & Preferences
              </div>
            </div>

            {/* Scrollable Form Content */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-zinc-950/20 text-xs">
              
              {/* Step 1: Personal Biodata */}
              {onboardStep === 1 && (
                <div className="space-y-4.5 animate-fadeIn">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-300">First Name</label>
                      <input type="text" name="firstName" required value={formData.firstName} onChange={handleFormChange} placeholder="e.g. Liam" className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800 rounded-xl text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-300">Last Name</label>
                      <input type="text" name="lastName" required value={formData.lastName} onChange={handleFormChange} placeholder="e.g. Neeson" className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800 rounded-xl text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-300">Email Address</label>
                      <input type="email" name="email" required value={formData.email} onChange={handleFormChange} placeholder="name@domain.com" className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800 rounded-xl text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-300">Phone Number</label>
                      <input type="text" name="phone" required value={formData.phone} onChange={handleFormChange} placeholder="555-0199" className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800 rounded-xl text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-300">Gender</label>
                      <select name="gender" value={formData.gender} onChange={handleFormChange} className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800 rounded-xl text-zinc-300 focus:ring-1 focus:ring-rose-500 text-xs">
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                        <option value="non-binary">Non-Binary</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-300">Age</label>
                      <input type="number" min="18" max="90" name="age" value={formData.age} onChange={handleFormChange} className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-300">Date of Birth</label>
                      <input type="date" name="dob" value={formData.dob} onChange={handleFormChange} className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-300">City</label>
                      <input type="text" name="city" value={formData.city} onChange={handleFormChange} placeholder="New York" className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-300">Height</label>
                      <input type="text" name="height" value={formData.height} onChange={handleFormChange} placeholder="5'11" className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-300">Marital Status</label>
                      <select name="maritalStatus" value={formData.maritalStatus} onChange={handleFormChange} className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800 rounded-xl text-zinc-300 focus:ring-1 focus:ring-rose-500 text-xs">
                        <option value="single">Single</option>
                        <option value="divorced">Divorced</option>
                        <option value="widowed">Widowed</option>
                        <option value="separated">Separated</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-300">Religion</label>
                      <input type="text" name="religion" value={formData.religion} onChange={handleFormChange} placeholder="e.g. Christian" className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-300">Caste / Community</label>
                      <input type="text" name="caste" value={formData.caste} onChange={handleFormChange} placeholder="N/A" className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-300">Mother Tongue</label>
                      <input type="text" name="motherTongue" value={formData.motherTongue} onChange={handleFormChange} placeholder="English" className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-300">Bio Summary Description</label>
                    <textarea name="bio" rows={3} value={formData.bio} onChange={handleFormChange} placeholder="Write a short summary about the client's personality, goals, and who they are seeking..." className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800 rounded-xl text-zinc-200 placeholder-zinc-650 focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs resize-none" />
                  </div>
                </div>
              )}

              {/* Step 2: Career & Family */}
              {onboardStep === 2 && (
                <div className="space-y-4.5 animate-fadeIn">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-300">Occupation Domain</label>
                      <input type="text" name="occupation" value={formData.occupation} onChange={handleFormChange} placeholder="Software Engineer" className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-300">Designation / Title</label>
                      <input type="text" name="designation" value={formData.designation} onChange={handleFormChange} placeholder="Senior Developer" className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-300">Company / Employer</label>
                      <input type="text" name="company" value={formData.company} onChange={handleFormChange} placeholder="Google" className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-300">Annual Income Bracket</label>
                      <input type="text" name="income" value={formData.income} onChange={handleFormChange} placeholder="$120,000 / year" className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-300">College / University</label>
                      <input type="text" name="college" value={formData.college} onChange={handleFormChange} placeholder="Stanford University" className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-300">Degree Completed</label>
                      <input type="text" name="degree" value={formData.degree} onChange={handleFormChange} placeholder="M.S. in Computer Science" className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 border-t border-zinc-900 pt-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-300">Family Structure</label>
                      <select name="familyType" value={formData.familyType} onChange={handleFormChange} className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800 rounded-xl text-zinc-350 focus:ring-1 focus:ring-rose-500 text-xs">
                        <option value="nuclear">Nuclear Family</option>
                        <option value="joint">Joint Family</option>
                        <option value="extended">Extended Family</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-300">Sibling Details</label>
                      <input type="text" name="siblings" value={formData.siblings} onChange={handleFormChange} placeholder="e.g. 1 brother, 1 sister" className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs" />
                    </div>
                    <div className="space-y-1.5 flex flex-col justify-end">
                      <label className="flex items-center gap-2 text-zinc-300 font-semibold cursor-pointer pb-2">
                        <input type="checkbox" name="hasChildren" checked={formData.hasChildren} onChange={handleFormChange} className="rounded accent-rose-500 bg-zinc-900 border-zinc-800 w-4 h-4 cursor-pointer" />
                        Has Kids / Children
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Lifestyle & Preferences */}
              {onboardStep === 3 && (
                <div className="space-y-4.5 animate-fadeIn">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-300">Dietary Habits</label>
                      <select name="diet" value={formData.diet} onChange={handleFormChange} className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800 rounded-xl text-zinc-300 focus:ring-1 focus:ring-rose-500 text-xs">
                        <option value="non-veg">Non-Vegetarian</option>
                        <option value="veg">Vegetarian</option>
                        <option value="vegan">Vegan</option>
                        <option value="halal">Halal</option>
                        <option value="kosher">Kosher</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-300">Smoking</label>
                      <select name="smoking" value={formData.smoking} onChange={handleFormChange} className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800 rounded-xl text-zinc-300 focus:ring-1 focus:ring-rose-500 text-xs">
                        <option value="no">Non-Smoker</option>
                        <option value="yes">Smoker</option>
                        <option value="occasionally">Occasionally</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-300">Drinking</label>
                      <select name="drinking" value={formData.drinking} onChange={handleFormChange} className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800 rounded-xl text-zinc-300 focus:ring-1 focus:ring-rose-500 text-xs">
                        <option value="socially">Social Drinker</option>
                        <option value="no">Dry / No Alcohol</option>
                        <option value="yes">Yes</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-300">Open to Relocation</label>
                      <select name="openToRelocate" value={String(formData.openToRelocate)} onChange={handleFormChange} className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800 rounded-xl text-zinc-300 focus:ring-1 focus:ring-rose-500 text-xs">
                        <option value="open">Yes / Open to relocation</option>
                        <option value="no">No / Wants to stay local</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-300">Open to Pets</label>
                      <select name="openToPets" value={String(formData.openToPets)} onChange={handleFormChange} className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800 rounded-xl text-zinc-300 focus:ring-1 focus:ring-rose-500 text-xs">
                        <option value="yes">Yes / Loves pets</option>
                        <option value="no">No pets</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-300">Hobbies (Comma Separated)</label>
                      <input type="text" name="hobbies" value={formData.hobbies} onChange={handleFormChange} placeholder="Hiking, Cooking, Photography" className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-300">Interests (Comma Separated)</label>
                      <input type="text" name="interests" value={formData.interests} onChange={handleFormChange} placeholder="Modern Art, Specialty Coffee" className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs" />
                    </div>
                  </div>

                  {/* Matching Rules/Preferences Sub-form */}
                  <div className="border-t border-zinc-900 pt-4 space-y-4">
                    <h4 className="font-bold text-rose-400 text-xs flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 animate-pulse" />
                      Partner Matching Criteria
                    </h4>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="font-semibold text-zinc-300">Preferred Genders</label>
                        <input type="text" name="prefGenders" value={formData.prefGenders} onChange={handleFormChange} placeholder="female (or: male, non-binary)" className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs" />
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-zinc-300">Min Partner Age</label>
                        <input type="number" name="prefMinAge" value={formData.prefMinAge} onChange={handleFormChange} className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs" />
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-zinc-300">Max Partner Age</label>
                        <input type="number" name="prefMaxAge" value={formData.prefMaxAge} onChange={handleFormChange} className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="font-semibold text-zinc-300">Preferred Locations (Comma separated)</label>
                        <input type="text" name="prefLocations" value={formData.prefLocations} onChange={handleFormChange} placeholder="New York, Brooklyn" className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs" />
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-zinc-300">Non-Negotiable Dealbreakers</label>
                        <input type="text" name="dealbreakers" value={formData.dealbreakers} onChange={handleFormChange} placeholder="smoker, no pets" className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer Controls */}
            <div className="p-5 border-t border-zinc-900 bg-zinc-950/30 flex items-center justify-between">
              <span className="text-[10px] text-zinc-500 font-medium flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-zinc-600" />
                Double check inputs before onboarding.
              </span>
              
              <div className="flex gap-2">
                {onboardStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setOnboardStep(prev => prev - 1)}
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-zinc-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                )}
                
                {onboardStep < 3 ? (
                  <button
                    type="button"
                    onClick={() => setOnboardStep(prev => prev + 1)}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-md active:scale-[0.98] transition-colors cursor-pointer"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleOnboardSubmit}
                    className="px-5 py-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl text-xs font-bold shadow-md active:scale-[0.98] transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Onboard Client
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
