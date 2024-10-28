import axios from 'axios';

export default async function handler(req, res) {
    const { query, sort, offset = 0, period } = req.query;
    let sortParameter;

    // Definir o parâmetro de ordenação baseado no valor de `sort`
    switch (sort) {
        case 'price_asc':
            sortParameter = '_sort=price&order=asc';
            break;
        case 'price_desc':
            sortParameter = '_sort=price&order=desc';
            break;
        case '1d':
        case '7d':
        case '30d':
            // Usar o filtro de período para obter mais vendidos
            sortParameter = `sold_quantity:desc&start_time=-${period}`;
            break;
        default:
            sortParameter = 'relevance';
    }

    try {
        // Fazer a requisição à API do Mercado Livre com base nos parâmetros de busca
        const response = await axios.get(`https://api.mercadolibre.com/sites/MLB/search`, {
            params: {
                q: query,
                sort: sortParameter,
                offset,
                limit: 10
            }
        });

        const products = response.data.results.map((product) => ({
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.thumbnail,
            link: product.permalink
        }));

        res.status(200).json({
            products,
            totalPages: Math.ceil(response.data.paging.total / 10)
        });
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        res.status(500).json({ error: 'Erro ao buscar produtos.' });
    }
}
