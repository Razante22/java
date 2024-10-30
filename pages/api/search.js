import axios from 'axios';

export default async function handler(req, res) {
    const { query, sort, offset } = req.query;

    const sortOptions = {
        'price_asc': 'price_asc',
        'price_desc': 'price_desc',
        'relevance': 'relevance', // Mantido como 'relevance'
    };

    const url = `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(query)}&sort=${sortOptions[sort] || 'relevance'}&offset=${offset || 0}&limit=10`;

    try {
        const response = await axios.get(url);
        const { results, paging } = response.data;

        // Obter detalhes adicionais para cada produto
        const productDetails = await Promise.all(results.map(async (product) => {
            const detailsUrl = `https://api.mercadolibre.com/items/${product.id}`;
            const productDetailsResponse = await axios.get(detailsUrl);

            const { date_created, last_updated } = productDetailsResponse.data;

            return {
                title: product.title,
                price: product.price.toFixed(2).replace('.', ','),
                link: product.permalink,
                image: product.thumbnail || 'https://via.placeholder.com/150',
                dateCreated: new Date(date_created).toLocaleDateString('pt-BR'),
                lastUpdated: new Date(last_updated).toLocaleDateString('pt-BR'),
            };
        }));

        res.status(200).json({
            products: productDetails,
            totalPages: Math.ceil(paging.total / 10),
        });
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        res.status(500).json({ error: 'Erro ao buscar produtos.' });
    }
}
