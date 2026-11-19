
export default async function handler(req, res) {
  // Allow only GET requests
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  // Read the search query from the frontend
  const search = req.query.search;

  if (!search || typeof search !== "string") {
    return res.status(400).json({
      error: "Search term is required",
    });
  }

  try {
    // Build the CityAPI URL
    const url = new URL("https://api.cityapi.org/v1/cities");
    url.searchParams.set("search", search);

    // Fetch cities from CityAPI
    const response = await fetch(url);

    // Read the API response
    const data = await response.json();

    // Send the response back to the frontend
    return res.status(response.status).json(data);
  } catch (error) {
    console.error("City API error:", error);

    return res.status(500).json({
      error: "Failed to fetch cities",
    });
  }
}
