async function citycalling(searchTerm, signal) {
  const baseUrl = import.meta.env.VITE_CITY_API;
  console.log("CITY API URL:", baseUrl);

  const url = new URL(baseUrl, window.location.origin);
  url.searchParams.set("search", searchTerm);
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

export default citycalling;