import axios from 'axios';


const TOKEN = process.env.WORKFLOW_TOKEN;
async function fetchProcessInstanceResult(processInstanceId) {
    try {
        const url = `https://ig.mobiusdtaas.ai/bob-history-consumer/engine-rest/history/process-instance?processInstanceId=${processInstanceId}`;

        const headers = {
            'accept': 'application/json',
            'accept-language': 'en-US,en;q=0.9',
            'content-type': 'application/json',
            'origin': 'https://bob-cockpit.mobiusdtaas.ai',
            'priority': 'u=1, i',
            'referer': 'https://bob-cockpit.mobiusdtaas.ai/',
            'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Linux"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site',
            'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
            'x-xsrf-token': '6A9D0D173682F9544038BB8E9FC15D28',
            'Authorization': `Bearer ${TOKEN}`
        };

        const response = await axios.get(url, { headers });
        return response.data;
    } catch (error) {
        console.error("Error fetching process instance result:", error);
        throw error;
    }
}
export {fetchProcessInstanceResult};