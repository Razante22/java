import axios from 'axios';

export default async function handler(req, res) {
    const { query, sort, offset } = req.query;

    try {
        const response = await axios.get(`https://api.mercadolibre.com/sites/MLB/search`, {
            params: {
                q: query,
                sort: sort,
                offset: offset,
                limit: 10,
            },
        });

        // Extraindo os dados dos produtos
        const products = response.data.results.map(item => ({
            title: item.title,
            price: item.price,
            images: item.images,
            link: item.permalink,
            soldText: item.sold_quantity > 0 ? `+${item.sold_quantity} vendidos` : 'Nenhum vendido',
            subtitle: item.condition === 'new' ? 'Novo' : 'Usado', // Ajuste para mostrar "Novo" ou "Usado"
            dateCreated: item.date_created, // Data de criação
            lastUpdated: item.last_updated, // Última atualização
        }));

        const totalPages = Math.ceil(response.data.paging.total / 10);

        res.status(200).json({ products, totalPages });
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        res.status(500).json({ error: 'Erro ao buscar produtos.' });
    }
}
