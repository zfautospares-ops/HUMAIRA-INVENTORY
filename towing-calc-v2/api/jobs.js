// Jobs API endpoint
import { readData, writeData } from './_utils';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const jobs = await readData('jobs');

        switch (req.method) {
            case 'GET':
                return res.status(200).json(jobs);

            case 'POST':
                const newJob = {
                    ...req.body,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                jobs.push(newJob);
                await writeData('jobs', jobs);
                return res.status(201).json(newJob);

            case 'PUT':
                const { id } = req.query;
                const index = jobs.findIndex(job => job.id === id);
                if (index === -1) {
                    return res.status(404).json({ error: 'Job not found' });
                }
                jobs[index] = {
                    ...jobs[index],
                    ...req.body,
                    updatedAt: new Date().toISOString()
                };
                await writeData('jobs', jobs);
                return res.status(200).json(jobs[index]);

            case 'DELETE':
                const deleteId = req.query.id;
                const filtered = jobs.filter(job => job.id !== deleteId);
                if (filtered.length === jobs.length) {
                    return res.status(404).json({ error: 'Job not found' });
                }
                await writeData('jobs', filtered);
                return res.status(200).json({ message: 'Job deleted' });

            default:
                return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Jobs API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
