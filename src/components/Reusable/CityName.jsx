
async function citycalling(searchTerm, signal) {
  const url = new URL("/api/cities", window.location.origin);

  url.searchParams.set("search", searchTerm);

  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();

  return data;
}

export default citycalling;
