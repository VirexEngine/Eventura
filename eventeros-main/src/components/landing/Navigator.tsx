import { useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

export const Navigator = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const handleSearchToggle = () => setSearchOpen(!searchOpen);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchValue(e.target.value);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchValue);
  };
  const goPrevious = () => console.log("Previous");
  const goNext = () => console.log("Next");

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50">
      <div className="mb-6 flex items-center justify-between gap-3 bg-white/5 backdrop-blur-md p-2 rounded-full border border-white/10 shadow-2xl">
        <div className="flex items-center gap-2">
          {searchOpen && (
            <form onSubmit={handleSubmit} className="flex-1">
              <label htmlFor="navigator-search" className="sr-only">
                Search navigator
              </label>
              <input
                id="navigator-search"
                type="text"
                value={searchValue}
                onChange={handleChange}
                placeholder="Search…"
                className="w-full rounded-full border border-zinc-200 bg-white py-2 pl-3 pr-4 text-sm text-zinc-900 outline-none shadow-sm placeholder:text-zinc-400 transition dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
            </form>
          )}

          <button
            type="button"
            onClick={handleSearchToggle}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-white shadow-sm transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200"
            aria-label="Toggle search"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goPrevious}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-900 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Previous navigator"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={goNext}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-900 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Next navigator"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
