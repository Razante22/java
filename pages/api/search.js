import axios from 'axios';

export default async function handler(req, res) {
    const { query, sort, offset } = req.query;

    const sortOptions = {
        'price_asc': 'price_asc',
        'price_desc': 'price_desc',
        'relevance': 'best_selling',
    };

    const now = new Date();
    let filterDate;

    // Adiciona um filtro de data baseado no sort selecionado
    switch (sort) {
        case 'best_selling_1d':
            filterDate = new Date(now);
            filterDate.setDate(now.getDate() - 1);
            break;
        case 'best_selling_7d':
            filterDate = new Date(now);
            filterDate.setDate(now.getDate() - 7);
            break;
        case 'best_selling_30d':
            filterDate = new Date(now);
            filterDate.setDate(now.getDate() - 30);
            break;
        default:
            filterDate = null;
            break;
    }

    // Formata a data para o padrão YYYY-MM-DD
    const formattedDate = filterDate ? filterDate.toISOString().split('T')[0] : null;
    const dateFilter = formattedDate ? `&since=${formattedDate}` : '';

    const url = `https://api.mercadolibre.com/sites/MLB/search?q=${query}&sort=${sortOptions[sort] || ''}${dateFilter}&offset=${offset || 0}&limit=10`;

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
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar produtos.' });
    }
}
