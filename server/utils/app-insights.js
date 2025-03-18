const appInsights = require('applicationinsights');

// Only set up Application Insights if connection string is provided
if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
  appInsights.setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
    .setAutoDependencyCorrelation(true)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true, true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectConsole(true)
    .setUseDiskRetryCaching(true)
    .start();
}

// Export utility methods for manual tracking
module.exports = {
  /**
   * Get the default Application Insights client
   * @returns {Object} Application Insights client or null
   */
  getClient: () => {
    return appInsights.defaultClient || null;
  },

  /**
   * Track a custom event
   * @param {string} eventName - Name of the event
   * @param {Object} [properties] - Additional properties to track
   */
  trackEvent: (eventName, properties = {}) => {
    const client = appInsights.defaultClient;
    if (client) {
      client.trackEvent({
        name: eventName,
        properties: properties
      });
    }
  },

  /**
   * Track an exception
   * @param {Error} error - Error object to track
   * @param {Object} [properties] - Additional properties for context
   */
  trackException: (error, properties = {}) => {
    const client = appInsights.defaultClient;
    if (client) {
      client.trackException({
        exception: error,
        properties: properties
      });
    }
  },

  /**
   * Track a custom metric
   * @param {string} metricName - Name of the metric
   * @param {number} value - Metric value
   * @param {Object} [properties] - Additional properties
   */
  trackMetric: (metricName, value, properties = {}) => {
    const client = appInsights.defaultClient;
    if (client) {
      client.trackMetric({
        name: metricName,
        value: value,
        properties: properties
      });
    }
  },

  /**
   * Log a message
   * @param {string} message - Message to log
   * @param {string} [severity] - Severity level
   */
  trackTrace: (message, severity = 'INFO') => {
    const client = appInsights.defaultClient;
    if (client) {
      client.trackTrace({
        message: message,
        severity: appInsights.Contracts.SeverityLevel[severity]
      });
    }
  }
};