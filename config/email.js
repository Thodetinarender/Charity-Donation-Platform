const SibApiV3Sdk = require('sib-api-v3-sdk');

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY; // Set this in your .env file

const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();

module.exports = emailApi;
