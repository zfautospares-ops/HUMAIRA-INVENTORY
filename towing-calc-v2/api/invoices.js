// Invoices API endpoint
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
        const invoices = await readData('invoices');
        const url = new URL(req.url, `http://${req.headers.host}`);
        const id = url.searchParams.get('id');

        switch (req.method) {
            case 'GET':
                if (id) {
                    const invoice = invoices.find(inv => inv.id === id);
                    if (!invoice) {
                        return res.status(404).json({ error: 'Invoice not found' });
                    }
                    return res.status(200).json(invoice);
                }
                return res.status(200).json(invoices);

            case 'POST':
                const newInvoice = {
                    ...req.body,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                invoices.push(newInvoice);
                await writeData('invoices', invoices);
                return res.status(201).json(newInvoice);

            case 'PUT':
                if (!id) {
                    return res.status(400).json({ error: 'ID required' });
                }
                const index = invoices.findIndex(inv => inv.id === id);
                if (index === -1) {
                    return res.status(404).json({ error: 'Invoice not found' });
                }
                invoices[index] = {
                    ...invoices[index],
                    ...req.body,
                    updatedAt: new Date().toISOString()
                };
                await writeData('invoices', invoices);
                return res.status(200).json(invoices[index]);

            case 'DELETE':
                if (!id) {
                    return res.status(400).json({ error: 'ID required' });
                }
                const filtered = invoices.filter(inv => inv.id !== id);
                if (filtered.length === invoices.length) {
                    return res.status(404).json({ error: 'Invoice not found' });
                }
                await writeData('invoices', filtered);
                return res.status(200).json({ message: 'Invoice deleted' });

            default:
                return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Invoice API error:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
