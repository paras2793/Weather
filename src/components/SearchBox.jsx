
function SearchBox({ city, setCity, onSearch, loading }) {
  function handleSubmit(event) {
    event.preventDefault();
    onSearch();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full items-center gap-2 rounded-full border border-slate-200 bg-slate-50 p-2 transition focus-within:border-slate-400"
    >
      <input
        type="text"
        value={city}
        onChange={(event) => setCity(event.target.value)}
        placeholder="Search for places..."
        className="w-full min-w-0 bg-transparent px-4 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400"
      />

      <button
        type="submit"
        disabled={loading || city.trim() === ""}
        aria-label="Search weather"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        ⌕
      </button>
    </form>
  );
}

export default SearchBox;