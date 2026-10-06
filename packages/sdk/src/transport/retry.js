/**
 * Retries an async operation with exponential backoff and jitter.
 * @param {function} fn - Async operation to execute
 * @param {object} options
 * @param {number} [options.retries=2] - Max retries
 * @param {number} [options.baseDelay=500] - Base delay in ms
 * @param {number} [options.maxDelay=3000] - Max delay in ms
 * @returns {Promise<any>}
 */
export async function withRetry(fn, { retries = 2, baseDelay = 500, maxDelay = 3000 } = {}) {
  let attempt = 0;

  while (attempt <= retries) {
    try {
      return await fn();
    } catch (err) {
      if (attempt >= retries) {
        throw err;
      }

      attempt += 1;
      const delay = Math.min(
        maxDelay,
        baseDelay * Math.pow(2, attempt - 1) + Math.random() * 200
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

export default withRetry;
