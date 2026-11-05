async function citycalling() {
    try {
        const cityApiUrl = import.meta.env.VITE_CITY_API;

        if (!cityApiUrl) {
            throw new Error("Check your API URL in .env");
        }

        const response = await fetch(cityApiUrl);

        if (!response.ok) {
            throw new Error("Failed to fetch cities");
        }

        const cityData = await response.json();

        return cityData;

    } catch (error) {
        console.error("Error fetching city data:", error);
        return [];
    }
}

export default citycalling;