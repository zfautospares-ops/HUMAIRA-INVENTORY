// Expenses API endpoint
import { readData, writeData } from './_utils';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const expenses = await readData('expenses');

        switch (req.method) {
            case 'GET':
                return res.status(200).json(expenses);

            case 'POST':
                const newExpense = {
                    ...req.body,
                    createdAt: new Date().toISOString()
                };
                expenses.push(newExpense);
                await writeData('expenses', expenses);
                return res.status(201).json(newExpense);

            case 'DELETE':
                const deleteId = req.query.id;
                const filtered = expenses.filter(exp => exp.id !== deleteId);
                if (filtered.length === expenses.length) {
                    return res.status(404).json({ error: 'Expense not found' });
                }
                await writeData('expenses', filtered);
                return res.status(200).json({ message: 'Expense deleted' });

            default:
                return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Expenses API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
