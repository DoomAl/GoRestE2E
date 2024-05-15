import 'dotenv/config';

const requiredEnvVars = [
    'BASE_URL',
    'TOKEN'
];

// Check if all required environment variables are set
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}
