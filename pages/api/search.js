import axios from 'axios';

export default async function handler(req, res) {
    const { query, sort, offset = 0 } = req.query;

    // Mapeamento das opções de ordenação
    const sortOptions = {
        'price_asc': 'price_asc',
        'price_desc': 'price_desc',
        'relevance': 'relevance',
        '1d': 'sold_quantity:desc', // Opção para mais vendidos em 1 dia
        '7d': 'sold_quantity:desc', // Opção para mais vendidos em 7 dias
        '30d': 'sold_quantity:desc' // Opção para mais vendidos em 30 dias
    };

    // Montar a URL da requisição com base no filtro escolhido
    const url = `https://api.mercadolibre.com/sites/MLB/search?q=${query}&sort=${sortOptions[sort] || ''}&offset=${offset}&limit=10`;

    try {
        const response = await axios.get(url);
        const { results, paging } = response.data;

        // Mapear os produtos para o formato desejado
        const products = results.map(product => ({
            title: product.title,
            price: product.price.toFixed(2).replace('.', ','),
            link: product.permalink,
            image: product.thumbnail || 'https://via.placeholder.com/150',
        }));

        // Retornar os produtos e o número total de páginas calculado
        res.status(200).json({
            products,
            totalPages: Math.ceil(paging.total / 10),
        });
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        res.status(500).json({ error: 'Erro ao buscar produtos.' });
    }
}
