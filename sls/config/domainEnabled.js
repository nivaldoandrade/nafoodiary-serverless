module.exports = {
  enabled: Boolean(process.env.API_DOMAIN_NAME && process.env.API_CERTIFICATE_ARN),
};
