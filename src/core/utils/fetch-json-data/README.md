# 🧰 Fetch Json Data

Wrapper around `fetch` focused on getting json data, including multiple features:
- 🛡️ Secure parsing of json data (throws an error if data is unsafe)
- ✅ Custom data validation for every access (throws an error if data does not satisfy provided validators)
- 🗃️ Granular control over caching strategy per request, using the browser's Cache API.
- ⏱️ Handling of requests timeout duration, and automatic retries

