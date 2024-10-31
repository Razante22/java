import axios from 'axios';

export default async function handler(req, res) {
    const { query, sort, offset } = req.query;

    const sortOptions = {
        'price_asc': 'price_asc',
        'price_desc': 'price_desc',
        'relevance': 'relevance',
    };

    const url = `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(query)}&sort=${sortOptions[sort] || 'relevance'}&offset=${offset || 0}&limit=10`;

    try {
        const response = await axios.get(url);
        const { results, paging } = response.data;

        const products = await Promise.all(results.map(async (product) => {
            try {
                const productDetails = await axios.get(`https://api.mercadolibre.com/items/${product.id}`);
                const { sold_quantity, condition, pictures, date_created, last_updated } = productDetails.data;

                // Formatação do texto "Novo  |  +10mil vendidos" ou similar
                const conditionText = condition === 'new' ? 'Novo' : 'Usado';
                const soldText = sold_quantity > 10000 ? `+10mil vendidos` : `${sold_quantity} vendidos`;
                const subtitle = `${conditionText} | ${soldText}`;

                return {
                    title: product.title,
                    price: product.price.toFixed(2).replace('.', ','),
                    link: product.permalink,
                    subtitle: subtitle, // Inclui o texto formatado
                    images: pictures.map((pic) => pic.secure_url),
                    dateCreated: new Date(date_created).toLocaleDateString(),
                    lastUpdated: new Date(last_updated).toLocaleDateString(),
                };
            } catch (error) {
                console.error(`Erro ao obter detalhes do produto ID: ${product.id}`, error);
                return {
                    title: product.title,
                    price: product.price.toFixed(2).replace('.', ','),
                    link: product.permalink,
                    subtitle: 'N/A', // Em caso de erro, usa um valor padrão
                    images: [],
                    dateCreated: 'N/A',
                    lastUpdated: 'N/A',
                };
            }
        }));

        res.status(200).json({
            products,
            totalPages: Math.ceil(paging.total / 10),
        });
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        res.status(500).json({ error: 'Erro ao buscar produtos.' });
    }
}
