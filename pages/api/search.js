import axios from 'axios';

export default async function handler(req, res) {
    const { query, sort, offset = 0 } = req.query;

    // Monta a URL base
    const baseUrl = `https://api.mercadolibre.com/sites/MLB/search?q=${query}&offset=${offset}&limit=10`;

    // URLs específicas para os filtros de "Mais Vendidos" por períodos
    const urlMap = {
        '1d': `${baseUrl}&sort=sold_quantity:desc`, // Simulação para vendas em 1 dia
        '7d': `${baseUrl}&sort=sold_quantity:desc`, // Simulação para vendas em 7 dias
        '30d': `${baseUrl}&sort=sold_quantity:desc`, // Simulação para vendas em 30 dias
    };

    // Mapeamento das opções de ordenação
    const sortOptions = {
        'price_asc': 'price_asc',
        'price_desc': 'price_desc',
        'relevance': 'relevance',
        '1d': urlMap['1d'],
        '7d': urlMap['7d'],
        '30d': urlMap['30d']
    };

    // Verifica se é um filtro de data específico e usa a URL mapeada
    const url = sortOptions[sort] || `${baseUrl}&sort=${sortOptions[sort]}`;

    try {
        const response = await axios.get(url);
        const { results, paging } = response.data;

        const products = results.map(product => ({
            title: product.title,
            price: product.price.toFixed(2).replace('.', ','),
            link: product.permalink,
            image: product.thumbnail || 'https://via.placeholder.com/150',
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
