import { useState } from 'react';
import type { FormEvent } from 'react';
import Link from '@/lib/link';
import InterestPage from '@/legacy/components/InterestPage';
import { ChevronLeft } from 'lucide-react';
import { useNavigate, useSearch } from '@tanstack/react-router';

export default function SearchResultContent() {
    // Get the search query from URL parameters
    const query = useSearch({
        strict: false,
        select: (search) => typeof search.q === 'string' ? search.q : '',
    });

    return <SearchResults key={query} query={query} />;
}

function SearchResults({ query }: { query: string }) {
    const [searchValue, setSearchValue] = useState(query);
    const navigate = useNavigate();

    // Handle search in the results page
    const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (searchValue.trim()) {
            // Update the URL with the new search query
            void navigate({ to: '/search/result', search: { q: searchValue.trim() } });
        }
    };

    // Handle Enter key press
    // The form's native submit event handles Enter without a second navigation.

    return (
        <div className="">
            <div className="container mx-auto px-5 py-8 md:py-[52px] relative w-full overflow-hidden z-10">
                {/* Header */}
                <div className="px-0 md:px-[60px]">
                    <h1 className="text-3xl md:text-5xl font-extrabold text-[#484C56]">תוצאות חיפוש</h1>
                    <div className="w-[92px] h-1 bg-[#276E4E] my-5"></div>
                </div>

                <div className="flex min-w-0 flex-col gap-6 md:gap-[35px] bg-[#FDFBF6] rounded-[20px] md:rounded-[40px] border border-[#DEDEDE]/70 px-5 md:px-[60px] py-6 md:py-[50px]">
                    {/* Search Input */}
                    <form onSubmit={handleSearchSubmit} aria-describedby="search-mock-notice" className="flex items-center gap-2 rounded-full px-4 py-2 border border-[#484C56] w-full max-w-[430px]" style={{ backgroundColor: 'transparent' }}>
                        <input
                            type="search"
                            placeholder="חיפוש"
                            aria-label="חיפוש"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            className="min-w-0 bg-transparent border-none placeholder-[#484C56] text-lg focus:outline-none flex-1"
                        />
                        <button
                            type="submit"
                            aria-label="חיפוש"
                            className="w-[20px] shrink-0 flex items-center justify-center cursor-pointer"
                        >
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15.75 15.75L12.4875 12.4875M14.25 8.25C14.25 11.5637 11.5637 14.25 8.25 14.25C4.93629 14.25 2.25 11.5637 2.25 8.25C2.25 4.93629 4.93629 2.25 8.25 2.25C11.5637 2.25 14.25 4.93629 14.25 8.25Z" stroke="#484C56" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </form>

                    <p id="search-mock-notice" role="note" className="rounded-xl border border-[#E9C863] bg-white p-4 text-sm md:text-base text-[#484C56]">
                        הכרטיסים שלהלן הם תוכן דמה קבוע מהאתר המקורי, ולא תוצאות חיפוש. העמוד אינו מחובר לשירות חיפוש, והכרטיסים אינם מסוננים לפי השאילתה.
                    </p>

                    {/* Search Results */}
                    <div className="flex flex-col gap-5">
                        {/* Display the search term in the results */}
                        {searchValue && (
                            <div className="mb-4">
                                <p className="break-words text-[#484C56] text-lg">
                                    תוצאות חיפוש עבור: <strong>"{searchValue}"</strong>
                                </p>
                            </div>
                        )}

                        <div className="flex flex-col md:flex-row gap-4 md:gap-0 justify-between items-start border border-[#E9C863] bg-white rounded-[20px] p-5 md:p-[30px] pb-6 md:pb-[60px]">
                            <div className="flex min-w-0 flex-col gap-4">
                                <h2 className='text-[#276E4E] text-xl md:text-[26px] font-extrabold'>תחזית משק האנרגיה</h2>
                                <p className='text-[#484C56] text-base md:text-xl font-normal'>יתרונות וחסרונות של <strong>משק האנרגיה</strong> פה יהיה כתוב כל מה שיש בטול טיפ עד לגרף ואז  שלוש נקודות </p>
                            </div>
                            <Link className='text-[#358BFF] text-sm font-bold flex items-center gap-2 w-max shrink-0' href="/predictions">מעבר לעמוד <ChevronLeft /></Link>
                        </div>
                        <div className="flex flex-col md:flex-row gap-4 md:gap-0 justify-between items-start border border-[#E9C863] bg-white rounded-[20px] p-5 md:p-[30px] pb-6 md:pb-[60px]">
                            <div className="flex min-w-0 flex-col gap-4">
                                <h2 className='text-[#276E4E] text-xl md:text-[26px] font-extrabold'>משק אנרגיות מתחדשות</h2>
                                <p className='text-[#484C56] text-base md:text-xl font-normal'>יתרונות וחסרונות של <strong>משק האנרגיה</strong> פה יהיה כתוב כל מה שיש בטול טיפ עד לגרף ואז  שלוש נקודות </p>
                            </div>
                            <Link className='text-[#358BFF] text-sm font-bold flex items-center gap-2 w-max shrink-0' href="/renewable-energy">מעבר לעמוד <ChevronLeft /></Link>
                        </div>
                        <div className="flex flex-col md:flex-row gap-4 md:gap-0 justify-between items-start border border-[#E9C863] bg-white rounded-[20px] p-5 md:p-[30px] pb-6 md:pb-[60px]">
                            <div className="flex min-w-0 flex-col gap-4">
                                <h2 className='text-[#276E4E] text-xl md:text-[26px] font-extrabold'>אנרגיות מתחדשות - ייצור בפועל</h2>
                                <p className='text-[#484C56] text-base md:text-xl font-normal'>יתרונות וחסרונות של <strong>משק האנרגיה</strong> פה יהיה כתוב כל מה שיש בטול טיפ עד לגרף ואז  שלוש נקודות </p>
                            </div>
                            <Link className='text-[#358BFF] text-sm font-bold flex items-center gap-2 w-max shrink-0' href="/renewable-energy#renewable-production">מעבר לעמוד <ChevronLeft /></Link>
                        </div>
                    </div>
                </div>
            </div>

            <InterestPage />
        </div>
    );
}