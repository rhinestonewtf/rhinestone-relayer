export const waitForServer = async (
  url: string,
  maxRetries = 10,
  retryDelay = 1000,
) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      // Send a simple request to check if server is responding
      const response = await fetch(url)

      if (response.ok) {
        return true
      }
    } catch (e) {}

    await new Promise((resolve) => setTimeout(resolve, retryDelay))
  }

  throw new Error(`Server failed to initialize after ${maxRetries} attempts`)
}
