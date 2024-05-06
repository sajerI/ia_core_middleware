const express = require('express');
const axios = require('axios');
const cors = require('cors');
const request = require('request-promise');

const app = express();
const port = process.env.PORT || 3006;

app.use(cors());
// Parse JSON in the request body
app.use(express.json());

// Define the route
app.post('/api/dataPost', async (req, res) => {
    try {
        // Get OAuth token (replace with your actual credentials)
        const clientId = "sb-67e52b8b-1896-4b13-a034-ea36ccd159db!b189146|aicore!b540";
        const clientSecret = "74828b71-0472-4dbe-9d3f-cac37bfd5fd5$t6vvEdTY46UM-dDJYQMkrog8VCYpc6tiJfv1wyRI_AI=";

        const token = await getOAuthToken(clientId, clientSecret);

        // Make AI API call
        const response = await axios.post(
            'https://api.ai.prod.eu-central-1.aws.ml.hana.ondemand.com/v2/inference/deployments/d001fd66e8181920/v2/predict',
            req.body,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'ai-resource-group': 'default',
                    'Content-Type': 'application/json',
                },
            }
        );

        //res.status(200).json({ success: 'Data Ingestion completed' });   response.data[0]
        res.status(200).json(response.data[0]); 
    } catch (error) {
        console.error('Error with API request:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

async function getOAuthToken(clientId, clientSecret) {
    const tokenUrl = 'https://tietoawsoffdev.authentication.eu10.hana.ondemand.com/oauth/token';

    try {
        const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

        // Make a POST request to the token endpoint using request-promise
        const response = await request.post({
            uri: tokenUrl,
            form: {
                grant_type: 'client_credentials',
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${credentials}`,
            },
            json: true, // Automatically parses the response body as JSON
        });

        // Check if the request was successful (status code 200)
        if (response) {
            // Access token is available in the response data
            const accessToken = response.access_token;
            return accessToken;
        } else {
            // Print the error details if the request was not successful
            console.error(`Error: ${response.status} - ${response.error_description}`);
            return null;
        }
    } catch (error) {
        // Handle exceptions, e.g., network errors
        console.error(`Error: ${error.message}`);
        return null;
    }
}
