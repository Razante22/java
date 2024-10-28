import axios from 'axios';

export default async function handler(req, res) {
    const { query, sort, offset, period } = req.query;

    const sortOptions = {
        'price_asc': 'price_asc',
        'price_desc': 'price_desc',
        'relevance': 'best_selling',
        '1d': 'sold_quantity', // Simulação para "1 dia"
        '7d': 'sold_quantity', // Simulação para "7 dias"
        '30d': 'sold_quantity' // Simulação para "30 dias"
    };

    const url = `https://api.mercadolibre.com/sites/MLB/search?q=${query}&sort=${sortOptions[sort] || ''}&offset=${offset || 0}&limit=10`;

    try {
        const response = await axios.get(url);
        const { results, paging } = response.data;

        // Filtrando localmente por períodos, caso necessário
        let products = results.map(product => ({
            title: product.title,
            price: product.price.toFixed(2).replace('.', ','),
            link: product.permalink,
            image: product.thumbnail || 'https://via.placeholder.com/150',
            sold_quantity: product.sold_quantity // Adicionando para possível filtragem
        }));

        if (['1d', '7d', '30d'].includes(period)) {
            const currentDate = new Date();
            const daysAgo = period === '1d' ? 1 : period === '7d' ? 7 : 30;

            products = products.filter(product => {
                const soldDate = new Date(product.sold_date);
                return (currentDate - soldDate) / (1000 * 60 * 60 * 24) <= daysAgo;
            });
        }

        res.status(200).json({
            products,
            totalPages: Math.ceil(paging.total / 10),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar produtos.' });
    }
}
