function SearchBox({ city, setCity, onSearch, loading }) {
  function handleSubmit(event) {
    event.preventDefault();
    onSearch();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full items-center gap-2 rounded-full bg-gray-100 p-2"
    >

      <input
        type="text"
        value={city}
        onChange={(event) => setCity(event.target.value)}
        placeholder="Search for places ..."
        className="w-full bg-transparent p-2 text-sm text-gray-900 outline-none"
      />

      <button
        type="submit"
        disabled={loading || city.trim() === ""}
        aria-label="Search weather"
        className="rounded-full bg-white px-4 py-2 text-gray-900 shadow-sm disabled:opacity-40"
      >
        🔍
      </button>
    </form>
  );
}

export default SearchBox;